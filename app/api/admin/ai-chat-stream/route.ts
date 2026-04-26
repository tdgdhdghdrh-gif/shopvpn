import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { callLLM, parseToolCalls, executeTool, AiMessage, SYSTEM_PROMPT, ToolResult } from '@/lib/ai-engine'
import { readFileSync } from 'fs'

const MAX_TOOL_LOOPS = 5

function sendEvent(controller: ReadableStreamDefaultController, data: any) {
  controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'))
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.isLoggedIn) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }) + '\n', { status: 401 })
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isSuperAdmin: true } })
  if (!user?.isSuperAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }) + '\n', { status: 403 })
  }

  const body = await request.json()
  const { message, history = [] } = body

  const config = await prisma.aiAssistantConfig.findFirst()
  if (!config?.isEnabled || !config.apiKey) {
    return new Response(JSON.stringify({ error: 'AI ยังไม่ได้ตั้งค่า API Key' }) + '\n', { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let messages: AiMessage[] = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.slice(-20),
          { role: 'user', content: message },
        ]

        let finalText = ''
        let allToolResults: ToolResult[] = []
        let loopCount = 0

        sendEvent(controller, { type: 'start', message: 'AI กำลังวิเคราะห์คำสั่ง...' })

        while (loopCount < MAX_TOOL_LOOPS) {
          sendEvent(controller, { type: 'thinking', content: loopCount === 0 ? 'กำลังวางแผน...' : 'กำลังประมวลผลผลลัพธ์...' })

          const assistantContent = await callLLM(messages, config.apiKey, config.baseUrl, config.model)
          const { text, tools } = parseToolCalls(assistantContent)

          // Show AI's thinking/plan
          if (text && text.length > 10) {
            sendEvent(controller, { type: 'plan', content: text.slice(0, 500) })
          }

          if (tools.length === 0) {
            finalText = text || assistantContent
            break
          }

          // Execute tools one by one with real-time updates
          sendEvent(controller, { type: 'tools_count', count: tools.length })

          const toolResults: ToolResult[] = []
          for (let ti = 0; ti < tools.length; ti++) {
            const t = tools[ti]
            const fileHint = t.params.filePath || t.params.dirPath || t.params.command || ''

            // Capture old content for diff before editing
            let oldContent = ''
            if ((t.tool === 'edit_file' || t.tool === 'write_file') && t.params.filePath) {
              try {
                oldContent = readFileSync(t.params.filePath, 'utf-8')
              } catch {}
            }

            sendEvent(controller, {
              type: 'tool_start',
              index: ti + 1,
              total: tools.length,
              tool: t.tool,
              filePath: fileHint,
            })

            const result = await executeTool(t.tool, t.params)
            toolResults.push(result)

            sendEvent(controller, {
              type: 'tool_done',
              index: ti + 1,
              total: tools.length,
              tool: t.tool,
              success: result.success,
              filePath: fileHint,
              outputPreview: result.output.slice(0, 120),
            })

            // Stream file content line-by-line for write_file / edit_file
            if ((t.tool === 'write_file' || t.tool === 'edit_file') && result.success && t.params.filePath) {
              try {
                const newContent = readFileSync(t.params.filePath, 'utf-8')
                const lines = newContent.split('\n')

                sendEvent(controller, {
                  type: 'file_open',
                  filePath: t.params.filePath,
                  isNew: t.tool === 'write_file',
                  oldContent: oldContent.slice(0, 5000),
                })

                let streamed = ''
                for (let li = 0; li < lines.length; li++) {
                  streamed += lines[li] + (li < lines.length - 1 ? '\n' : '')
                  sendEvent(controller, {
                    type: 'code_chunk',
                    filePath: t.params.filePath,
                    line: li + 1,
                    totalLines: lines.length,
                    content: streamed,
                    fullContent: newContent,
                  })
                  // Small delay to create typing effect (skip if very large)
                  if (lines.length < 300) await sleep(8)
                }

                sendEvent(controller, {
                  type: 'file_done',
                  filePath: t.params.filePath,
                  totalLines: lines.length,
                })
              } catch {}
            }
          }

          allToolResults.push(...toolResults)

          // Prepare next loop
          const toolResultMessages = toolResults.map(r =>
            `<tool_result tool="${r.tool}" success="${r.success}">\n${r.output}\n</tool_result>`
          ).join('\n')

          messages = [
            ...messages,
            { role: 'assistant', content: assistantContent },
            { role: 'user', content: `ผลลัพธ์จากการรันคำสั่ง:\n${toolResultMessages}\n\nถ้างานยังไม่เสร็จ ให้ใส่ <tool_call> ต่อทันที อย่าหยุดกลางคัน ถ้าเสร็จแล้วให้สรุปสั้นๆ` },
          ]

          loopCount++
        }

        if (loopCount >= MAX_TOOL_LOOPS) {
          finalText = '⚠️ AI ทำงานครบ ' + MAX_TOOL_LOOPS + ' รอบแล้ว ถ้ายังไม่เสร็จให้พิมพ์ "ทำต่อ" เพื่อสั่งงานต่อ'
        }

        // Save chat
        const newMessages = [
          ...history,
          { role: 'user', content: message },
          { role: 'assistant', content: finalText, tools: allToolResults },
        ]
        const chat = await prisma.aiChat.create({
          data: { title: message.slice(0, 40) + (message.length > 40 ? '...' : ''), messages: newMessages as any },
        })

        sendEvent(controller, { type: 'done', reply: finalText, chatId: chat.id, loops: loopCount })
        controller.close()
      } catch (err: any) {
        sendEvent(controller, { type: 'error', error: err.message || 'เกิดข้อผิดพลาด' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
