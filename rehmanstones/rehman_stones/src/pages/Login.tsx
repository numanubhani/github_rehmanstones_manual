// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate(params.get("redirect") ?? "/");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 grid place-items-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Brand / header */}
        <div className="text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-black grid place-items-center">
            {/* lock icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
            >
              <path
                d="M7 10V8a5 5 0 0 1 10 0v2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Sign in to Rehman Stones</h1>
          <p className="text-gray-500 mt-1">Welcome back — we missed you.</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg ring-1 ring-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Password</label>
            <div className="mt-1 relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg ring-1 ring-gray-200 px-3 py-2 outline-none pr-10 focus:ring-2 focus:ring-black"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? (
                  // eye-off
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 3l18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42M9.88 5.09A10.7 10.7 0 0 1 12 5c5.523 0 9.5 4.5 9.5 7-1.1 1.97-3.62 4.83-7.5 5.83"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M6.12 18.91C3.62 17.91 2.1 16.04 1.5 12c.6-2.5 4.48-7 10.5-7 .73 0 1.43.07 2.1.2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  // eye
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="w-4 h-4 rounded" />
                Remember me
              </label>
              <button
                type="button"
                className="text-gray-600 hover:text-black underline underline-offset-2"
                onClick={() => alert("Forgot password flow coming soon")}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white disabled:opacity-70 transition-transform active:scale-[.99]"
            style={{ background: "#111111" }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-black underline underline-offset-2"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
