export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-center">Log in</h1>
        <p className="text-slate-500 text-center mt-2">Access your StockPilot account</p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border p-3"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border p-3"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white p-3 rounded-lg font-medium hover:opacity-95"
          >
            Log in
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Don’t have an account?
          <a href="/signup" className="text-sky-600 ml-1">Sign up</a>
        </p>
      </div>
    </div>
  );
}
