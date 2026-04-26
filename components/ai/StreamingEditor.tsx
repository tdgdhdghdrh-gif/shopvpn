'use client'

import { useEffect, useRef } from 'react'

interface StreamingEditorProps {
  content: string
  language?: string
  isStreaming?: boolean
}

// Simple syntax highlighter without external deps
function highlightLine(line: string, lang: string): JSX.Element {
  const tokens: { text: string; type: string }[] = []
  let remaining = line

  const patterns: { regex: RegExp; type: string }[] = [
    { regex: /(\/\/.*$)/, type: 'comment' },
    { regex: /(\/\*[\s\S]*?\*\/)/, type: 'comment' },
    { regex: /("(?:[^"\\]|\\.)*")/, type: 'string' },
    { regex: /('(?:[^'\\]|\\.)*')/, type: 'string' },
    { regex: /(`(?:[^`\\]|\\.)*`)/, type: 'string' },
    { regex: /\b(import|export|from|const|let|var|function|return|if|else|for|while|switch|case|break|continue|try|catch|throw|new|class|extends|interface|type|async|await|default|typeof|instanceof|in|of|this|true|false|null|undefined)\b/, type: 'keyword' },
    { regex: /\b(string|number|boolean|any|void|never|unknown|object|Array|Record|Map|Set|Promise|Date|RegExp|Error)\b/, type: 'type' },
    { regex: /\b\d+\.?\d*\b/, type: 'number' },
    { regex: /\b([A-Z][a-zA-Z0-9_]*)\b/, type: 'class' },
    { regex: /\b([a-z_$][a-zA-Z0-9_$]*)\s*(?=\()/, type: 'function' },
  ]

  if (lang === 'css' || line.includes('{') && line.includes(':')) {
    patterns.push(
      { regex: /([a-z-]+)\s*:/, type: 'property' },
      { regex: /\.[a-zA-Z_-]+/, type: 'selector' },
      { regex: /#[a-zA-Z0-9_-]+/, type: 'id' }
    )
  }

  while (remaining.length > 0) {
    let bestMatch: { index: number; length: number; type: string; text: string } | null = null
    for (const p of patterns) {
      const m = remaining.match(p.regex)
      if (m && m.index !== undefined) {
        if (!bestMatch || m.index < bestMatch.index || (m.index === bestMatch.index && m[0].length > bestMatch.length)) {
          bestMatch = { index: m.index, length: m[0].length, type: p.type, text: m[0] }
        }
      }
    }

    if (!bestMatch || bestMatch.index > 0) {
      const plainLen = bestMatch ? bestMatch.index : remaining.length
      tokens.push({ text: remaining.slice(0, plainLen), type: 'plain' })
    }
    if (bestMatch) {
      tokens.push({ text: bestMatch.text, type: bestMatch.type })
      remaining = remaining.slice(bestMatch.index + bestMatch.length)
    } else {
      break
    }
  }

  return (
    <>
      {tokens.map((t, i) => {
        const cls =
          t.type === 'keyword' ? 'text-pink-400 font-semibold' :
          t.type === 'string' ? 'text-emerald-400' :
          t.type === 'comment' ? 'text-zinc-500 italic' :
          t.type === 'number' ? 'text-amber-400' :
          t.type === 'type' ? 'text-cyan-400' :
          t.type === 'class' ? 'text-yellow-300' :
          t.type === 'function' ? 'text-blue-400' :
          t.type === 'property' ? 'text-sky-300' :
          t.type === 'selector' ? 'text-orange-400' :
          t.type === 'id' ? 'text-purple-400' :
          'text-zinc-300'
        return <span key={i} className={cls}>{t.text}</span>
      })}
    </>
  )
}

export default function StreamingEditor({ content, language = 'typescript', isStreaming = false }: StreamingEditorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const lines = content.split('\n')

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [content])

  return (
    <div className="flex flex-col h-full bg-zinc-950 font-mono text-[13px] leading-6">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/50 border-b border-white/[0.04] text-[10px] text-zinc-500">
        <span>{language.toUpperCase()}</span>
        <span className="flex items-center gap-1.5">
          {isStreaming && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              WRITING
            </>
          )}
        </span>
      </div>

      {/* Editor body */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="flex">
          {/* Line numbers */}
          <div className="shrink-0 w-12 py-2 bg-zinc-950 border-r border-white/[0.04] text-right pr-3 text-zinc-700 text-[12px] leading-6 select-none">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code */}
          <div className="flex-1 py-2 pl-3 overflow-x-auto">
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {highlightLine(line, language)}
                {i === lines.length - 1 && isStreaming && (
                  <span className="inline-block w-2 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
