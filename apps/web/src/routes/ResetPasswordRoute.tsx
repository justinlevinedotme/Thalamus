/**
 * @file ResetPasswordRoute.tsx
 * @description Password reset form page. Validates reset token from URL, allows users to
 * set a new password with strength requirements, and shows success/error states.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, Check, X } from "lucide-react";

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
import { resetPassword } from "../lib/authClient";

const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function ResetPasswordRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "invalid">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
    }
  }, [token]);

  const passwordValid = PASSWORD_REQUIREMENTS.every((req) => req.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValid) {
      setError("Please meet all password requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setStatus("invalid");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const result = await resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setError(result.error.message || "Failed to reset password");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setStatus("error");
    }
  };

  // Invalid or expired token state
  if (status === "invalid") {
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
                  Invalid link
                </CardTitle>
                <CardDescription>
                  This password reset link is invalid or has expired.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Password reset links expire after a short time for security reasons. Please
                  request a new link.
                </p>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 border-t border-border pt-6">
                <Button asChild className="w-full">
                  <Link to="/forgot-password">Request new link</Link>
                </Button>
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

  // Success state
  if (status === "success") {
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
                  Password reset
                </CardTitle>
                <CardDescription>Your password has been successfully updated.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  You can now sign in with your new password.
                </p>
              </CardContent>

              <CardFooter className="border-t border-border pt-6">
                <Button onClick={() => navigate("/login")} className="w-full">
                  Sign in
                </Button>
              </CardFooter>
            </Card>
          </main>

          <Footer />
        </div>
      </div>
    );
  }

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
                Create new password
              </CardTitle>
              <CardDescription>Enter a new password for your account.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-password">New password</Label>
                  <div className="relative">
                    <Input
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      autoFocus
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

                {/* Password requirements */}
                {password.length > 0 && (
                  <div className="space-y-1.5 rounded-md bg-secondary p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Password requirements:
                    </p>
                    <div className="grid gap-1">
                      {PASSWORD_REQUIREMENTS.map((req) => {
                        const passed = req.test(password);
                        return (
                          <div
                            key={req.id}
                            className={`flex items-center gap-2 text-xs transition-colors ${
                              passed ? "text-green-600" : "text-muted-foreground"
                            }`}
                          >
                            {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {req.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reset-confirm-password">Confirm new password</Label>
                  <div className="relative">
                    <Input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="h-10 pr-10"
                      error={confirmPassword.length > 0 && !passwordsMatch}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-10 w-full"
                  disabled={status === "loading" || !passwordValid || !passwordsMatch}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>
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
