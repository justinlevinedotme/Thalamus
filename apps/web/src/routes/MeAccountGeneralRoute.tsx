/**
 * @file MeAccountGeneralRoute.tsx
 * @description General account settings page within the /me hub. Allows editing
 * display name, profile picture, email address, and email preferences.
 */

import { useState } from "react";
import { Camera, Check, Loader2, Mail, User } from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
import { useAuthStore } from "../store/authStore";
import { changeEmail } from "../lib/authClient";

export default function MeAccountGeneralRoute() {
  const { user, setUser } = useAuthStore();
  const {
    profile,
    loading,
    error,
    emailPrefs,
    updateName,
    updateImage,
    updateEmailPrefs,
    clearError,
  } = useProfileData();

  // Edit states
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editImageOpen, setEditImageOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Email change states
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [emailChangeSent, setEmailChangeSent] = useState(false);

  // Email preferences loading
  const [emailPrefsLoading, setEmailPrefsLoading] = useState(false);

  const handleUpdateName = async () => {
    if (saving) return;
    try {
      setSaving(true);
      setSaveError(null);
      await updateName(newName);
      setUser(user ? { ...user, name: newName } : null);
      setEditNameOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateImage = async () => {
    if (saving) return;
    try {
      setSaving(true);
      setSaveError(null);
      await updateImage(newImage);
      setUser(user ? { ...user, image: newImage } : null);
      setEditImageOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update image");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      setEmailChangeError("Please enter a new email address");
      return;
    }
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
        callbackURL: `${window.location.origin}/me/account/general`,
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

  const handleUpdateEmailPrefs = async (
    key: "marketingEmails" | "productUpdates",
    value: boolean
  ) => {
    setEmailPrefsLoading(true);
    await updateEmailPrefs(key, value).finally(() => {
      setEmailPrefsLoading(false);
    });
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
        <h1 className="text-2xl font-semibold text-foreground">General</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and email preferences</p>
      </div>

      {(error || saveError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          {error || saveError}
          <button
            className="ml-2 underline"
            onClick={() => {
              clearError();
              setSaveError(null);
            }}
          >
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
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">Plan</p>
              {profile.plan === "plus" && (
                <Badge variant="plus" className="text-[10px] px-1.5 py-0">
                  PLUS
                </Badge>
              )}
              {profile.plan === "edu" && (
                <Badge variant="edu" className="text-[10px] px-1.5 py-0">
                  EDU
                </Badge>
              )}
            </div>
            <p className="text-sm capitalize text-muted-foreground">{profile.plan}</p>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{profile.maxGraphs}</span> graphs
              </p>
              <p>
                <span className="font-medium text-foreground">
                  {profile.plan === "plus" ? 50 : profile.plan === "edu" ? 30 : 20}
                </span>{" "}
                saved nodes
              </p>
              <p>
                <span className="font-medium text-foreground">
                  {profile.plan === "plus"
                    ? "Unlimited"
                    : profile.plan === "edu"
                      ? "2 years"
                      : `${profile.retentionDays} days`}
                </span>{" "}
                retention
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Email Preferences Section */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium text-foreground">Email Preferences</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Choose which emails you'd like to receive. Transactional emails (password resets, security
          alerts) cannot be disabled.
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
              onClick={() => handleUpdateEmailPrefs("marketingEmails", !emailPrefs.marketingEmails)}
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
              onClick={() => handleUpdateEmailPrefs("productUpdates", !emailPrefs.productUpdates)}
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  We've sent a verification link to <strong>{newEmail}</strong>. Click the link in
                  the email to complete the change.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Current Email</label>
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
    </div>
  );
}
