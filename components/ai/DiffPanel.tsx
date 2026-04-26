'use client'

import { useMemo } from 'react'

interface DiffPanelProps {
  oldContent?: string
  newContent: string
}

function computeDiff(oldLines: string[], newLines: string[]): {
  lines: { type: 'same' | 'add' | 'remove'; oldNum?: number; newNum?: number; text: string }[]
} {
  const result: { type: 'same' | 'add' | 'remove'; oldNum?: number; newNum?: number; text: string }[] = []
  let i = 0, j = 0

  while (i < oldLines.length || j < newLines.length) {
    if (i >= oldLines.length) {
      result.push({ type: 'add', newNum: j + 1, text: newLines[j] })
      j++
    } else if (j >= newLines.length) {
      result.push({ type: 'remove', oldNum: i + 1, text: oldLines[i] })
      i++
    } else if (oldLines[i] === newLines[j]) {
      result.push({ type: 'same', oldNum: i + 1, newNum: j + 1, text: newLines[j] })
      i++; j++
    } else {
      // Simple LCS-like: check next few lines
      const lookAhead = 3
      let found = false
      for (let k = 1; k <= lookAhead && i + k < oldLines.length; k++) {
        if (oldLines[i + k] === newLines[j]) {
          for (let r = 0; r < k; r++) {
            result.push({ type: 'remove', oldNum: i + r + 1, text: oldLines[i + r] })
          }
          i += k
          found = true
          break
        }
      }
      if (!found) {
        for (let k = 1; k <= lookAhead && j + k < newLines.length; k++) {
          if (newLines[j + k] === oldLines[i]) {
            for (let r = 0; r < k; r++) {
              result.push({ type: 'add', newNum: j + r + 1, text: newLines[j + r] })
            }
            j += k
            found = true
            break
          }
        }
      }
      if (!found) {
        result.push({ type: 'remove', oldNum: i + 1, text: oldLines[i] })
        result.push({ type: 'add', newNum: j + 1, text: newLines[j] })
        i++; j++
      }
    }
  }

  return { lines: result }
}

export default function DiffPanel({ oldContent = '', newContent }: DiffPanelProps) {
  const diff = useMemo(() => {
    return computeDiff(oldContent.split('\n'), newContent.split('\n'))
  }, [oldContent, newContent])

  return (
    <div className="flex flex-col h-full bg-zinc-950 font-mono text-[12px] leading-5">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/50 border-b border-white/[0.04] text-[10px] text-zinc-500">
        <span>DIFF</span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/20 border border-emerald-500/30" /> เพิ่ม</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/20 border border-red-500/30" /> ลบ</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Old line numbers */}
          <div className="shrink-0 w-10 py-2 bg-zinc-950 border-r border-white/[0.04] text-right pr-2 text-zinc-700 text-[11px] leading-5 select-none">
            {diff.lines.map((l, i) => (
              <div key={i} className={l.type === 'add' ? 'text-zinc-800' : ''}>
                {l.oldNum || ''}
              </div>
            ))}
          </div>
          {/* New line numbers */}
          <div className="shrink-0 w-10 py-2 bg-zinc-950 border-r border-white/[0.04] text-right pr-2 text-zinc-700 text-[11px] leading-5 select-none">
            {diff.lines.map((l, i) => (
              <div key={i} className={l.type === 'remove' ? 'text-zinc-800' : ''}>
                {l.newNum || ''}
              </div>
            ))}
          </div>
          {/* Content */}
          <div className="flex-1 py-2 pl-2 overflow-x-auto">
            {diff.lines.map((l, i) => {
              const bg = l.type === 'add' ? 'bg-emerald-500/10' : l.type === 'remove' ? 'bg-red-500/10' : ''
              const text = l.type === 'add' ? 'text-emerald-300' : l.type === 'remove' ? 'text-red-300' : 'text-zinc-400'
              const prefix = l.type === 'add' ? '+' : l.type === 'remove' ? '-' : ' '
              return (
                <div key={i} className={`whitespace-pre ${bg} ${text}`}>
                  <span className="select-none mr-1 opacity-50">{prefix}</span>
                  {l.text}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
