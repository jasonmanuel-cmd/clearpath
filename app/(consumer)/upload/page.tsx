'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UploadPage() {
  const router = useRouter()
  const [reportText, setReportText] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'upload' | 'processing'>('upload')
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reportText.trim()) return
    setLoading(true)
    setError('')
    setStep('processing')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    setStatusMsg('Creating case...')
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert({ user_id: user.id, credit_report_text: reportText, status: 'analyzing' })
      .select()
      .single()

    if (caseError || !newCase) {
      setError('Failed to create case. Please try again.')
      setStep('upload')
      setLoading(false)
      return
    }

    setStatusMsg('Running AI analysis — this may take 1-2 minutes...')

    const res = await fetch('/api/orchestrator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId: newCase.id, userId: user.id }),
    })

    if (!res.ok) {
      setError('Analysis failed. Please try again.')
      setStep('upload')
      setLoading(false)
      return
    }

    const result = await res.json()
    setStatusMsg(`Found ${result.itemCount} disputable items. Generating letters...`)

    setTimeout(() => router.push('/dashboard'), 1500)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-white/10 px-8 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">CP</div>
        <span className="font-semibold">ClearPath AI</span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {step === 'upload' ? (
          <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">Upload credit report</h1>
            <p className="text-slate-400 mb-8">
              Paste your credit report text below. We&apos;ll analyze it and identify all disputable items.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Credit report text</label>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  required
                  rows={16}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition font-mono text-sm resize-none"
                  placeholder="Paste your full credit report here (from AnnualCreditReport.com or your credit monitoring service)..."
                />
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-indigo-300">
                <strong>Privacy:</strong> Your report is analyzed and letters are generated immediately. Raw text is stored securely and used only for your dispute process.
              </div>

              <button
                type="submit"
                disabled={loading || !reportText.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition py-4 rounded-xl font-semibold text-lg"
              >
                Analyze & start disputes
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Analyzing your report</h2>
            <p className="text-slate-400 text-lg mb-4">{statusMsg}</p>
            <div className="text-slate-500 text-sm">
              Running Master Orchestrator → Case Router → Specialist Agents → Letter Bot
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
