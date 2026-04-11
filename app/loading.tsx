export default function Loading() {
  return (
    <div className="min-h-dvh bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    </div>
  )
}
