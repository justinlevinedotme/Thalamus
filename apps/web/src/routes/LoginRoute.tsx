import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

import { Input } from "../components/ui/input";
import { useAuthStore } from "../store/authStore";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const OAUTH_PROVIDERS = [
  { id: "github", label: "GitHub" },
  { id: "google", label: "Google" },
  { id: "gitlab", label: "GitLab" },
  { id: "atlassian", label: "Atlassian" },
  { id: "apple", label: "Apple" },
] as const;

type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]["id"];

export default function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithProvider, status, error, setError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the captcha");
      return;
    }
    const success = await signIn(email, password, captchaToken || undefined);
    if (success) {
      navigate("/docs");
    } else {
      // Reset captcha on failure
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const handleOAuthSignIn = (provider: OAuthProvider) => {
    signInWithProvider(provider);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError =
      params.get("error_description") ?? params.get("error");
    if (oauthError) {
      setError(oauthError.replace(/\+/g, " "));
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate, setError]);

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
          <label className="text-sm font-medium text-slate-700" htmlFor="login-email">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="login-password">
            Password
          </label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {TURNSTILE_SITE_KEY && (
          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={setCaptchaToken}
              onError={() => setCaptchaToken(null)}
              onExpire={() => setCaptchaToken(null)}
            />
          </div>
        )}
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}
        <button
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          type="submit"
          disabled={status === "loading" || (!!TURNSTILE_SITE_KEY && !captchaToken)}
        >
          {status === "loading" ? "Signing in..." : "Sign in"}
        </button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">Or continue with</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {OAUTH_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              type="button"
              onClick={() => handleOAuthSignIn(provider.id)}
              disabled={status === "loading"}
            >
              {provider.label}
            </button>
          ))}
        </div>
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
