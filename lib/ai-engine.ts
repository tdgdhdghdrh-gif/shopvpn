import { prisma } from './prisma'
import https from 'https'

export interface AiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ToolResult {
  tool: string
  success: boolean
  output: string
}

export const SYSTEM_PROMPT = `You are an expert web developer assistant for a Next.js VPN shop project located at /root/shop-minimal.

=== CRITICAL RULES ===
1. NEVER modify /app/admin/update-site or /app/api/admin/update-site/* — OFF-LIMITS.
2. NEVER delete .git, node_modules, or .env files.
3. Use minimal changes — edit only what's necessary.
4. Prefer \`edit_file\` over \`write_file\` for existing files.
5. All file paths must be absolute: /root/shop-minimal/...
6. Use Thai language for UI text unless user asks otherwise.
7. DO NOT STOP halfway. If the task requires multiple steps, execute ALL steps in ONE response using multiple <tool_call> blocks.
8. After ALL changes are done, you MUST run \`run_command\` with "npx next build" to verify.
9. DO NOT write explanations before tool calls. Output tool calls FIRST, then a brief summary.
10. If you are unsure about a file's content, READ it first with \`read_file\` or \`list_files\`.

=== TOOL FORMAT (STRICT) ===
Every time you need to act, you MUST use <tool_call> blocks in this exact format:

<tool_call>
{"tool": "read_file", "params": {"filePath": "/root/shop-minimal/app/some-file.tsx"}}
</tool_call>

<tool_call>
{"tool": "edit_file", "params": {"filePath": "/root/shop-minimal/app/some-file.tsx", "oldString": "exact old text", "newString": "exact new text"}}
</tool_call>

<tool_call>
{"tool": "write_file", "params": {"filePath": "/root/shop-minimal/app/new-file.tsx", "content": "full file content"}}
</tool_call>

<tool_call>
{"tool": "list_files", "params": {"dirPath": "/root/shop-minimal/app/admin"}}
</tool_call>

<tool_call>
{"tool": "run_command", "params": {"command": "npx next build", "description": "Build Next.js"}}
</tool_call>

=== WORKFLOW ===
1. User gives a task.
2. You immediately output ALL necessary <tool_call> blocks to complete the task.
3. Tools execute in order.
4. You receive results.
5. If results show errors or more work is needed, you MUST output MORE <tool_call> blocks to fix them.
6. Only stop when the task is 100% complete AND build passes (if code was changed).
7. NEVER say "I will do this" without actually outputting <tool_call> blocks.

Project stack: Next.js 16 (App Router), Prisma ORM, PostgreSQL, Tailwind CSS, TypeScript, Lucide React icons.`

function isGemini(baseUrl: string): boolean {
  return baseUrl.includes('generativelanguage.googleapis.com')
}

// ─── Call LLM (supports both OpenAI-compatible & Gemini) ───
export async function callLLM(messages: AiMessage[], apiKey: string, baseUrl: string, model: string): Promise<string> {
  if (isGemini(baseUrl)) {
    return callGemini(messages, apiKey, baseUrl, model)
  }
  return callOpenAICompatible(messages, apiKey, baseUrl, model)
}

// ─── Gemini API ───
async function callGemini(messages: AiMessage[], apiKey: string, baseUrl: string, model: string): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system')
  const chatMessages = messages.filter(m => m.role !== 'system')

  const contents = chatMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const body: any = { contents }
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] }
  }

  const payload = JSON.stringify(body)
  const path = `/v1beta/models/${model}:generateContent?key=${apiKey}`

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 120000,
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.error) {
              reject(new Error(json.error.message || JSON.stringify(json.error)))
              return
            }
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
            if (!text) {
              reject(new Error('Empty Gemini response: ' + data.slice(0, 300)))
              return
            }
            resolve(text)
          } catch {
            reject(new Error('Invalid Gemini response: ' + data.slice(0, 300)))
          }
        })
      }
    )

    req.on('error', (err) => reject(err))
    req.on('timeout', () => { req.destroy(); reject(new Error('Gemini timeout')) })
    req.write(payload)
    req.end()
  })
}

// ─── OpenAI-compatible API ───
async function callOpenAICompatible(messages: AiMessage[], apiKey: string, baseUrl: string, model: string): Promise<string> {
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/chat/completions`)
  const payload = JSON.stringify({
    model,
    messages,
    temperature: 0.2,
    max_tokens: 8192,
    stream: false,
  })

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 120000,
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.error) {
              reject(new Error(json.error.message || JSON.stringify(json.error)))
              return
            }
            const content = json.choices?.[0]?.message?.content || ''
            resolve(content)
          } catch {
            reject(new Error('Invalid LLM response: ' + data.slice(0, 300)))
          }
        })
      }
    )

    req.on('error', (err) => reject(err))
    req.on('timeout', () => { req.destroy(); reject(new Error('LLM timeout')) })
    req.write(payload)
    req.end()
  })
}

// ─── Parse tool calls ───
export function parseToolCalls(content: string): { text: string; tools: { tool: string; params: any }[] } {
  const toolRegex = /<tool_call>\s*({[\s\S]*?})\s*<\/tool_call>/g
  const tools: { tool: string; params: any }[] = []
  let match
  while ((match = toolRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1])
      if (parsed.tool && parsed.params) tools.push(parsed)
    } catch {}
  }
  const text = content.replace(toolRegex, '').trim()
  return { text, tools }
}

// ─── Execute tool ───
export async function executeTool(tool: string, params: any): Promise<ToolResult> {
  try {
    switch (tool) {
      case 'read_file': {
        const fs = await import('fs/promises')
        const filePath = sanitizePath(params.filePath)
        const content = await fs.readFile(filePath, 'utf-8')
        return { tool, success: true, output: content.slice(0, 8000) + (content.length > 8000 ? '\n... (truncated)' : '') }
      }
      case 'write_file': {
        const fs = await import('fs/promises')
        const filePath = sanitizePath(params.filePath)
        const dir = filePath.split('/').slice(0, -1).join('/')
        await fs.mkdir(dir, { recursive: true })
        await fs.writeFile(filePath, params.content, 'utf-8')
        return { tool, success: true, output: `Created/Overwritten: ${filePath}` }
      }
      case 'edit_file': {
        const fs = await import('fs/promises')
        const filePath = sanitizePath(params.filePath)
        let content = await fs.readFile(filePath, 'utf-8')
        const oldStr = params.oldString
        const newStr = params.newString
        if (!content.includes(oldStr)) {
          return { tool, success: false, output: `oldString not found in ${filePath}` }
        }
        const occurrences = content.split(oldStr).length - 1
        if (occurrences > 1) {
          return { tool, success: false, output: `Found ${occurrences} matches for oldString in ${filePath}. Provide more context.` }
        }
        content = content.replace(oldStr, newStr)
        await fs.writeFile(filePath, content, 'utf-8')
        return { tool, success: true, output: `Edited: ${filePath}` }
      }
      case 'list_files': {
        const fs = await import('fs/promises')
        const dirPath = sanitizePath(params.dirPath)
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        const lines = entries.map(e => `${e.isDirectory() ? '📁' : '📄'} ${e.name}`)
        return { tool, success: true, output: lines.join('\n') }
      }
      case 'run_command': {
        const { execSync } = await import('child_process')
        const cmd = sanitizeCommand(params.command)
        const cwd = params.cwd || '/root/shop-minimal'
        const output = execSync(cmd, { cwd, encoding: 'utf-8', timeout: 120000, maxBuffer: 5 * 1024 * 1024 })
        return { tool, success: true, output: output.slice(0, 5000) + (output.length > 5000 ? '\n... (truncated)' : '') }
      }
      default:
        return { tool, success: false, output: `Unknown tool: ${tool}` }
    }
  } catch (err: any) {
    return { tool, success: false, output: err.message || String(err) }
  }
}

// ─── Sanitizers ───
function sanitizePath(p: string): string {
  if (!p.startsWith('/root/shop-minimal/')) {
    throw new Error('Path must start with /root/shop-minimal/')
  }
  if (p.includes('..')) throw new Error('Path cannot contain ..')
  if (p.includes('/admin/update-site')) throw new Error('Path /admin/update-site is off-limits')
  if (p.includes('/api/admin/update-site')) throw new Error('Path /api/admin/update-site is off-limits')
  return p
}

function sanitizeCommand(cmd: string): string {
  const forbidden = ['rm -rf', 'rm -fr', 'rm -r /', 'dd if=', 'mkfs', ':(){ :|:& };:', '> /dev/', 'sh -c', 'bash -c', 'eval', 'exec']
  for (const f of forbidden) {
    if (cmd.toLowerCase().includes(f)) throw new Error(`Forbidden command pattern: ${f}`)
  }
  return cmd
}
