'use client'

import { useEffect, useRef, useState } from 'react'
import { Music, Volume2, VolumeX, Play, Pause } from 'lucide-react'

interface MusicData {
  id: string
  fileUrl: string
  isEnabled: boolean
  autoPlay: boolean
  volume: number
}

export default function SiteMusicPlayer() {
  const [music, setMusic] = useState<MusicData | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetch('/api/admin/music')
      .then((r) => r.json())
      .then((d) => {
        if (d.music) setMusic(d.music)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!music || !music.isEnabled) return

    const audio = new Audio(music.fileUrl)
    audio.loop = true
    audio.volume = music.volume
    audioRef.current = audio

    const handleInteraction = () => {
      setUserInteracted(true)
      if (music.autoPlay && audio.paused) {
        audio.play().catch(() => {})
      }
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }

    // Browsers block autoplay without interaction
    if (music.autoPlay) {
      audio.play().catch(() => {
        // Wait for first user interaction
        window.addEventListener('click', handleInteraction)
        window.addEventListener('touchstart', handleInteraction)
      })
    }

    audio.addEventListener('play', () => setPlaying(true))
    audio.addEventListener('pause', () => setPlaying(false))

    return () => {
      audio.pause()
      audio.src = ''
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [music])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !audioRef.current.muted
    setMuted(audioRef.current.muted)
  }

  if (!music || !music.isEnabled) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-[9998] flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-3 py-2 shadow-lg"
    >
      <button
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <button
        onClick={toggleMute}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
      <div className="flex items-center gap-1.5">
        <Music className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] text-zinc-300">{playing ? 'กำลังเล่น' : 'หยุดชั่วคราว'}</span>
      </div>
    </div>
  )
}
