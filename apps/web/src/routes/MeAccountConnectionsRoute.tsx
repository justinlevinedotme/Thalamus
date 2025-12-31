/**
 * @file MeAccountConnectionsRoute.tsx
 * @description Connections settings page within the /me hub. Shows linked OAuth
 * accounts and allows linking/unlinking providers.
 */

import { useState } from "react";
import { Github, Link2, Loader2, Plus, Trash2, User } from "lucide-react";

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
import { Button } from "../components/ui/button";
import { useProfileData, providerLabels } from "../features/account/useProfileData";
import { authClient } from "../lib/authClient";
import { apiFetch } from "../lib/apiClient";

// Environment variables to control which OAuth providers are available
const ENABLED_OAUTH_PROVIDERS: Record<string, boolean> = {
  github: import.meta.env.VITE_OAUTH_GITHUB?.toLowerCase() === "true",
  google: import.meta.env.VITE_OAUTH_GOOGLE?.toLowerCase() === "true",
  gitlab: import.meta.env.VITE_OAUTH_GITLAB?.toLowerCase() === "true",
  atlassian: import.meta.env.VITE_OAUTH_ATLASSIAN?.toLowerCase() === "true",
  apple: import.meta.env.VITE_OAUTH_APPLE?.toLowerCase() === "true",
};

// OAuth provider configurations
const OAUTH_PROVIDERS = [
  {
    id: "github",
    label: "GitHub",
    icon: <Github className="h-5 w-5" />,
  },
  {
    id: "google",
    label: "Google",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 48 48">
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
    id: "apple",
    label: "Apple",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  {
    id: "gitlab",
    label: "GitLab",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#FC6D26">
        <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.918 1.263c-.136-.423-.731-.423-.867 0L1.386 9.45.044 13.587c-.095.293.032.619.285.8l11.67 8.466 11.67-8.466c.253-.181.38-.507.286-.8" />
      </svg>
    ),
  },
  {
    id: "atlassian",
    label: "Atlassian",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0052CC">
        <path d="M7.127 11.085c-.235-.345-.727-.227-.848.174l-2.97 9.636a.74.74 0 00.707.973h4.87a.74.74 0 00.707-.514c1.317-4.057-.105-8.454-2.466-10.269zm4.873-8.97c-2.466 3.082-2.632 7.474-.52 11.3l2.455 4.448a.74.74 0 00.648.399h4.87a.74.74 0 00.707-.973L12.848 2.145c-.143-.4-.692-.4-.848-.03z" />
      </svg>
    ),
  },
] as const;

// Filter to only enabled providers
const enabledProviders = OAUTH_PROVIDERS.filter((p) => ENABLED_OAUTH_PROVIDERS[p.id]);

type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]["id"];

const providerIcons: Record<string, React.ReactNode> = {
  github: <Github className="h-5 w-5" />,
  credential: <User className="h-5 w-5" />,
};

// Add icons from OAUTH_PROVIDERS
OAUTH_PROVIDERS.forEach((p) => {
  providerIcons[p.id] = p.icon;
});

export default function MeAccountConnectionsRoute() {
  const { profile, loading, refresh } = useProfileData();
  const [linking, setLinking] = useState<string | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLinkProvider = async (provider: OAuthProvider) => {
    setLinking(provider);
    setError(null);
    try {
      // Use BetterAuth's linkSocial which initiates OAuth flow for linking
      await authClient.linkSocial({
        provider,
        callbackURL: `${window.location.origin}/me/account/connections`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link account");
      setLinking(null);
    }
  };

  const handleUnlinkProvider = async () => {
    if (!unlinkTarget) return;

    // Prevent unlinking the only auth method
    const nonCredentialAccounts = profile?.linkedAccounts.filter(
      (a) => a.provider !== "credential"
    );
    const hasPassword = profile?.linkedAccounts.some((a) => a.provider === "credential");

    if (nonCredentialAccounts?.length === 1 && !hasPassword) {
      setError(
        "Cannot unlink your only login method. Set a password first or link another account."
      );
      setUnlinkTarget(null);
      return;
    }

    setUnlinking(true);
    setError(null);
    try {
      await apiFetch("/profile/unlink-account", {
        method: "POST",
        body: JSON.stringify({ provider: unlinkTarget }),
      });
      setUnlinkTarget(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlink account");
    } finally {
      setUnlinking(false);
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

  // Get providers that aren't linked yet
  const unlinkedProviders = enabledProviders.filter(
    (p) => !profile.linkedAccounts.some((a) => a.provider === p.id)
  );

  // Check if unlinking is safe (user has at least 2 auth methods)
  const canUnlink = profile.linkedAccounts.length > 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Connections</h1>
        <p className="text-sm text-muted-foreground">
          Manage your linked accounts and login providers
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Linked Accounts Section */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium text-foreground">Linked Accounts</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          These are the accounts you can use to sign in to Thalamus.
        </p>
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
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {providerLabels[account.provider] || account.provider}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Connected {new Date(account.linkedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {account.provider !== "credential" && canUnlink && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setUnlinkTarget(account.provider)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Unlink</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Link Additional Accounts Section */}
      {unlinkedProviders.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Link Additional Accounts</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Connect more accounts to have additional ways to sign in.
          </p>
          <div className="space-y-2">
            {unlinkedProviders.map((provider) => (
              <button
                key={provider.id}
                className="flex w-full items-center justify-between rounded-md border border-border bg-background px-4 py-3 text-left transition hover:bg-secondary disabled:opacity-50"
                onClick={() => handleLinkProvider(provider.id)}
                disabled={linking === provider.id}
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{provider.icon}</span>
                  <span className="text-sm font-medium text-foreground">{provider.label}</span>
                </div>
                {linking === provider.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-xs text-primary">Link account</span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={!!unlinkTarget} onOpenChange={(open) => !open && setUnlinkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Unlink {providerLabels[unlinkTarget || ""] || unlinkTarget}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You won't be able to sign in with this account anymore. Make sure you have another way
              to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlinking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleUnlinkProvider}
              disabled={unlinking}
            >
              {unlinking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlinking...
                </>
              ) : (
                "Unlink Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
