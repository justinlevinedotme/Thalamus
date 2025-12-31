/**
 * @file MeAccountSecurityRoute.tsx
 * @description Security settings page within the /me hub. Allows managing two-factor
 * authentication, password settings, and active sessions.
 */

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Loader2, Monitor, Shield, Smartphone, Trash2 } from "lucide-react";

import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { useProfileData } from "../features/account/useProfileData";
import { apiFetch } from "../lib/apiClient";
import { twoFactor, requestPasswordReset } from "../lib/authClient";

type SessionInfo = {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
  expiresAt: string | null;
  ipAddress: string | null;
  location: string | null;
  userAgent: string | null;
  isCurrent: boolean;
};

function parseUserAgent(ua: string | null): { device: string; browser: string; os: string } {
  if (!ua) return { device: "Unknown", browser: "Unknown", os: "Unknown" };

  // Detect OS
  let os = "Unknown";
  if (/Windows NT 10/i.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6\.3/i.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6\.2/i.test(ua)) os = "Windows 8";
  else if (/Windows NT 6\.1/i.test(ua)) os = "Windows 7";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X 10[._]15/i.test(ua)) os = "macOS Catalina";
  else if (/Mac OS X 11/i.test(ua) || /Mac OS X 10[._]16/i.test(ua)) os = "macOS Big Sur";
  else if (/Mac OS X 12/i.test(ua)) os = "macOS Monterey";
  else if (/Mac OS X 13/i.test(ua)) os = "macOS Ventura";
  else if (/Mac OS X 14/i.test(ua)) os = "macOS Sonoma";
  else if (/Mac OS X 15/i.test(ua)) os = "macOS Sequoia";
  else if (/Mac OS X/i.test(ua) || /Macintosh/i.test(ua)) os = "macOS";
  else if (/iPhone/i.test(ua)) os = "iOS";
  else if (/iPad/i.test(ua)) os = "iPadOS";
  else if (/Android (\d+)/i.test(ua)) {
    const match = ua.match(/Android (\d+)/i);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/CrOS/i.test(ua)) os = "Chrome OS";

  // Detect device type
  let device = "Desktop";
  if (/Mobile|Android|iPhone/i.test(ua) && !/iPad/i.test(ua)) {
    device = "Mobile";
  } else if (/iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    device = "Tablet";
  }

  // Detect browser
  let browser = "Unknown";
  if (/Edg/i.test(ua)) browser = "Edge";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/MSIE|Trident/i.test(ua)) browser = "Internet Explorer";

  return { device, browser, os };
}

function formatLastActive(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default function MeAccountSecurityRoute() {
  const { profile, loading, twoFactorEnabled, setTwoFactorEnabled } = useProfileData();

  // 2FA states
  const [setup2FAOpen, setSetup2FAOpen] = useState(false);
  const [disable2FAOpen, setDisable2FAOpen] = useState(false);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);

  // Password states
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Session states
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<SessionInfo | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      setSessionsError(null);
      const data = await apiFetch<SessionInfo[]>("/sessions");
      setSessions(data);
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async () => {
    if (!revokeTarget) return;
    try {
      setRevoking(true);
      await apiFetch(`/sessions/${revokeTarget.id}`, { method: "DELETE" });
      setRevokeTarget(null);
      await fetchSessions();
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : "Failed to revoke session");
    } finally {
      setRevoking(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      setRevoking(true);
      await apiFetch("/sessions", { method: "DELETE" });
      setRevokeAllOpen(false);
      await fetchSessions();
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : "Failed to revoke sessions");
    } finally {
      setRevoking(false);
    }
  };

  // Check if user has a password (credential account)
  const hasPassword = profile?.linkedAccounts.some((account) => account.provider === "credential");

  const handleEnable2FA = async () => {
    if (!twoFactorPassword.trim()) {
      setTwoFactorError("Please enter your password");
      return;
    }
    try {
      setTwoFactorLoading(true);
      setTwoFactorError(null);
      const result = await twoFactor.enable({
        password: twoFactorPassword,
        issuer: "Thalamus",
      });
      if (result.error) {
        setTwoFactorError(result.error.message || "Failed to enable 2FA");
        return;
      }
      if (result.data?.totpURI) {
        setTotpUri(result.data.totpURI);
      }
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : "Failed to enable 2FA");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verifyCode.trim()) return;
    try {
      setTwoFactorLoading(true);
      setTwoFactorError(null);
      const result = await twoFactor.verifyTotp({ code: verifyCode });
      if (result.error) {
        setTwoFactorError(result.error.message || "Invalid code");
        return;
      }
      setTwoFactorEnabled(true);
      setSetup2FAOpen(false);
      setTotpUri(null);
      setVerifyCode("");
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!twoFactorPassword.trim()) {
      setTwoFactorError("Please enter your password");
      return;
    }
    try {
      setTwoFactorLoading(true);
      setTwoFactorError(null);
      const result = await twoFactor.disable({
        password: twoFactorPassword,
      });
      if (result.error) {
        setTwoFactorError(result.error.message || "Failed to disable 2FA");
        return;
      }
      setTwoFactorEnabled(false);
      setDisable2FAOpen(false);
      setTwoFactorPassword("");
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : "Failed to disable 2FA");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!profile?.email) return;
    try {
      setPasswordLoading(true);
      setPasswordError(null);
      const result = await requestPasswordReset({
        email: profile.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (result.error) {
        setPasswordError(result.error.message || "Failed to send password reset email");
        return;
      }
      setPasswordResetSent(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to send password reset email");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return <div className="py-12 text-center text-muted-foreground">Unable to load profile</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Security</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account security and authentication settings
        </p>
      </div>

      {/* Two-Factor Authentication Section */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-medium text-foreground">Two-Factor Authentication</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add an extra layer of security to your account using an authenticator app.
              </p>
            </div>
          </div>
          {twoFactorEnabled ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Enabled
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
                onClick={() => setDisable2FAOpen(true)}
              >
                Disable
              </Button>
            </div>
          ) : hasPassword ? (
            <Button
              size="sm"
              onClick={() => {
                setTwoFactorPassword("");
                setTwoFactorError(null);
                setTotpUri(null);
                setSetup2FAOpen(true);
              }}
            >
              Enable
            </Button>
          ) : (
            <Button size="sm" onClick={() => setSetPasswordOpen(true)}>
              Set Password First
            </Button>
          )}
        </div>
        {!hasPassword && !twoFactorEnabled && (
          <p className="mt-3 text-sm text-amber-600">
            You signed up with a social login provider. To enable 2FA, you need to set a password
            first.
          </p>
        )}
      </section>

      {/* Password Section */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium text-foreground">Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasPassword
                ? "Change your password to keep your account secure."
                : "Set a password to enable additional security features."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPasswordResetSent(false);
              setPasswordError(null);
              setSetPasswordOpen(true);
            }}
          >
            {hasPassword ? "Change Password" : "Set Password"}
          </Button>
        </div>
      </section>

      {/* Active Sessions Section */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Monitor className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-medium text-foreground">Active Sessions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your active sessions across devices. Revoke access if you see anything
                suspicious.
              </p>
            </div>
          </div>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
              onClick={() => setRevokeAllOpen(true)}
            >
              Revoke All Others
            </Button>
          )}
        </div>

        {sessionsError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {sessionsError}
            <button className="ml-2 underline" onClick={() => setSessionsError(null)}>
              Dismiss
            </button>
          </div>
        )}

        {sessionsLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active sessions found.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const { device, browser, os } = parseUserAgent(session.userAgent);
              const DeviceIcon = device === "Mobile" ? Smartphone : Monitor;

              return (
                <div
                  key={session.id}
                  className={`rounded-md border px-4 py-3 ${
                    session.isCurrent
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                      : "border-border bg-secondary"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <DeviceIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {browser} on {os}
                          </span>
                          {session.isCurrent && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="font-mono">{session.ipAddress || "Unknown IP"}</span>
                            {session.location && (
                              <>
                                <span className="text-muted-foreground/50">·</span>
                                <span>{session.location}</span>
                              </>
                            )}
                          </div>
                          <div>Last active {formatLastActive(session.updatedAt)}</div>
                        </div>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setRevokeTarget(session)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Revoke</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Revoke Session Dialog */}
      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately log out this device. If it wasn't you, consider changing your
              password too.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRevokeSession}
              disabled={revoking}
            >
              {revoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Session"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke All Sessions Dialog */}
      <AlertDialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke all other sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately log out all devices except this one. You'll stay signed in here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRevokeAllSessions}
              disabled={revoking}
            >
              {revoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke All Others"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Setup 2FA Dialog */}
      <Dialog
        open={setup2FAOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSetup2FAOpen(false);
            setTotpUri(null);
            setVerifyCode("");
            setTwoFactorError(null);
            setTwoFactorPassword("");
            setSecretCopied(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {totpUri
                ? "Scan the QR code with your authenticator app, then enter the verification code."
                : "Enter your password to continue setting up two-factor authentication."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {twoFactorLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : totpUri ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
                    alt="TOTP QR Code"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Or enter this code manually
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all rounded-md bg-secondary px-3 py-2 font-mono text-sm text-foreground">
                      {new URL(totpUri).searchParams.get("secret") || ""}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        const secret = new URL(totpUri).searchParams.get("secret");
                        if (secret) {
                          navigator.clipboard.writeText(secret);
                          setSecretCopied(true);
                          setTimeout(() => setSecretCopied(false), 2000);
                        }
                      }}
                      className="shrink-0 rounded-md border border-border p-2 text-muted-foreground transition hover:bg-secondary"
                      title="Copy secret"
                    >
                      {secretCopied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Verification Code
                  </label>
                  <Input
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                      if (pasted) setVerifyCode(pasted);
                    }}
                    placeholder="000000"
                    className="mt-1 text-center text-lg tracking-widest"
                    maxLength={6}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                  />
                </div>
                {twoFactorError && <p className="text-sm text-red-600">{twoFactorError}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Password</label>
                  <Input
                    type="password"
                    value={twoFactorPassword}
                    onChange={(e) => setTwoFactorPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1"
                    autoFocus
                  />
                </div>
                {twoFactorError && <p className="text-sm text-red-600">{twoFactorError}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSetup2FAOpen(false)}>
              Cancel
            </Button>
            {totpUri ? (
              <Button
                type="button"
                disabled={twoFactorLoading || verifyCode.length !== 6}
                onClick={handleVerify2FA}
              >
                {twoFactorLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {twoFactorLoading ? "Verifying..." : "Verify & Enable"}
              </Button>
            ) : (
              <Button
                type="button"
                disabled={twoFactorLoading || !twoFactorPassword.trim()}
                onClick={handleEnable2FA}
              >
                {twoFactorLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {twoFactorLoading ? "Setting up..." : "Continue"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog
        open={disable2FAOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDisable2FAOpen(false);
            setTwoFactorPassword("");
            setTwoFactorError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              This will remove the extra security layer from your account. Enter your password to
              confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                value={twoFactorPassword}
                onChange={(e) => setTwoFactorPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1"
                autoFocus
              />
            </div>
            {twoFactorError && <p className="text-sm text-red-600">{twoFactorError}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDisable2FAOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={twoFactorLoading || !twoFactorPassword.trim()}
              onClick={handleDisable2FA}
            >
              {twoFactorLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {twoFactorLoading ? "Disabling..." : "Disable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Password Dialog */}
      <Dialog
        open={setPasswordOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSetPasswordOpen(false);
            setPasswordResetSent(false);
            setPasswordError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{hasPassword ? "Change Password" : "Set a Password"}</DialogTitle>
            <DialogDescription>
              {passwordResetSent
                ? "Check your email for a link to set your password."
                : hasPassword
                  ? "We'll send a password reset link to your email address."
                  : "To enable two-factor authentication, you need to set a password for your account."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {passwordResetSent ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  We've sent a password reset link to <strong>{profile?.email}</strong>.
                  {!hasPassword && " After setting your password, return here to enable 2FA."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We'll send a password {hasPassword ? "reset" : "setup"} link to your email address
                  ({profile?.email}).
                </p>
                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSetPasswordOpen(false)}>
              {passwordResetSent ? "Close" : "Cancel"}
            </Button>
            {!passwordResetSent && (
              <Button type="button" disabled={passwordLoading} onClick={handleSendPasswordReset}>
                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {passwordLoading ? "Sending..." : "Send Password Link"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
