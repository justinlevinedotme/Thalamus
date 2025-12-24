import { create } from "zustand";
import { authClient } from "../lib/authClient";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type OAuthProvider = "github" | "google" | "apple" | "gitlab" | "atlassian";

export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

type AuthState = {
  user: User | null;
  status: AuthStatus;
  error?: string;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<boolean>;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  signUp: (email: string, password: string, captchaToken?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  setError: (message?: string) => void;
  setUser: (user: User | null) => void;
};

let initialized = false;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  error: undefined,

  initialize: async () => {
    if (initialized) {
      return;
    }
    initialized = true;
    set({ status: "loading", error: undefined });

    try {
      const session = await authClient.getSession();
      if (session.data?.user) {
        set({
          user: {
            id: session.data.user.id,
            email: session.data.user.email,
            name: session.data.user.name ?? null,
            image: session.data.user.image ?? null,
          },
          status: "authenticated",
          error: undefined,
        });
      } else {
        set({ user: null, status: "unauthenticated", error: undefined });
      }
    } catch (error) {
      set({
        user: null,
        status: "unauthenticated",
        error: error instanceof Error ? error.message : "Failed to initialize",
      });
    }
  },

  signIn: async (email, password, captchaToken) => {
    set({ status: "loading", error: undefined });
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        fetchOptions: captchaToken
          ? { headers: { "x-captcha-response": captchaToken } }
          : undefined,
      });
      if (result.error) {
        set({
          status: "unauthenticated",
          error: result.error.message || "Sign in failed",
        });
        return false;
      }
      if (result.data?.user) {
        set({
          user: {
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.name ?? null,
            image: result.data.user.image ?? null,
          },
          status: "authenticated",
          error: undefined,
        });
        return true;
      }
      set({ status: "unauthenticated" });
      return false;
    } catch (error) {
      set({
        status: "unauthenticated",
        error: error instanceof Error ? error.message : "Sign in failed",
      });
      return false;
    }
  },

  signInWithProvider: async (provider) => {
    set({ status: "loading", error: undefined });
    try {
      const callbackURL = `${window.location.origin}/docs`;
      await authClient.signIn.social({
        provider,
        callbackURL,
      });
    } catch (error) {
      set({
        status: "unauthenticated",
        error: error instanceof Error ? error.message : "OAuth sign in failed",
      });
    }
  },

  signUp: async (email, password, captchaToken) => {
    set({ status: "loading", error: undefined });
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name: email.split("@")[0],
        fetchOptions: captchaToken
          ? { headers: { "x-captcha-response": captchaToken } }
          : undefined,
      });
      if (result.error) {
        set({
          status: "unauthenticated",
          error: result.error.message || "Sign up failed",
        });
        return false;
      }
      // Sign up successful - user should now sign in
      set({ status: "unauthenticated", error: undefined });
      return true;
    } catch (error) {
      set({
        status: "unauthenticated",
        error: error instanceof Error ? error.message : "Sign up failed",
      });
      return false;
    }
  },

  signOut: async () => {
    try {
      await authClient.signOut();
    } catch {
      // Ignore signout errors
    }
    set({ user: null, status: "unauthenticated", error: undefined });
  },

  setError: (message) => set({ error: message }),

  setUser: (user) =>
    set({
      user,
      status: user ? "authenticated" : "unauthenticated",
    }),
}));
