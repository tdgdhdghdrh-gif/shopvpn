'use client'

import { useState, useEffect } from 'react'

interface TypeWriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  showCursor?: boolean
  cursorStyle?: 'line' | 'block' | 'underline'
}

export function TypeWriter({ 
  text, 
  speed = 50, 
  delay = 0, 
  className = '',
  showCursor = true,
  cursorStyle = 'line'
}: TypeWriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [showBlinkCursor, setShowBlinkCursor] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsTyping(true)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [delay])

  useEffect(() => {
    if (!isTyping) return

    let index = 0
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index))
        index++
      } else {
        clearInterval(interval)
        setIsDone(true)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [isTyping, text, speed])

  // Cursor blink effect
  useEffect(() => {
    if (!showCursor) return
    
    const blinkInterval = setInterval(() => {
      setShowBlinkCursor(prev => !prev)
    }, 530)

    return () => clearInterval(blinkInterval)
  }, [showCursor])

  const cursorClasses = {
    line: 'w-[2px] h-[1.1em]',
    block: 'w-[0.6em] h-[1.1em]',
    underline: 'w-[0.6em] h-[2px] mt-[0.9em]'
  }

  return (
    <span className={`relative ${className}`}>
      <span>{displayText}</span>
      {showCursor && (
        <span 
          className={`inline-block align-middle ml-0.5 bg-current transition-opacity duration-100 ${
            cursorClasses[cursorStyle]
          } ${showBlinkCursor ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </span>
  )
}

// Multi-line typewriter for professional look
interface MultiTypeWriterProps {
  lines: { text: string; className?: string; prefix?: string }[]
  speed?: number
  lineDelay?: number
  startDelay?: number
  cursorStyle?: 'line' | 'block' | 'underline'
  className?: string
}

export function MultiTypeWriter({ 
  lines, 
  speed = 45, 
  lineDelay = 400,
  startDelay = 300,
  cursorStyle = 'line',
  className = ''
}: MultiTypeWriterProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [completedLines, setCompletedLines] = useState<string[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(true), startDelay)
    return () => clearTimeout(timer)
  }, [startDelay])

  useEffect(() => {
    if (!isTyping || currentLine >= lines.length) return

    const targetText = lines[currentLine].text

    if (currentChar < targetText.length) {
      const timer = setTimeout(() => {
        setCompletedLines(prev => {
          const newLines = [...prev]
          const prefix = lines[currentLine].prefix || ''
          newLines[currentLine] = prefix + targetText.slice(0, currentChar + 1)
          return newLines
        })
        setCurrentChar(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setCurrentLine(prev => prev + 1)
        setCurrentChar(0)
      }, lineDelay)
      return () => clearTimeout(timer)
    }
  }, [isTyping, currentLine, currentChar, lines, speed, lineDelay])

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  const cursorClasses = {
    line: 'w-[2px] h-[1.1em]',
    block: 'w-[0.6em] h-[1.1em]',
    underline: 'w-[0.6em] h-[2px] mt-[0.9em]'
  }

  return (
    <div className={className}>
      {lines.map((line, idx) => (
        <div key={idx} className={line.className || ''}>
          {idx === currentLine && currentLine < lines.length ? (
            <span>
              {completedLines[idx] || line.prefix || ''}
              <span 
                className={`inline-block align-middle ml-0.5 bg-current transition-opacity duration-100 ${
                  cursorClasses[cursorStyle]
                } ${showCursor ? 'opacity-100' : 'opacity-0'}`}
              />
            </span>
          ) : (
            completedLines[idx] || ''
          )}
        </div>
      ))}
    </div>
  )
}
