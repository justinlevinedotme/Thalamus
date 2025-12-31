/**
 * @file useProfileData.ts
 * @description Shared hook for fetching and managing user profile data across
 * account settings pages. Centralizes profile state, email preferences, 2FA status,
 * and deletion request status.
 */

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../lib/apiClient";
import { authClient } from "../../lib/authClient";

export type LinkedAccount = {
  provider: string;
  linkedAt: string;
};

export type ProfileData = {
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

export type EmailPreferences = {
  marketingEmails: boolean;
  productUpdates: boolean;
};

export type ProfileState = {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  twoFactorEnabled: boolean;
  emailPrefs: EmailPreferences;
  hasPendingDeletion: boolean;
};

export type ProfileActions = {
  refresh: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updateImage: (image: string) => Promise<void>;
  updateEmailPrefs: (key: keyof EmailPreferences, value: boolean) => Promise<void>;
  setTwoFactorEnabled: (enabled: boolean) => void;
  setHasPendingDeletion: (pending: boolean) => void;
  clearError: () => void;
};

export function useProfileData(): ProfileState & ProfileActions {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailPrefs, setEmailPrefs] = useState<EmailPreferences>({
    marketingEmails: true,
    productUpdates: true,
  });
  const [hasPendingDeletion, setHasPendingDeletion] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile data
      const data = await apiFetch<ProfileData>("/profile");
      setProfile(data);

      // Check if 2FA is enabled
      const session = await authClient.getSession();
      setTwoFactorEnabled(session.data?.user?.twoFactorEnabled ?? false);

      // Load email preferences
      try {
        const prefs = await apiFetch<EmailPreferences>("/profile/email-preferences");
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
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateName = useCallback(async (name: string) => {
    const updated = await apiFetch<{ name: string; image: string }>("/profile", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    setProfile((prev) => (prev ? { ...prev, name: updated.name } : null));
  }, []);

  const updateImage = useCallback(async (image: string) => {
    const updated = await apiFetch<{ name: string; image: string }>("/profile", {
      method: "PATCH",
      body: JSON.stringify({ image }),
    });
    setProfile((prev) => (prev ? { ...prev, image: updated.image } : null));
  }, []);

  const updateEmailPrefs = useCallback(async (key: keyof EmailPreferences, value: boolean) => {
    const updated = await apiFetch<EmailPreferences>("/profile/email-preferences", {
      method: "PATCH",
      body: JSON.stringify({ [key]: value }),
    });
    setEmailPrefs(updated);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    profile,
    loading,
    error,
    twoFactorEnabled,
    emailPrefs,
    hasPendingDeletion,
    refresh,
    updateName,
    updateImage,
    updateEmailPrefs,
    setTwoFactorEnabled,
    setHasPendingDeletion,
    clearError,
  };
}

// Provider labels for display
export const providerLabels: Record<string, string> = {
  github: "GitHub",
  google: "Google",
  apple: "Apple",
  gitlab: "GitLab",
  atlassian: "Atlassian",
  credential: "Email & Password",
};
