import { User } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 border-t-4 border-t-[#2D6A4F] shadow-sm">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2D6A4F] rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1a3a2a]">Shamiri</span>
          <span className="text-xs bg-[#f0fdf4] text-[#2D6A4F] px-2 py-0.5 rounded-full font-medium border border-[#2D6A4F]/10 ml-2">
            Supervisor
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">Dr. Amara Osei</p>
            <p className="text-xs text-slate-500">Chief Clinical Supervisor</p>
          </div>
          <div className="h-10 w-10 bg-[#f8f9fa] border border-slate-200 rounded-full flex items-center justify-center text-[#2D6A4F]">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  )
}
