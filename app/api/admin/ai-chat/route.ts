import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { callLLM, parseToolCalls, executeTool, AiMessage, SYSTEM_PROMPT, ToolResult } from '@/lib/ai-engine'

const MAX_TOOL_LOOPS = 3

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isSuperAdmin: true } })
    if (!user?.isSuperAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { message, chatId, history = [] } = body

    const config = await prisma.aiAssistantConfig.findFirst()
    if (!config?.isEnabled || !config.apiKey) {
      return NextResponse.json({ error: 'AI ยังไม่ได้ตั้งค่า API Key' }, { status: 400 })
    }

    let messages: AiMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-20),
      { role: 'user', content: message },
    ]

    let finalText = ''
    let allToolResults: ToolResult[] = []
    let loopCount = 0
    let lastAssistantContent = ''

    // Loop: call AI → execute tools → feed results back → repeat until done or max loops
    while (loopCount < MAX_TOOL_LOOPS) {
      const assistantContent = await callLLM(messages, config.apiKey, config.baseUrl, config.model)
      lastAssistantContent = assistantContent

      const { text, tools } = parseToolCalls(assistantContent)

      if (tools.length === 0) {
        // No tool calls — AI is done (or just talking)
        finalText = text || assistantContent
        break
      }

      // Execute all tools
      const toolResults: ToolResult[] = []
      for (const t of tools) {
        const result = await executeTool(t.tool, t.params)
        toolResults.push(result)
      }
      allToolResults.push(...toolResults)

      // Prepare tool results for next AI call
      const toolResultMessages = toolResults.map(r =>
        `<tool_result tool="${r.tool}" success="${r.success}">\n${r.output}\n</tool_result>`
      ).join('\n')

      // Update messages for next loop
      messages = [
        ...messages,
        { role: 'assistant', content: assistantContent },
        { role: 'user', content: `ผลลัพธ์จากการรันคำสั่ง:\n${toolResultMessages}\n\nถ้างานยังไม่เสร็จ ให้ใส่ <tool_call> ต่อทันที อย่าหยุดกลางคัน ถ้าเสร็จแล้วให้สรุปสั้นๆ` },
      ]

      loopCount++
    }

    // If max loops reached and still had tool calls
    if (loopCount >= MAX_TOOL_LOOPS && parseToolCalls(lastAssistantContent).tools.length > 0) {
      finalText = '⚠️ AI ทำงานครบ ' + MAX_TOOL_LOOPS + ' รอบแล้ว ถ้ายังไม่เสร็จให้พิมพ์ "ทำต่อ" เพื่อสั่งงานต่อ'
    }

    // Save chat
    let chat = chatId ? await prisma.aiChat.findUnique({ where: { id: chatId } }) : null
    const newMessages = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: finalText, tools: allToolResults },
    ]
    if (chat) {
      chat = await prisma.aiChat.update({
        where: { id: chat.id },
        data: { messages: newMessages as any, updatedAt: new Date() },
      })
    } else {
      chat = await prisma.aiChat.create({
        data: { title: message.slice(0, 40) + (message.length > 40 ? '...' : ''), messages: newMessages as any },
      })
    }

    return NextResponse.json({ success: true, reply: finalText, tools: allToolResults, chatId: chat.id, loops: loopCount })
  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: error?.message || 'AI ตอบสนองล้มเหลว' }, { status: 500 })
  }
}
