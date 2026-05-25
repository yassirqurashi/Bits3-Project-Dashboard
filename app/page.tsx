export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center overflow-hidden bg-[#02040a] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(18,61,255,0.28),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(0,163,255,0.20),transparent_28%),linear-gradient(135deg,#02040a_0%,#050814_48%,#02040a_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:58px_58px]" />

      <div className="relative w-full max-w-xl rounded-[32px] border border-blue-200/20 bg-white/[0.07] p-10 text-center shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
        <img src="/bits3-logo.png" alt="Bits3" className="mx-auto mb-8 h-auto w-36 drop-shadow-[0_0_24px_rgba(18,61,255,0.55)]" />
        <h1 className="mb-3 text-4xl font-black tracking-tight">Project Manager Portal</h1>
        <p className="mx-auto mb-8 max-w-md text-sm font-semibold leading-7 text-slate-300">
          Access the Bits3 workspace for clients, projects, milestones, payments, chats, artifacts, meetings, and support operations.
        </p>

        <a
          href="/login"
          className="block w-full rounded-2xl bg-gradient-to-r from-[#123dff] to-[#0076ff] py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(18,61,255,0.32)] transition hover:-translate-y-0.5"
        >
          Go to PM Login
        </a>
      </div>
    </main>
  )
}
