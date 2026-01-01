/**
 * @file ProfileRoute.tsx
 * @description User profile management page. Allows editing display name, managing profile
 * picture, viewing linked OAuth accounts, configuring two-factor authentication,
 * and updating email preferences.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Camera,
  Check,
  Copy,
  Github,
  KeyRound,
  Link2,
  Loader2,
  Mail,
  Shield,
  Trash2,
  User,
} from "lucide-react";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useTheme } from "../lib/theme";
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
import { VerifyButton } from "../components/ui/verify-button";
import { HoldButton } from "../components/ui/hold-button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuthStore } from "../store/authStore";
import { apiFetch, ApiError } from "../lib/apiClient";
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
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

  // Account deletion states
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionFeedback, setDeletionFeedback] = useState("");
  const [deletionTotpCode, setDeletionTotpCode] = useState("");
  const [deletionRequires2FA, setDeletionRequires2FA] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const [deletionSubmitted, setDeletionSubmitted] = useState(false);
  const [hasPendingDeletion, setHasPendingDeletion] = useState(false);

  // Predefined deletion reasons
  const DELETION_REASONS = [
    { value: "no-longer-needed", label: "I no longer need the service" },
    { value: "found-alternative", label: "I found a better alternative" },
    { value: "too-expensive", label: "It's too expensive" },
    { value: "missing-features", label: "Missing features I need" },
    { value: "too-complicated", label: "Too complicated to use" },
    { value: "privacy-concerns", label: "Privacy concerns" },
    { value: "temporary-account", label: "This was a temporary account" },
    { value: "other", label: "Other reason" },
  ];

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

      // Check for pending deletion request
      try {
        const deletionStatus = await apiFetch<{ hasPendingRequest: boolean }>(
          "/profile/deletion-request"
        );
        setHasPendingDeletion(deletionStatus.hasPendingRequest);
      } catch {
        // Ignore errors
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

  const handleVerify2FA = async (): Promise<boolean> => {
    if (!verifyCode.trim()) return false;
    try {
      setTwoFactorError(null);
      const result = await twoFactor.verifyTotp({ code: verifyCode });
      if (result.error) {
        setTwoFactorError(result.error.message || "Invalid code");
        return false;
      }
      setTwoFactorEnabled(true);
      return true;
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : "Verification failed");
      return false;
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
      // Delay to show confirmation
      setTimeout(() => {
        setDisable2FAOpen(false);
        setTwoFactorPassword("");
      }, 1500);
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

  const handleRequestDeletion = async () => {
    try {
      setDeletionLoading(true);
      setDeletionError(null);

      // Get the label for the selected reason
      const reasonLabel = DELETION_REASONS.find((r) => r.value === deletionReason)?.label;

      await apiFetch("/profile/deletion-request", {
        method: "POST",
        body: JSON.stringify({
          reason: reasonLabel || null,
          additionalFeedback: deletionFeedback.trim() || null,
          totpCode: deletionTotpCode || undefined,
        }),
      });

      // Delay to show confirmation
      setTimeout(() => {
        setDeletionSubmitted(true);
        setHasPendingDeletion(true);
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError && err.requires2FA) {
        setDeletionRequires2FA(true);
        setDeletionError(null); // Clear error, show 2FA input instead
      } else {
        setDeletionError(err instanceof Error ? err.message : "Failed to submit deletion request");
      }
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      setDeletionLoading(true);
      setDeletionError(null);
      await apiFetch("/profile/deletion-request", {
        method: "DELETE",
      });
      setHasPendingDeletion(false);
      setDeleteAccountOpen(false);
    } catch (err) {
      setDeletionError(err instanceof Error ? err.message : "Failed to cancel deletion request");
    } finally {
      setDeletionLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="relative min-h-screen w-full">
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
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="relative min-h-screen w-full">
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
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Unable to load profile</p>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
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
        <div className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-2xl space-y-8">
            <h1 className="text-2xl font-semibold text-foreground">Profile Settings</h1>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
                <button className="ml-2 underline" onClick={() => setError(null)}>
                  Dismiss
                </button>
              </div>
            )}

            {/* Profile Picture Section */}
            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-medium text-foreground">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name || "Profile"}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-foreground text-background transition hover:bg-foreground/90"
                    onClick={() => {
                      setNewImage(profile.image || "");
                      setEditImageOpen(true);
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Your profile picture is visible to others when you share graphs.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter a URL to an image hosted elsewhere (e.g., GitHub, Gravatar).
                  </p>
                </div>
              </div>
            </section>

            {/* Account Details Section */}
            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-medium text-foreground">Account Details</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Name</p>
                    <p className="text-sm text-muted-foreground">{profile.name || "Not set"}</p>
                  </div>
                  <button
                    className="text-sm text-muted-foreground underline hover:text-foreground"
                    onClick={() => {
                      setNewName(profile.name || "");
                      setEditNameOpen(true);
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                  <button
                    className="text-sm text-muted-foreground underline hover:text-foreground"
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
                <div className="border-t border-border" />
                <div>
                  <p className="text-sm font-medium text-foreground">Plan</p>
                  <p className="text-sm capitalize text-muted-foreground">{profile.plan}</p>
                </div>
              </div>
            </section>

            {/* Two-Factor Authentication Section */}
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <h2 className="text-lg font-medium text-foreground">
                      Two-Factor Authentication
                    </h2>
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
                  You signed up with a social login provider. To enable 2FA, you need to set a
                  password first.
                </p>
              )}
            </section>

            {/* Linked Accounts Section */}
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-medium text-foreground">Linked Accounts</h2>
              </div>
              {profile.linkedAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No linked accounts.</p>
              ) : (
                <div className="space-y-3">
                  {profile.linkedAccounts.map((account) => (
                    <div
                      key={account.provider}
                      className="flex items-center justify-between rounded-md border border-border bg-secondary px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          {providerIcons[account.provider] || <User className="h-5 w-5" />}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {providerLabels[account.provider] || account.provider}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Connected {new Date(account.linkedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Email Preferences Section */}
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-medium text-foreground">Email Preferences</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Choose which emails you'd like to receive. Transactional emails (password resets,
                security alerts) cannot be disabled.
              </p>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Marketing emails</p>
                    <p className="text-xs text-muted-foreground">
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
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
                      emailPrefs.marketingEmails ? "bg-foreground" : "bg-border"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                        emailPrefs.marketingEmails ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>
                <div className="border-t border-border" />
                <label className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Product updates</p>
                    <p className="text-xs text-muted-foreground">New features and improvements</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={emailPrefs.productUpdates}
                    disabled={emailPrefsLoading}
                    onClick={() =>
                      handleUpdateEmailPrefs("productUpdates", !emailPrefs.productUpdates)
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
                      emailPrefs.productUpdates ? "bg-foreground" : "bg-border"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                        emailPrefs.productUpdates ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>
              </div>
            </section>

            {/* Delete Account Section */}
            <section className="rounded-lg border border-red-200 bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Trash2 className="mt-0.5 h-5 w-5 text-red-500" />
                  <div>
                    <h2 className="text-lg font-medium text-foreground">Delete Account</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be
                      undone.
                    </p>
                  </div>
                </div>
                {hasPendingDeletion ? (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      Pending
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeletionError(null);
                        setDeleteAccountOpen(true);
                      }}
                    >
                      View Request
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
                    onClick={() => {
                      setDeletionReason("");
                      setDeletionFeedback("");
                      setDeletionTotpCode("");
                      setDeletionRequires2FA(false);
                      setDeletionError(null);
                      setDeletionSubmitted(false);
                      setDeleteAccountOpen(true);
                    }}
                  >
                    Delete Account
                  </Button>
                )}
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
                <Button type="button" variant="outline" onClick={() => setEditNameOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save"}
                </Button>
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
                <Button type="button" variant="outline" onClick={() => setEditImageOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !newImage.trim()}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save"}
                </Button>
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
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Or enter this code manually
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-secondary px-3 py-2 text-sm font-mono text-foreground break-all">
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
                        const pasted = e.clipboardData
                          .getData("text")
                          .replace(/\D/g, "")
                          .slice(0, 6);
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
                <VerifyButton
                  onClick={handleVerify2FA}
                  onSuccess={() => {
                    setSetup2FAOpen(false);
                    setTotpUri(null);
                    setVerifyCode("");
                  }}
                  successText="Enabled"
                  disabled={verifyCode.length !== 6}
                >
                  Verify & Enable
                </VerifyButton>
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
            <div className="py-4 space-y-4">
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
              <HoldButton
                onHoldComplete={handleDisable2FA}
                holdDuration={1500}
                holdingText="Hold to disable..."
                processingText="Disabling..."
                completeText="Disabled"
                disabled={!twoFactorPassword.trim()}
              >
                Disable 2FA
              </HoldButton>
              <Button type="button" variant="outline" onClick={() => setDisable2FAOpen(false)}>
                Cancel
              </Button>
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
                  <p className="text-center text-sm text-muted-foreground">
                    We've sent a password reset link to <strong>{profile?.email}</strong>. After
                    setting your password, return here to enable 2FA.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    We'll send a password setup link to your email address ({profile?.email}). Once
                    you've set a password, you'll be able to enable two-factor authentication.
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
                  <p className="text-center text-sm text-muted-foreground">
                    We've sent a verification link to <strong>{newEmail}</strong>. Click the link in
                    the email to complete the change.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Current Email
                    </label>
                    <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">New Email</label>
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
              <Button type="button" variant="outline" onClick={() => setEditEmailOpen(false)}>
                {emailChangeSent ? "Close" : "Cancel"}
              </Button>
              {!emailChangeSent && (
                <Button
                  type="button"
                  disabled={emailChangeLoading || !newEmail.trim()}
                  onClick={handleChangeEmail}
                >
                  {emailChangeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {emailChangeLoading ? "Sending..." : "Send Verification"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteAccountOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteAccountOpen(false);
              setDeletionError(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">
                {hasPendingDeletion ? "Deletion Request Pending" : "Delete Account"}
              </DialogTitle>
              <DialogDescription>
                {hasPendingDeletion
                  ? "Your account deletion request is being processed. You can cancel it if you've changed your mind."
                  : "This will permanently delete your account, all your graphs, and shared links. This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {deletionSubmitted ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Content Deleted</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      All your graphs and shared links have been permanently deleted. Your account
                      will be fully removed within 30 days.
                    </p>
                  </div>
                </div>
              ) : hasPendingDeletion ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium">Pending Deletion</p>
                        <p className="mt-1">
                          Your account is scheduled for deletion. All your data will be permanently
                          removed once processed.
                        </p>
                      </div>
                    </div>
                  </div>
                  {deletionError && <p className="text-sm text-red-600">{deletionError}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md bg-red-50 p-4 dark:bg-red-950/50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                      <div className="text-sm text-red-800 dark:text-red-200">
                        <p className="font-medium">This action is immediate and irreversible</p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-red-700 dark:text-red-300">
                          <li>All your graphs will be permanently deleted</li>
                          <li>All shared links will stop working immediately</li>
                          <li>Your account settings and preferences will be removed</li>
                          <li>Your account will be fully removed within 30 days</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deletion-reason">Why are you leaving? (optional)</Label>
                    <Select value={deletionReason} onValueChange={setDeletionReason}>
                      <SelectTrigger id="deletion-reason">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {DELETION_REASONS.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deletion-feedback">Additional feedback (optional)</Label>
                    <Textarea
                      id="deletion-feedback"
                      value={deletionFeedback}
                      onChange={(e) => setDeletionFeedback(e.target.value)}
                      placeholder="Help us improve by sharing more details about your experience..."
                      rows={3}
                    />
                  </div>

                  {/* 2FA verification section */}
                  {deletionRequires2FA && (
                    <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-600" />
                        <Label
                          htmlFor="deletion-totp"
                          className="text-sm font-medium text-amber-800 dark:text-amber-200"
                        >
                          Two-Factor Authentication Required
                        </Label>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Enter the 6-digit code from your authenticator app to confirm deletion.
                      </p>
                      <Input
                        id="deletion-totp"
                        value={deletionTotpCode}
                        onChange={(e) =>
                          setDeletionTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="000000"
                        className="text-center text-lg font-mono tracking-widest"
                        maxLength={6}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                      />
                    </div>
                  )}

                  {deletionError && <p className="text-sm text-red-600">{deletionError}</p>}
                </div>
              )}
            </div>
            <DialogFooter>
              {deletionSubmitted ? (
                <Button type="button" variant="outline" onClick={() => setDeleteAccountOpen(false)}>
                  Close
                </Button>
              ) : hasPendingDeletion ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeleteAccountOpen(false)}
                  >
                    Close
                  </Button>
                  <Button type="button" disabled={deletionLoading} onClick={handleCancelDeletion}>
                    {deletionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {deletionLoading ? "Cancelling..." : "Cancel Request"}
                  </Button>
                </>
              ) : (
                <>
                  <HoldButton
                    onHoldComplete={handleRequestDeletion}
                    holdDuration={2000}
                    holdingText="Hold to delete..."
                    processingText="Deleting..."
                    completeText="Deleted"
                    disabled={deletionRequires2FA && deletionTotpCode.length !== 6}
                  >
                    Delete My Account
                  </HoldButton>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeleteAccountOpen(false)}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
