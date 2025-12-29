/**
 * @file authClient.ts
 * @description BetterAuth React client configuration. Creates and exports the auth client
 * instance with two-factor plugin support, providing hooks and functions for authentication
 * operations throughout the application.
 */

import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const authClient = createAuthClient({
  baseURL: API_URL,
  basePath: "/auth",
  plugins: [twoFactorClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  twoFactor,
  requestPasswordReset,
  resetPassword,
  changeEmail,
} = authClient;
