export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 text-zinc-500">
        <div className="w-6 h-6 border-[3px] border-white/10 border-t-white/50 rounded-full animate-spin" />
        <span className="text-xs font-medium">กำลังโหลด...</span>
      </div>
    </div>
  )
}
