/**
 * @file ForgotPasswordRoute.tsx
 * @description Password reset request page. Allows users to enter their email to receive
 * a password reset link. Shows confirmation message on successful submission.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../lib/theme";
import { requestPasswordReset } from "../lib/authClient";

export default function ForgotPasswordRoute() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const result = await requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (result.error) {
        setError(result.error.message || "Failed to send reset email");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setStatus("error");
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
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Reset password
              </CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {status === "success" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-foreground">Check your email</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We've sent a password reset link to{" "}
                      <span className="font-medium">{email}</span>
                    </p>
                  </div>
                  <div className="rounded-md bg-secondary p-3">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        <p>Didn't receive the email? Check your spam folder or</p>
                        <button
                          type="button"
                          onClick={() => {
                            setStatus("idle");
                            setError(null);
                          }}
                          className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          try another email address
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus
                      className="h-10"
                    />
                  </div>

                  {error && (
                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="h-10 w-full"
                    disabled={status === "loading" || !email}
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
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
