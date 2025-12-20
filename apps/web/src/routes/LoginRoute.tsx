import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Input } from "../components/ui/input";
import { useAuthStore } from "../store/authStore";

export default function LoginRoute() {
  const navigate = useNavigate();
  const { signIn, status, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signIn(email, password);
    const { status: nextStatus } = useAuthStore.getState();
    if (nextStatus === "authenticated") {
      navigate("/docs");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        className="w-full max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6"
        onSubmit={handleSubmit}
      >
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-500">
            Access your saved graphs and share links.
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}
        <button
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          type="submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-sm text-slate-500">
          Need an account?{" "}
          <Link className="text-slate-900 underline" to="/signup">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
