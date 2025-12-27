import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Loader2, Eye, EyeOff } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuthStore } from "../store/authStore";
import { twoFactor, authClient } from "../lib/authClient";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

// Environment variables to control which OAuth providers are shown
// Set these in .env: VITE_OAUTH_GITHUB=true, VITE_OAUTH_GOOGLE=true, etc.
const ENABLED_OAUTH_PROVIDERS: Record<string, boolean> = {
  github: import.meta.env.VITE_OAUTH_GITHUB?.toLowerCase() === "true",
  google: import.meta.env.VITE_OAUTH_GOOGLE?.toLowerCase() === "true",
  gitlab: import.meta.env.VITE_OAUTH_GITLAB?.toLowerCase() === "true",
  atlassian: import.meta.env.VITE_OAUTH_ATLASSIAN?.toLowerCase() === "true",
  apple: import.meta.env.VITE_OAUTH_APPLE?.toLowerCase() === "true",
};

// OAuth provider configurations with brand colors and SVG icons
const OAUTH_PROVIDERS = [
  {
    id: "github",
    label: "GitHub",
    color: "bg-[#24292F] hover:bg-[#1a1f24] text-white",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    id: "google",
    label: "Google",
    color: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 48 48">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
    ),
  },
  {
    id: "gitlab",
    label: "GitLab",
    color: "bg-[#FC6D26] hover:bg-[#e85d1a] text-white",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.918 1.263c-.136-.423-.731-.423-.867 0L1.386 9.45.044 13.587c-.095.293.032.619.285.8l11.67 8.466 11.67-8.466c.253-.181.38-.507.286-.8" />
      </svg>
    ),
  },
  {
    id: "atlassian",
    label: "Atlassian",
    color: "bg-[#0052CC] hover:bg-[#0047b3] text-white",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.127 11.085c-.235-.345-.727-.227-.848.174l-2.97 9.636a.74.74 0 00.707.973h4.87a.74.74 0 00.707-.514c1.317-4.057-.105-8.454-2.466-10.269zm4.873-8.97c-2.466 3.082-2.632 7.474-.52 11.3l2.455 4.448a.74.74 0 00.648.399h4.87a.74.74 0 00.707-.973L12.848 2.145c-.143-.4-.692-.4-.848-.03z" />
      </svg>
    ),
  },
  {
    id: "apple",
    label: "Apple",
    color: "bg-black hover:bg-gray-900 text-white",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
] as const;

// Filter to only enabled providers
const enabledProviders = OAUTH_PROVIDERS.filter((p) => ENABLED_OAUTH_PROVIDERS[p.id]);

type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]["id"];

export default function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithProvider, status, error, setError, setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // 2FA states
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the captcha");
      return;
    }
    const result = await signIn(email, password, captchaToken || undefined);
    if (result.success) {
      navigate("/docs");
    } else if (result.emailNotVerified) {
      navigate("/verify-email", { state: { email } });
    } else if (result.twoFactorRequired) {
      setTwoFactorOpen(true);
      setTotpCode("");
      setTwoFactorError(null);
    } else {
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const handleVerifyTotp = async () => {
    if (totpCode.length !== 6) {
      setTwoFactorError("Please enter a 6-digit code");
      return;
    }

    setTwoFactorLoading(true);
    setTwoFactorError(null);

    try {
      const result = await twoFactor.verifyTotp({ code: totpCode });
      if (result.error) {
        setTwoFactorError(result.error.message || "Invalid code");
        setTwoFactorLoading(false);
        return;
      }

      const session = await authClient.getSession();
      if (session.data?.user) {
        setUser({
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name ?? null,
          image: session.data.user.image ?? null,
        });
        setTwoFactorOpen(false);
        navigate("/docs");
      } else {
        setTwoFactorError("Failed to get session after verification");
      }
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: OAuthProvider) => {
    signInWithProvider(provider);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get("error_description") ?? params.get("error");
    if (oauthError) {
      setError(oauthError.replace(/\+/g, " "));
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate, setError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-brand/10 blur-[100px]" />
      </div>

      <Card className="relative w-full max-w-md border-border shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Sign in to access your graphs and share links</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* OAuth Providers - Compact button group (only shown if any are enabled) */}
          {enabledProviders.length > 0 && (
            <>
              <div className="flex justify-center gap-2">
                {enabledProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    type="button"
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 transition-all duration-200 ${provider.color}`}
                    onClick={() => handleOAuthSignIn(provider.id)}
                    disabled={status === "loading"}
                    title={`Sign in with ${provider.label}`}
                  >
                    {provider.icon}
                  </Button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-10 w-full"
              disabled={status === "loading" || (!!TURNSTILE_SITE_KEY && !captchaToken)}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* 2FA Verification Dialog */}
      <Dialog
        open={twoFactorOpen}
        onOpenChange={(open) => {
          if (!open) {
            setTwoFactorOpen(false);
            setTotpCode("");
            setTwoFactorError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                if (pasted) setTotpCode(pasted);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && totpCode.length === 6) {
                  e.preventDefault();
                  handleVerifyTotp();
                }
              }}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-mono"
              maxLength={6}
              autoComplete="one-time-code"
              inputMode="numeric"
              autoFocus
              disabled={twoFactorLoading}
            />
            {twoFactorError && <p className="mt-2 text-sm text-destructive">{twoFactorError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTwoFactorOpen(false)}
              disabled={twoFactorLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleVerifyTotp}
              disabled={twoFactorLoading || totpCode.length !== 6}
            >
              {twoFactorLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {twoFactorLoading ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
