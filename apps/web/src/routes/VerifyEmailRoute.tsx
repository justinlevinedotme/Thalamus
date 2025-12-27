import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { authClient } from "../lib/authClient";

export default function VerifyEmailRoute() {
  const location = useLocation();
  const email = location.state?.email as string | undefined;
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setError(null);
    setResent(false);

    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/docs`,
      });
      if (result.error) {
        setError(result.error.message || "Failed to resend verification email");
      } else {
        setResent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <svg
            className="h-6 w-6 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Verify your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {email ? (
              <>
                We've sent a verification link to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </>
            ) : (
              "We've sent a verification link to your email address."
            )}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Click the link in the email to verify your account. If you don't see the email, check your
          spam folder.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {resent && (
          <p className="text-sm text-emerald-600">Verification email sent! Check your inbox.</p>
        )}
        {email && (
          <button
            className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-secondary disabled:opacity-50"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>
        )}
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Already verified?{" "}
            <Link className="text-foreground underline" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
