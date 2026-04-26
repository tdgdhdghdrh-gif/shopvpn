'use client'

import { useState } from 'react'
import FileTabs, { OpenFile } from './FileTabs'
import StreamingEditor from './StreamingEditor'
import DiffPanel from './DiffPanel'
import TerminalPanel, { TerminalStep } from './TerminalPanel'
import { Code2, Columns2, SquareStack, X } from 'lucide-react'

interface CodeWorkspaceProps {
  files: OpenFile[]
  activePath: string | null
  onSelectFile: (path: string) => void
  onCloseFile: (path: string) => void
  streamingPath: string | null
  streamingContent: string
  isStreaming: boolean
  terminalSteps: TerminalStep[]
  currentPhase: string
  planText?: string
  showDiff: boolean
  oldDiffContent?: string
}

export default function CodeWorkspace({
  files,
  activePath,
  onSelectFile,
  onCloseFile,
  streamingPath,
  streamingContent,
  isStreaming,
  terminalSteps,
  currentPhase,
  planText,
  showDiff,
  oldDiffContent,
}: CodeWorkspaceProps) {
  const [layout, setLayout] = useState<'editor' | 'split' | 'diff'>('split')
  const activeFile = files.find(f => f.path === activePath)
  const displayContent = streamingPath && streamingPath === activePath ? streamingContent : (activeFile?.content || '')
  const isFileStreaming = isStreaming && streamingPath === activePath

  const lang = (path: string) => {
    if (path.endsWith('.css') || path.endsWith('.scss')) return 'css'
    if (path.endsWith('.json')) return 'json'
    if (path.endsWith('.html')) return 'html'
    return 'typescript'
  }

  if (files.length === 0 && !streamingPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3">
        <Code2 className="w-10 h-10 opacity-20" />
        <p className="text-xs">AI จะแสดงไฟล์ที่กำลังแก้ไขที่นี่</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-950/80 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-zinc-300">Workspace</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLayout('editor')}
            className={`p-1.5 rounded-lg transition-all ${layout === 'editor' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
            title="Editor only"
          >
            <SquareStack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLayout('split')}
            className={`p-1.5 rounded-lg transition-all ${layout === 'split' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
            title="Split"
          >
            <Columns2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLayout('diff')}
            className={`p-1.5 rounded-lg transition-all ${layout === 'diff' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
            title="Diff"
          >
            <span className="text-[10px] font-bold">DIFF</span>
          </button>
        </div>
      </div>

      <FileTabs files={files} activePath={activePath} onSelect={onSelectFile} onClose={onCloseFile} />

      {/* Content area */}
      <div className="flex-1 min-h-0 flex">
        {layout !== 'diff' && (
          <div className={`${layout === 'split' ? 'w-1/2 border-r border-white/[0.06]' : 'flex-1'}`}>
            <StreamingEditor
              content={displayContent}
              language={lang(activePath || '')}
              isStreaming={isFileStreaming}
            />
          </div>
        )}

        {layout === 'split' && showDiff && (
          <div className="w-1/2">
            <DiffPanel oldContent={oldDiffContent} newContent={displayContent} />
          </div>
        )}

        {layout === 'diff' && showDiff && (
          <div className="flex-1">
            <DiffPanel oldContent={oldDiffContent} newContent={displayContent} />
          </div>
        )}
      </div>

      {/* Terminal */}
      <div className="h-40 shrink-0">
        <TerminalPanel
          steps={terminalSteps}
          currentPhase={currentPhase}
          planText={planText}
        />
      </div>
    </div>
  )
}
