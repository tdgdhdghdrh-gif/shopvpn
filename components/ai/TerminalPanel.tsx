'use client'

import { Terminal, CheckCircle2, XCircle, Loader2, FileCode, FileEdit, FileText, FolderOpen } from 'lucide-react'

export interface TerminalStep {
  tool: string
  filePath: string
  status: 'running' | 'done' | 'error'
  outputPreview?: string
}

interface TerminalPanelProps {
  steps: TerminalStep[]
  currentPhase: string
  planText?: string
}

function toolIcon(tool: string) {
  if (tool === 'read_file') return <FileCode className="w-3 h-3" />
  if (tool === 'edit_file') return <FileEdit className="w-3 h-3" />
  if (tool === 'write_file') return <FileText className="w-3 h-3" />
  if (tool === 'list_files') return <FolderOpen className="w-3 h-3" />
  return <Terminal className="w-3 h-3" />
}

function toolLabel(tool: string) {
  const map: Record<string, string> = {
    read_file: 'อ่านไฟล์',
    write_file: 'เขียนไฟล์',
    edit_file: 'แก้ไขไฟล์',
    list_files: 'ดูรายการไฟล์',
    run_command: 'รันคำสั่ง',
  }
  return map[tool] || tool
}

export default function TerminalPanel({ steps, currentPhase, planText }: TerminalPanelProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950 border-t border-white/[0.06] font-mono text-[11px]">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900/40 border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Terminal className="w-3 h-3" />
          <span className="font-bold">TERMINAL</span>
        </div>
        {currentPhase && (
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{currentPhase}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1">
        {planText && (
          <div className="p-2 rounded bg-zinc-900/40 border border-white/[0.04] text-zinc-400 mb-2">
            <span className="text-zinc-600 font-bold">PLAN:</span> {planText}
          </div>
        )}

        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-2 py-1.5 rounded border ${
              step.status === 'running'
                ? 'bg-amber-500/5 border-amber-500/10 text-amber-400'
                : step.status === 'done'
                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                : 'bg-red-500/5 border-red-500/10 text-red-400'
            }`}
          >
            {step.status === 'running' ? (
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
            ) : step.status === 'done' ? (
              <CheckCircle2 className="w-3 h-3 shrink-0" />
            ) : (
              <XCircle className="w-3 h-3 shrink-0" />
            )}
            {toolIcon(step.tool)}
            <span className="font-bold shrink-0">{toolLabel(step.tool)}</span>
            <code className="text-zinc-600 truncate">{step.filePath.replace('/root/shop-minimal/', '')}</code>
            {step.outputPreview && (
              <span className="text-zinc-600 truncate">→ {step.outputPreview}</span>
            )}
          </div>
        ))}

        {steps.length === 0 && !planText && (
          <div className="text-zinc-700 italic">รอคำสั่ง...</div>
        )}
      </div>
    </div>
  )
}
