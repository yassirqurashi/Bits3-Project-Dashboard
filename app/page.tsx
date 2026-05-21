export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Project Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Login to view your project progress, milestones, and payments.
        </p>

        <a
          href="/login"
          className="block w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          Go to Login
        </a>
      </div>
    </main>
  )
}
