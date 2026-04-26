'use client'

import { X, FileCode, FileText, FileEdit } from 'lucide-react'

export interface OpenFile {
  path: string
  content: string
  isNew?: boolean
  isModified?: boolean
}

interface FileTabsProps {
  files: OpenFile[]
  activePath: string | null
  onSelect: (path: string) => void
  onClose: (path: string) => void
}

function fileIcon(path: string) {
  if (path.endsWith('.tsx') || path.endsWith('.ts') || path.endsWith('.jsx') || path.endsWith('.js'))
    return <FileCode className="w-3 h-3 text-blue-400" />
  if (path.endsWith('.css') || path.endsWith('.scss'))
    return <FileEdit className="w-3 h-3 text-sky-400" />
  return <FileText className="w-3 h-3 text-zinc-500" />
}

export default function FileTabs({ files, activePath, onSelect, onClose }: FileTabsProps) {
  if (files.length === 0) return null

  return (
    <div className="flex items-end overflow-x-auto bg-zinc-950/80 border-b border-white/[0.06] scrollbar-hide">
      {files.map(f => {
        const isActive = f.path === activePath
        const fileName = f.path.split('/').pop() || f.path
        return (
          <div
            key={f.path}
            onClick={() => onSelect(f.path)}
            className={`group flex items-center gap-2 px-3 py-2 text-[11px] cursor-pointer border-r border-white/[0.04] transition-all min-w-fit select-none ${
              isActive
                ? 'bg-zinc-900/90 text-white border-t-2 border-t-indigo-500'
                : 'bg-zinc-950/40 text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
            }`}
          >
            {fileIcon(f.path)}
            <span className="truncate max-w-[140px]">{fileName}</span>
            {f.isNew && <span className="text-[9px] px-1 rounded bg-emerald-500/15 text-emerald-400">NEW</span>}
            {f.isModified && <span className="text-[9px] px-1 rounded bg-amber-500/15 text-amber-400">MOD</span>}
            <button
              onClick={e => { e.stopPropagation(); onClose(f.path) }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
