import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabaseClient";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  error?: string;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

let initialized = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  status: "idle",
  error: undefined,
  initialize: async () => {
    if (initialized) {
      return;
    }
    initialized = true;
    set({ status: "loading", error: undefined });

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      set({ status: "unauthenticated", error: error.message });
    } else {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        status: data.session ? "authenticated" : "unauthenticated",
        error: undefined,
      });
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        status: session ? "authenticated" : "unauthenticated",
      });
    });
  },
  signIn: async (email, password) => {
    set({ status: "loading", error: undefined });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      set({ status: "unauthenticated", error: error.message });
      return;
    }
    const { data } = await supabase.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user ?? null,
      status: data.session ? "authenticated" : "unauthenticated",
      error: undefined,
    });
  },
  signUp: async (email, password) => {
    set({ status: "loading", error: undefined });
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      set({ status: "unauthenticated", error: error.message });
      return;
    }
    set({ status: "unauthenticated" });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, status: "unauthenticated" });
  },
}));
