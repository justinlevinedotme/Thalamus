/**
 * @file VerifyEmailRoute.tsx
 * @description Email verification pending page. Displays instructions for users who need
 * to verify their email address, with option to resend the verification email.
 */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { authClient } from "../lib/authClient";
import { useTheme } from "../lib/theme";

export default function VerifyEmailRoute() {
  const location = useLocation();
  const email = location.state?.email as string | undefined;
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setError(null);
    setResent(false);

    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/me/files`,
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
    <div className="relative min-h-screen w-full">
      {/* Horizon Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: isDark
            ? "radial-gradient(125% 125% at 50% 90%, #000000 40%, #1a0a00 100%)"
            : "radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #fff5f0 100%)",
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <Card className="relative w-full max-w-md border-border shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-center text-2xl font-semibold tracking-tight">
                Verify your email
              </CardTitle>
              <CardDescription className="text-center">
                {email ? (
                  <>
                    We've sent a verification link to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </>
                ) : (
                  "We've sent a verification link to your email address."
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Click the link in the email to verify your account. If you don't see the email,
                check your spam folder.
              </p>

              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              {resent && (
                <div className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
                  Verification email sent! Check your inbox.
                </div>
              )}

              {email && (
                <Button
                  variant="outline"
                  className="h-10 w-full"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? "Sending..." : "Resend verification email"}
                </Button>
              )}
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Already verified?{" "}
                <Link
                  to="/login"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </main>

        <Footer />
      </div>
    </div>
  );
}
