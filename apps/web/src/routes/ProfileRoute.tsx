import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Check,
  Copy,
  Github,
  KeyRound,
  Link2,
  Loader2,
  Mail,
  Shield,
  User,
} from "lucide-react";

import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { useAuthStore } from "../store/authStore";
import { apiFetch } from "../lib/apiClient";
import { twoFactor, authClient, requestPasswordReset, changeEmail } from "../lib/authClient";

type LinkedAccount = {
  provider: string;
  linkedAt: string;
};

type ProfileData = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  plan: string;
  maxGraphs: number;
  retentionDays: number;
  linkedAccounts: LinkedAccount[];
};

const providerIcons: Record<string, React.ReactNode> = {
  github: <Github className="h-5 w-5" />,
  credential: <KeyRound className="h-5 w-5" />,
};

const providerLabels: Record<string, string> = {
  github: "GitHub",
  google: "Google",
  apple: "Apple",
  gitlab: "GitLab",
  atlassian: "Atlassian",
  credential: "Email & Password",
};

export default function ProfileRoute() {
  const navigate = useNavigate();
  const { user, status, setUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editImageOpen, setEditImageOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");
  const [saving, setSaving] = useState(false);

  // 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setup2FAOpen, setSetup2FAOpen] = useState(false);
  const [disable2FAOpen, setDisable2FAOpen] = useState(false);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);

  // Password states (for OAuth-only users)
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Email change states
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [emailChangeSent, setEmailChangeSent] = useState(false);

  // Email preferences states
  const [emailPrefs, setEmailPrefs] = useState({ marketingEmails: true, productUpdates: true });
  const [emailPrefsLoading, setEmailPrefsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/login");
      return;
    }

    if (status === "authenticated") {
      void loadProfile();
    }
  }, [status, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<ProfileData>("/profile");
      setProfile(data);

      // Check if 2FA is enabled
      const session = await authClient.getSession();
      setTwoFactorEnabled(session.data?.user?.twoFactorEnabled ?? false);

      // Load email preferences
      try {
        const prefs = await apiFetch<{ marketingEmails: boolean; productUpdates: boolean }>(
          "/profile/email-preferences"
        );
        setEmailPrefs(prefs);
      } catch {
        // Ignore errors, use defaults
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmailPrefs = async (
    key: "marketingEmails" | "productUpdates",
    value: boolean
  ) => {
    setEmailPrefsLoading(true);
    try {
      const updated = await apiFetch<{ marketingEmails: boolean; productUpdates: boolean }>(
        "/profile/email-preferences",
        {
          method: "PATCH",
          body: JSON.stringify({ [key]: value }),
        }
      );
      setEmailPrefs(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update email preferences");
    } finally {
      setEmailPrefsLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (saving) return;
    try {
      setSaving(true);
      const updated = await apiFetch<{ name: string; image: string }>("/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: newName }),
      });
      setProfile((prev) => (prev ? { ...prev, name: updated.name } : null));
      setUser(user ? { ...user, name: updated.name } : null);
      setEditNameOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateImage = async () => {
    if (saving) return;
    try {
      setSaving(true);
      const updated = await apiFetch<{ name: string; image: string }>("/profile", {
        method: "PATCH",
        body: JSON.stringify({ image: newImage }),
      });
      setProfile((prev) => (prev ? { ...prev, image: updated.image } : null));
      setUser(user ? { ...user, image: updated.image } : null);
      setEditImageOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update image");
    } finally {
      setSaving(false);
    }
  };

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

  // Check if user has a password (credential account)
  const hasPassword = profile?.linkedAccounts.some((account) => account.provider === "credential");

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

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      setEmailChangeError("Please enter a new email address");
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailChangeError("Please enter a valid email address");
      return;
    }
    if (newEmail === profile?.email) {
      setEmailChangeError("New email must be different from current email");
      return;
    }
    try {
      setEmailChangeLoading(true);
      setEmailChangeError(null);
      const result = await changeEmail({
        newEmail,
        callbackURL: `${window.location.origin}/profile`,
      });
      if (result.error) {
        setEmailChangeError(result.error.message || "Failed to change email");
        return;
      }
      setEmailChangeSent(true);
    } catch (err) {
      setEmailChangeError(err instanceof Error ? err.message : "Failed to change email");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-slate-500">Unable to load profile</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <div className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <h1 className="text-2xl font-semibold text-slate-900">Profile Settings</h1>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
              <button className="ml-2 underline" onClick={() => setError(null)}>
                Dismiss
              </button>
            </div>
          )}

          {/* Profile Picture Section */}
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-medium text-slate-900">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name || "Profile"}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-12 w-12 text-slate-400" />
                  </div>
                )}
                <button
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white transition hover:bg-slate-800"
                  onClick={() => {
                    setNewImage(profile.image || "");
                    setEditImageOpen(true);
                  }}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  Your profile picture is visible to others when you share graphs.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Enter a URL to an image hosted elsewhere (e.g., GitHub, Gravatar).
                </p>
              </div>
            </div>
          </section>

          {/* Account Details Section */}
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-medium text-slate-900">Account Details</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Name</p>
                  <p className="text-sm text-slate-500">{profile.name || "Not set"}</p>
                </div>
                <button
                  className="text-sm text-slate-600 underline hover:text-slate-900"
                  onClick={() => {
                    setNewName(profile.name || "");
                    setEditNameOpen(true);
                  }}
                >
                  Edit
                </button>
              </div>
              <div className="border-t border-slate-100" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Email</p>
                  <p className="text-sm text-slate-500">{profile.email}</p>
                </div>
                <button
                  className="text-sm text-slate-600 underline hover:text-slate-900"
                  onClick={() => {
                    setNewEmail("");
                    setEmailChangeError(null);
                    setEmailChangeSent(false);
                    setEditEmailOpen(true);
                  }}
                >
                  Edit
                </button>
              </div>
              <div className="border-t border-slate-100" />
              <div>
                <p className="text-sm font-medium text-slate-700">Plan</p>
                <p className="text-sm capitalize text-slate-500">{profile.plan}</p>
              </div>
            </div>
          </section>

          {/* Two-Factor Authentication Section */}
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 text-slate-600" />
                <div>
                  <h2 className="text-lg font-medium text-slate-900">Two-Factor Authentication</h2>
                  <p className="mt-1 text-sm text-slate-500">
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
                  <button
                    className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
                    onClick={() => setDisable2FAOpen(true)}
                  >
                    Disable
                  </button>
                </div>
              ) : hasPassword ? (
                <button
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white transition hover:bg-slate-800"
                  onClick={() => {
                    setTwoFactorPassword("");
                    setTwoFactorError(null);
                    setTotpUri(null);
                    setSetup2FAOpen(true);
                  }}
                >
                  Enable
                </button>
              ) : (
                <button
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white transition hover:bg-slate-800"
                  onClick={() => setSetPasswordOpen(true)}
                >
                  Set Password First
                </button>
              )}
            </div>
            {!hasPassword && !twoFactorEnabled && (
              <p className="mt-3 text-sm text-amber-600">
                You signed up with a social login provider. To enable 2FA, you need to set a
                password first.
              </p>
            )}
          </section>

          {/* Linked Accounts Section */}
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-medium text-slate-900">Linked Accounts</h2>
            </div>
            {profile.linkedAccounts.length === 0 ? (
              <p className="text-sm text-slate-500">No linked accounts.</p>
            ) : (
              <div className="space-y-3">
                {profile.linkedAccounts.map((account) => (
                  <div
                    key={account.provider}
                    className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600">
                        {providerIcons[account.provider] || <User className="h-5 w-5" />}
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {providerLabels[account.provider] || account.provider}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Connected {new Date(account.linkedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Email Preferences Section */}
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-medium text-slate-900">Email Preferences</h2>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              Choose which emails you'd like to receive. Transactional emails (password resets,
              security alerts) cannot be disabled.
            </p>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Marketing emails</p>
                  <p className="text-xs text-slate-500">
                    Product announcements and promotional content
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={emailPrefs.marketingEmails}
                  disabled={emailPrefsLoading}
                  onClick={() =>
                    handleUpdateEmailPrefs("marketingEmails", !emailPrefs.marketingEmails)
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 ${
                    emailPrefs.marketingEmails ? "bg-slate-900" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      emailPrefs.marketingEmails ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
              <div className="border-t border-slate-100" />
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Product updates</p>
                  <p className="text-xs text-slate-500">New features and improvements</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={emailPrefs.productUpdates}
                  disabled={emailPrefsLoading}
                  onClick={() =>
                    handleUpdateEmailPrefs("productUpdates", !emailPrefs.productUpdates)
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 ${
                    emailPrefs.productUpdates ? "bg-slate-900" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      emailPrefs.productUpdates ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            </div>
          </section>
        </div>
      </div>
      <Footer />

      {/* Edit Name Dialog */}
      <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Name</DialogTitle>
            <DialogDescription>Enter your display name.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleUpdateName();
            }}
          >
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Your name"
              className="mt-2"
              autoFocus
            />
            <DialogFooter className="mt-4">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                onClick={() => setEditNameOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={editImageOpen} onOpenChange={setEditImageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Picture</DialogTitle>
            <DialogDescription>Enter the URL of your profile image.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleUpdateImage();
            }}
          >
            <Input
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              placeholder="https://example.com/your-image.jpg"
              className="mt-2"
              autoFocus
            />
            {newImage && (
              <div className="mt-4 flex justify-center">
                <img
                  src={newImage}
                  alt="Preview"
                  className="h-20 w-20 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <DialogFooter className="mt-4">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                onClick={() => setEditImageOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
                disabled={saving || !newImage.trim()}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Or enter this code manually
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md bg-slate-100 px-3 py-2 text-sm font-mono text-slate-800 break-all">
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
                      className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
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
                  <label className="block text-sm font-medium text-slate-700">
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
                  <label className="block text-sm font-medium text-slate-700">Password</label>
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
            <button
              type="button"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              onClick={() => setSetup2FAOpen(false)}
            >
              Cancel
            </button>
            {totpUri ? (
              <button
                type="button"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
                disabled={twoFactorLoading || verifyCode.length !== 6}
                onClick={handleVerify2FA}
              >
                {twoFactorLoading ? "Verifying..." : "Verify & Enable"}
              </button>
            ) : (
              <button
                type="button"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
                disabled={twoFactorLoading || !twoFactorPassword.trim()}
                onClick={handleEnable2FA}
              >
                {twoFactorLoading ? "Setting up..." : "Continue"}
              </button>
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
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
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
            <button
              type="button"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              onClick={() => setDisable2FAOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700 disabled:opacity-50"
              disabled={twoFactorLoading || !twoFactorPassword.trim()}
              onClick={handleDisable2FA}
            >
              {twoFactorLoading ? "Disabling..." : "Disable 2FA"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Password Dialog (for OAuth-only users) */}
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
            <DialogTitle>Set a Password</DialogTitle>
            <DialogDescription>
              {passwordResetSent
                ? "Check your email for a link to set your password."
                : "To enable two-factor authentication, you need to set a password for your account."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {passwordResetSent ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-center text-sm text-slate-600">
                  We've sent a password reset link to <strong>{profile?.email}</strong>. After
                  setting your password, return here to enable 2FA.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  We'll send a password setup link to your email address ({profile?.email}). Once
                  you've set a password, you'll be able to enable two-factor authentication.
                </p>
                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              type="button"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              onClick={() => setSetPasswordOpen(false)}
            >
              {passwordResetSent ? "Close" : "Cancel"}
            </button>
            {!passwordResetSent && (
              <button
                type="button"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
                disabled={passwordLoading}
                onClick={handleSendPasswordReset}
              >
                {passwordLoading ? "Sending..." : "Send Password Link"}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog
        open={editEmailOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditEmailOpen(false);
            setNewEmail("");
            setEmailChangeError(null);
            setEmailChangeSent(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              {emailChangeSent
                ? "Check your new email for a verification link."
                : "Enter your new email address. We'll send a verification link to confirm the change."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {emailChangeSent ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-center text-sm text-slate-600">
                  We've sent a verification link to <strong>{newEmail}</strong>. Click the link in
                  the email to complete the change.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Current Email</label>
                  <p className="mt-1 text-sm text-slate-500">{profile?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">New Email</label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new@example.com"
                    className="mt-1"
                    autoFocus
                  />
                </div>
                {emailChangeError && <p className="text-sm text-red-600">{emailChangeError}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              type="button"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              onClick={() => setEditEmailOpen(false)}
            >
              {emailChangeSent ? "Close" : "Cancel"}
            </button>
            {!emailChangeSent && (
              <button
                type="button"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
                disabled={emailChangeLoading || !newEmail.trim()}
                onClick={handleChangeEmail}
              >
                {emailChangeLoading ? "Sending..." : "Send Verification"}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
