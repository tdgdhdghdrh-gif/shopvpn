'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Bot, Send, Loader2, Settings, ChevronLeft, Plus,
  Terminal, FileCode, FileEdit, FileText, FolderOpen, CheckCircle2,
  AlertTriangle, XCircle, Sparkles, Key, Cpu, MessageSquare,
  ChevronRight, Save, X, Wand2, Code2, Zap, Clock,
  LayoutTemplate, PanelRightClose, PanelRightOpen
} from 'lucide-react'
import CodeWorkspace from '@/components/ai/CodeWorkspace'
import { OpenFile } from '@/components/ai/FileTabs'
import { TerminalStep } from '@/components/ai/TerminalPanel'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  tools?: { tool: string; success: boolean; output: string }[]
}

interface ChatItem {
  id: string
  title: string
  updatedAt: string
}

interface StreamEvent {
  type: string
  content?: string
  message?: string
  tool?: string
  filePath?: string
  success?: boolean
  outputPreview?: string
  index?: number
  total?: number
  count?: number
  reply?: string
  chatId?: string
  loops?: number
  error?: string
  isNew?: boolean
  oldContent?: string
  line?: number
  totalLines?: number
  fullContent?: string
}

const MODELS = [
  { value: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-pro-preview-06-05', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-flash-latest', label: 'Gemini Flash (latest)' },
  { value: 'gemini-pro-latest', label: 'Gemini Pro (latest)' },
  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
  { value: 'deepseek-chat', label: 'DeepSeek V3' },
  { value: 'kimi-k2.6', label: 'Kimi K2.6 (OpenCode)' },
]

const PRESET_URLS = [
  { value: 'https://generativelanguage.googleapis.com', label: 'Google Gemini (แนะนำ)' },
  { value: 'https://api.openai.com/v1', label: 'OpenAI' },
  { value: 'https://openrouter.ai/api/v1', label: 'OpenRouter' },
  { value: 'https://api.groq.com/openai/v1', label: 'Groq' },
  { value: 'https://api.deepseek.com/v1', label: 'DeepSeek' },
  { value: 'https://opencode.ai/zen/go/v1', label: 'OpenCode AI' },
]

export default function AiAssistantPage() {
  const [config, setConfig] = useState<any>(null)
  const [chats, setChats] = useState<ChatItem[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Real-time progress
  const [progressSteps, setProgressSteps] = useState<TerminalStep[]>([])
  const [currentPhase, setCurrentPhase] = useState('')
  const [planText, setPlanText] = useState('')

  // IDE Workspace
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null)
  const [streamingFilePath, setStreamingFilePath] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [oldDiffContent, setOldDiffContent] = useState('')

  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://generativelanguage.googleapis.com')
  const [model, setModel] = useState('gemini-2.5-flash-preview-05-20')
  const [aiEnabled, setAiEnabled] = useState(false)

  const fetchConfig = useCallback(async () => {
    const res = await fetch('/api/admin/ai-config')
    const data = await res.json()
    if (data.config) {
      setConfig(data.config)
      setBaseUrl(data.config.baseUrl || 'https://generativelanguage.googleapis.com')
      setModel(data.config.model || 'gemini-2.5-flash-preview-05-20')
      setAiEnabled(data.config.isEnabled)
    }
  }, [])

  const fetchChats = useCallback(async () => {
    const res = await fetch('/api/admin/ai-chats')
    const data = await res.json()
    if (data.chats) setChats(data.chats)
  }, [])

  useEffect(() => { fetchConfig(); fetchChats() }, [fetchConfig, fetchChats])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, progressSteps, currentPhase, planText])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    setProgressSteps([])
    setCurrentPhase('')
    setPlanText('')
    setStreamingFilePath(null)
    setStreamingContent('')

    try {
      const res = await fetch('/api/admin/ai-chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let buffer = ''
      let finalReply = ''
      let finalChatId = ''
      let finalTools: any[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event: StreamEvent = JSON.parse(line)

            switch (event.type) {
              case 'start':
                setCurrentPhase('กำลังเริ่มต้น...')
                break
              case 'thinking':
                setCurrentPhase(event.content || 'กำลังคิด...')
                break
              case 'plan':
                setPlanText(event.content || '')
                break
              case 'tools_count':
                setCurrentPhase(`กำลังรัน ${event.count} คำสั่ง...`)
                break
              case 'tool_start':
                setProgressSteps(prev => [...prev, {
                  tool: event.tool || '',
                  filePath: event.filePath || '',
                  status: 'running',
                }])
                setCurrentPhase(`กำลังรัน: ${event.tool} (${event.index}/${event.total})`)
                break
              case 'tool_done':
                setProgressSteps(prev => {
                  const copy = [...prev]
                  const idx = copy.findIndex(s => s.tool === event.tool && s.status === 'running')
                  if (idx !== -1) {
                    copy[idx] = {
                      ...copy[idx],
                      status: event.success ? 'done' : 'error',
                      outputPreview: event.outputPreview,
                    }
                  }
                  return copy
                })
                break
              case 'file_open':
                if (event.filePath) {
                  setShowWorkspace(true)
                  setStreamingFilePath(event.filePath)
                  setActiveFilePath(event.filePath)
                  setOldDiffContent(event.oldContent || '')
                  setOpenFiles(prev => {
                    if (prev.find(f => f.path === event.filePath)) return prev
                    return [...prev, {
                      path: event.filePath,
                      content: '',
                      isNew: event.isNew,
                      isModified: !event.isNew,
                    }]
                  })
                }
                break
              case 'code_chunk':
                if (event.filePath && event.fullContent !== undefined) {
                  setStreamingContent(event.fullContent)
                  setOpenFiles(prev => prev.map(f =>
                    f.path === event.filePath ? { ...f, content: event.fullContent || '' } : f
                  ))
                }
                break
              case 'file_done':
                if (event.filePath && event.fullContent !== undefined) {
                  setStreamingFilePath(null)
                  setOpenFiles(prev => prev.map(f =>
                    f.path === event.filePath ? { ...f, content: event.fullContent || '' } : f
                  ))
                }
                break
              case 'done':
                finalReply = event.reply || ''
                finalChatId = event.chatId || ''
                break
              case 'error':
                finalReply = `❌ ${event.error || 'เกิดข้อผิดพลาด'}`
                break
            }
          } catch {}
        }
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: finalReply,
        tools: finalTools,
      }])

      if (finalChatId) {
        setActiveChatId(finalChatId)
        fetchChats()
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${err.message || 'เกิดข้อผิดพลาด'}` }])
    }

    setLoading(false)
    setProgressSteps([])
    setCurrentPhase('')
    setPlanText('')
    setStreamingFilePath(null)
  }

  const handleNewChat = () => {
    setActiveChatId(null)
    setMessages([])
    setOpenFiles([])
    setActiveFilePath(null)
    setShowWorkspace(false)
    setStreamingContent('')
  }

  const handleSaveConfig = async () => {
    setSavingConfig(true)
    const res = await fetch('/api/admin/ai-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, baseUrl, model, isEnabled: aiEnabled }),
    })
    const data = await res.json()
    if (data.success) {
      setConfig(data.config)
      setShowSettings(false)
    }
    setSavingConfig(false)
  }

  const toolIcon = (tool: string) => {
    if (tool === 'read_file') return <FileCode className="w-3.5 h-3.5" />
    if (tool === 'edit_file') return <FileEdit className="w-3.5 h-3.5" />
    if (tool === 'write_file') return <FileText className="w-3.5 h-3.5" />
    if (tool === 'list_files') return <FolderOpen className="w-3.5 h-3.5" />
    if (tool === 'run_command') return <Terminal className="w-3.5 h-3.5" />
    return <Terminal className="w-3.5 h-3.5" />
  }

  const toolLabel = (tool: string) => {
    if (tool === 'read_file') return 'อ่านไฟล์'
    if (tool === 'edit_file') return 'แก้ไขไฟล์'
    if (tool === 'write_file') return 'เขียนไฟล์'
    if (tool === 'list_files') return 'ดูรายการไฟล์'
    if (tool === 'run_command') return 'รันคำสั่ง'
    return tool
  }

  const renderContent = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-white mt-3 mb-1">{line.slice(4)}</h3>
      if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-white mt-3 mb-1">{line.slice(3)}</h2>
      if (line.startsWith('# ')) return <h1 key={i} className="text-lg font-bold text-white mt-3 mb-1">{line.slice(2)}</h1>
      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-zinc-300 text-[13px]">{line.slice(2)}</li>
      if (line.startsWith('```')) return null
      if (line.match(/^\s*```/)) return null
      return <p key={i} className="text-[13px] text-zinc-300 leading-relaxed">{line}</p>
    })
  }

  return (
    <div className="flex h-[calc(100vh-64px)] -mx-3 sm:-mx-0 -my-4 sm:-my-0">
      {/* ── Sidebar ── */}
      <div
        className={`shrink-0 flex flex-col bg-zinc-950/40 overflow-hidden transition-all duration-300 ease-in-out ${
          showSidebar ? 'w-60 border-r border-white/[0.04] opacity-100' : 'w-0 border-r-0 opacity-0'
        }`}
      >
        <div className="p-3 flex items-center justify-between border-b border-white/[0.04] min-w-[240px]">
          <button onClick={handleNewChat} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-xs font-bold text-white transition-all">
            <Plus className="w-3.5 h-3.5" /> แชทใหม่
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl hover:bg-white/[0.05] text-zinc-500 hover:text-white transition-all">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-w-[240px]">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all ${
                activeChatId === chat.id
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{chat.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className={`flex flex-col min-w-0 bg-zinc-950/20 relative transition-all duration-300 ${showWorkspace ? 'flex-1' : 'flex-1'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 rounded-xl hover:bg-white/[0.05] text-zinc-500 hover:text-white transition-all">
              {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">AI ผู้ช่วย</h1>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  {model}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {baseUrl?.replace('https://', '').replace('/v1', '').split('/')[0]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!config?.isEnabled && (
              <span className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400">
                ยังไม่เปิดใช้งาน
              </span>
            )}
            <button
              onClick={() => setShowWorkspace(!showWorkspace)}
              className={`p-2 rounded-xl transition-all ${showWorkspace ? 'bg-white/10 text-white' : 'hover:bg-white/[0.05] text-zinc-500 hover:text-white'}`}
              title={showWorkspace ? 'ซ่อน Workspace' : 'แสดง Workspace'}
            >
              {showWorkspace ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl hover:bg-white/[0.05] text-zinc-500 hover:text-white transition-all">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/20">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">OpenCode AI ผู้ช่วย</h2>
                <p className="text-sm text-zinc-500 max-w-sm">สั่งให้ AI เขียนโค้ด แก้บัค เพิ่มฟีเจอร์ หรือจัดการโปรเจกต์ทั้งหมดได้</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {[
                  'เพิ่มหน้าแจ้งเตือนใหม่ในแอดมิน',
                  'แก้บัคหน้า login บนมือถือ',
                  'สร้าง API สำหรับดึงสถิติรายวัน',
                  'ปรับแต่ง CSS ให้ปุ่มสวยขึ้น',
                ].map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="p-3 rounded-xl bg-zinc-900/40 border border-white/[0.04] text-xs text-zinc-400 hover:text-white hover:border-white/[0.08] transition-all text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 max-w-lg w-full">
                <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-bold">ห้ามยุ่ง:</span> หน้า "อัพเดทเว็บ" (/admin/update-site)
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                  : 'bg-gradient-to-br from-indigo-600 to-purple-600'
              }`}>
                {msg.role === 'user' ? <Sparkles className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-white'
                    : 'bg-zinc-900/60 border border-white/[0.04] text-zinc-300'
                }`}>
                  {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* Real-time progress panel */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 max-w-[85%] sm:max-w-[75%] space-y-3">
                {/* Phase */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span className="text-xs font-medium text-indigo-400">{currentPhase || 'กำลังทำงาน...'}</span>
                </div>

                {/* Plan text */}
                {planText && (
                  <div className="px-3 py-2 rounded-xl bg-zinc-900/40 border border-white/[0.04]">
                    <p className="text-[11px] text-zinc-500 font-bold mb-1">แผนการทำงาน:</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{planText}</p>
                  </div>
                )}

                {/* Progress steps */}
                {progressSteps.length > 0 && (
                  <div className="space-y-1.5">
                    {progressSteps.map((step, si) => (
                      <div
                        key={si}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] border ${
                          step.status === 'running'
                            ? 'bg-amber-500/5 border-amber-500/15 text-amber-400'
                            : step.status === 'done'
                            ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400'
                            : 'bg-red-500/5 border-red-500/15 text-red-400'
                        }`}
                      >
                        {step.status === 'running' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : step.status === 'done' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {toolIcon(step.tool)}
                        <span className="font-medium">{toolLabel(step.tool)}</span>
                        {step.filePath && (
                          <code className="text-zinc-600 truncate max-w-[200px]">{step.filePath.replace('/root/shop-minimal/', '')}</code>
                        )}
                        {step.outputPreview && (
                          <span className="text-zinc-600 truncate">{step.outputPreview}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-white/[0.04] shrink-0">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <div className="flex-1 bg-zinc-900/60 border border-white/[0.06] rounded-2xl px-4 py-3 focus-within:border-indigo-500/30 transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder={config?.isEnabled ? 'สั่งงาน AI... (เช่น "เพิ่มหน้าสถิติใหม่")' : 'กรุณาตั้งค่า API Key ก่อน'}
                disabled={!config?.isEnabled || loading}
                rows={1}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none resize-none max-h-32"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || !config?.isEnabled}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Code Workspace ── */}
      {showWorkspace && (
        <div className="w-[45%] min-w-[400px] max-w-[700px] border-l border-white/[0.06] bg-zinc-950/40 flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
          <CodeWorkspace
            files={openFiles}
            activePath={activeFilePath}
            onSelectFile={setActiveFilePath}
            onCloseFile={(path) => {
              setOpenFiles(prev => prev.filter(f => f.path !== path))
              if (activeFilePath === path) setActiveFilePath(null)
            }}
            streamingPath={streamingFilePath}
            streamingContent={streamingContent}
            isStreaming={!!streamingFilePath}
            terminalSteps={progressSteps}
            currentPhase={currentPhase}
            planText={planText}
            showDiff={!!oldDiffContent}
            oldDiffContent={oldDiffContent}
          />
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-white/[0.06] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-white/[0.04] flex items-center justify-between sticky top-0 bg-zinc-950 z-10">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">ตั้งค่า AI</span>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-1 rounded-lg hover:bg-white/[0.05] text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-600 font-bold mb-1.5">API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="ใส่ API Key"
                    className="w-full bg-black/40 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500/40 transition-all font-mono"
                  />
                </div>
                {config?.apiKey && <p className="text-[10px] text-zinc-600 mt-1">ปัจจุบัน: {config.apiKey}</p>}
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-600 font-bold mb-1.5">ผู้ให้บริการ</label>
                <select value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-all">
                  {PRESET_URLS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
                <input type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://..." className="w-full mt-2 bg-black/40 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-indigo-500/40 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-600 font-bold mb-1.5">โมเดล</label>
                <select value={model} onChange={e => setModel(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-all">
                  {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm font-medium text-white">เปิดใช้งาน</span>
                </div>
                <button onClick={() => setAiEnabled(!aiEnabled)} className={`w-11 h-6 rounded-full p-1 transition-all ${aiEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${aiEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-[11px] text-amber-400 leading-relaxed"><span className="font-bold">คำเตือน:</span> API Key จะถูกเก็บในฐานข้อมูลของเซิร์ฟเวอร์คุณเอง</p>
              </div>
            </div>
            <div className="p-5 border-t border-white/[0.04] flex gap-3">
              <button onClick={() => setShowSettings(false)} className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 text-sm font-bold hover:bg-zinc-800 transition-all">ยกเลิก</button>
              <button onClick={handleSaveConfig} disabled={savingConfig} className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
