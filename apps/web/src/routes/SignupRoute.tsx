import { useState } from "react";
import { Link } from "react-router-dom";

import { Input } from "../components/ui/input";
import { useAuthStore } from "../store/authStore";

export default function SignupRoute() {
  const { signUp, signInWithProvider, status, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signUp(email, password);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        className="w-full max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6"
        onSubmit={handleSubmit}
      >
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Create account</h1>
          <p className="text-sm text-slate-500">
            Save up to 20 graphs and share time-limited links.
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
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          type="button"
          onClick={() => signInWithProvider("github")}
          disabled={status === "loading"}
        >
          Continue with GitHub
        </button>
        {submitted && !error ? (
          <p className="text-sm text-emerald-600">
            Check your inbox to confirm your email.
          </p>
        ) : null}
        <button
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          type="submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Creating..." : "Create account"}
        </button>
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="text-slate-900 underline" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
