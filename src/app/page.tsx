import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1a3a2a] text-[#f8f9fa] py-24 md:py-32">
        {/* Subtle dot-grid SVG pattern */}
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23ffffff' /%3E%3C/svg%3E")`, backgroundSize: '20px 20px' }}></div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                Shamiri Supervisor Copilot
              </h1>
              <p className="text-xl md:text-2xl text-[#d1d5db] font-light max-w-2xl mx-auto">
                AI-powered session review for Shamiri Fellows. <br className="hidden md:block" />
                Empowering supervisors with intelligent insights.
              </p>
            </div>

            <div className="pt-4">
              {session ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-[#2D6A4F] hover:bg-[#204a37] text-white text-lg px-8 py-7 h-auto rounded-xl shadow-[0_10px_20px_-5px_rgba(26,58,42,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 border-b-4 border-[#1B4332]">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" className="bg-[#2D6A4F] hover:bg-[#204a37] text-white text-lg px-8 py-7 h-auto rounded-xl shadow-[0_10px_20px_-5px_rgba(26,58,42,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 border-b-4 border-[#1B4332]">
                    Sign In to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <main className="flex-1 py-24 bg-[#fafaf8]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="relative p-8 bg-white rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2D6A4F] group-hover:w-1.5 transition-all"></div>
              <h3 className="text-xl font-bold text-[#1a3a2a] mb-4">Review at Scale</h3>
              <p className="text-slate-600 leading-relaxed">
                Efficiently review session transcripts with automated insights and structured organization.
              </p>
            </div>
            <div className="relative p-8 bg-white rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2D6A4F] group-hover:w-1.5 transition-all"></div>
              <h3 className="text-xl font-bold text-[#1a3a2a] mb-4">AI Implementation</h3>
              <p className="text-slate-600 leading-relaxed">
                AI-generated quality scores and risk detection to highlight critical moments automatically.
              </p>
            </div>
            <div className="relative p-8 bg-white rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2D6A4F] group-hover:w-1.5 transition-all"></div>
              <h3 className="text-xl font-bold text-[#1a3a2a] mb-4">Human Validation</h3>
              <p className="text-slate-600 leading-relaxed">
                Human-in-the-loop workflow allows supervisors to validate and refine AI findings easily.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-[#0d1f16] text-[#9ca3af] text-center border-t border-[#1a3a2a]">
        <div className="container mx-auto px-4">
          <p className="font-medium text-white/80 mb-2">Shamiri Institute</p>
          <p className="text-sm">Tiered Care Model · Supervisor Copilot v1.0</p>
        </div>
      </footer>
    </div>
  )
}
