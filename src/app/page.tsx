import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2D6A4F]">
              Shamiri Supervisor Copilot
            </h1>
            <p className="text-xl text-slate-600">
              AI-powered session review for Shamiri Fellows. Built for supervisors.
            </p>
          </div>

          <div className="pt-4">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-[#2D6A4F] hover:bg-[#1B4332] text-lg px-8 py-6 h-auto">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="bg-[#2D6A4F] hover:bg-[#1B4332] text-lg px-8 py-6 h-auto">
                  Sign In to Dashboard
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 text-left max-w-4xl mx-auto">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-2">Review at Scale</h3>
              <p className="text-slate-600">
                Efficiently review session transcripts with automated insights and organization.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-2">AI Implementation</h3>
              <p className="text-slate-600">
                AI-generated quality scores and risk detection to highlight critical moments.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-2">Human Validation</h3>
              <p className="text-slate-600">
                Human-in-the-loop workflow allows supervisors to validate and override AI findings.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-100">
        <p>Shamiri Institute · Tiered Care Model</p>
      </footer>
    </div>
  )
}
