import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth, twoFactor, haveIBeenPwned, captcha } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";
import { emails } from "../emails";
import { sendEmail } from "./email";
import * as schema from "./schema";

// Helper to get frontend URL (lazy for Workers compatibility)
const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

// Generate unsubscribe token from email
function generateUnsubscribeToken(email: string): string {
  return Buffer.from(email).toString("base64url");
}

// Helper to send welcome email
const sendWelcomeEmail = async (user: { email: string; name?: string | null }) => {
  try {
    const frontendUrl = getFrontendUrl();
    const unsubscribeToken = generateUnsubscribeToken(user.email);
    const unsubscribeUrl = `${frontendUrl}/unsubscribe?token=${unsubscribeToken}&category=marketing`;

    const html = await emails.welcome({
      userName: user.name || undefined,
      loginUrl: `${frontendUrl}/login`,
      unsubscribeUrl,
    });
    await sendEmail({
      to: user.email,
      subject: "Welcome to Thalamus!",
      html,
      category: "marketing",
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
};

// Store D1 binding for the current request
let _d1: D1Database | null = null;

export function setAuthD1(d1: D1Database) {
  _d1 = d1;
  _auth = null; // Reset auth instance when D1 changes
}

// Lazily create auth instance - required for Cloudflare Workers where
// env vars are set per-request via middleware
let _auth: ReturnType<typeof betterAuth> | null = null;

function createAuth() {
  if (!_d1) {
    throw new Error("D1 database not set. Call setAuthD1() first.");
  }

  const db = drizzle(_d1, { schema });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: false,
      schema: {
        // Use the custom modelName as keys to match BetterAuth's internal lookup
        ba_user: schema.baUser,
        ba_session: schema.baSession,
        ba_account: schema.baAccount,
        ba_verification: schema.baVerification,
        ba_two_factor: schema.baTwoFactor,
      },
    }),
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: "/auth",
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"],

    // Database hooks for sending welcome emails after verification
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // For OAuth users, email is already verified, send welcome immediately
            if (user.emailVerified) {
              await sendWelcomeEmail(user);
            }
          },
        },
      },
    },

    // Email verification event hook
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const html = await emails.confirmEmail({
          userName: user.name || undefined,
          verifyUrl: url,
        });
        await sendEmail({
          to: user.email,
          subject: "Verify your email address",
          html,
          category: "transactional",
        });
      },
      onVerify: async (user: { email: string; name?: string | null }) => {
        // Send welcome email after email is verified
        await sendWelcomeEmail(user);
      },
    },

    // Custom table names with explicit field mappings for D1/SQLite
    // D1 uses camelCase column names, so we map BetterAuth's internal names to match
    user: {
      modelName: "ba_user",
      fields: {
        id: "id",
        name: "name",
        email: "email",
        emailVerified: "emailVerified",
        image: "image",
        twoFactorEnabled: "twoFactorEnabled",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: async ({ user, newEmail, url }) => {
          const html = await emails.confirmEmail({
            userName: user.name || undefined,
            verifyUrl: url,
            newEmail,
          });
          await sendEmail({
            to: newEmail,
            subject: "Verify your new email address",
            html,
            category: "transactional",
          });
        },
      },
    },
    session: {
      modelName: "ba_session",
      fields: {
        id: "id",
        expiresAt: "expiresAt",
        token: "token",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        ipAddress: "ipAddress",
        userAgent: "userAgent",
        userId: "userId",
      },
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },
    account: {
      modelName: "ba_account",
      fields: {
        id: "id",
        accountId: "accountId",
        providerId: "providerId",
        userId: "userId",
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        idToken: "idToken",
        accessTokenExpiresAt: "accessTokenExpiresAt",
        refreshTokenExpiresAt: "refreshTokenExpiresAt",
        scope: "scope",
        password: "password",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    },
    verification: {
      modelName: "ba_verification",
      fields: {
        id: "id",
        identifier: "identifier",
        value: "value",
        expiresAt: "expiresAt",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    },

    // Email/password authentication
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        const html = await emails.passwordReset({
          userName: user.name || undefined,
          resetUrl: url,
        });
        await sendEmail({
          to: user.email,
          subject: "Reset your password",
          html,
          category: "transactional",
        });
      },
    },

    // OAuth providers
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      },
      apple: {
        clientId: process.env.APPLE_CLIENT_ID || "",
        clientSecret: process.env.APPLE_CLIENT_SECRET || "",
      },
    },

    plugins: [
      // Two-factor authentication
      twoFactor({
        issuer: "Thalamus",
        schema: {
          twoFactor: {
            modelName: "ba_two_factor",
            fields: {
              id: "id",
              secret: "secret",
              backupCodes: "backupCodes",
              userId: "userId",
            },
          },
        },
      }),
      // Password breach checking via HaveIBeenPwned
      haveIBeenPwned(),
      // Cloudflare Turnstile captcha (only enabled if secret key is provided)
      ...(process.env.TURNSTILE_SECRET_KEY
        ? [
            captcha({
              provider: "cloudflare-turnstile",
              secretKey: process.env.TURNSTILE_SECRET_KEY,
            }),
          ]
        : []),
      // GitLab via generic OAuth
      genericOAuth({
        config: [
          {
            providerId: "gitlab",
            clientId: process.env.GITLAB_CLIENT_ID || "",
            clientSecret: process.env.GITLAB_CLIENT_SECRET || "",
            authorizationUrl: "https://gitlab.com/oauth/authorize",
            tokenUrl: "https://gitlab.com/oauth/token",
            userInfoUrl: "https://gitlab.com/api/v4/user",
            scopes: ["read_user", "email"],
            mapProfileToUser: (profile) => ({
              id: String(profile.id),
              email: profile.email as string,
              name: profile.name as string,
              image: profile.avatar_url as string,
            }),
          },
          // Atlassian via generic OAuth
          {
            providerId: "atlassian",
            clientId: process.env.ATLASSIAN_CLIENT_ID || "",
            clientSecret: process.env.ATLASSIAN_CLIENT_SECRET || "",
            authorizationUrl: "https://auth.atlassian.com/authorize",
            tokenUrl: "https://auth.atlassian.com/oauth/token",
            userInfoUrl: "https://api.atlassian.com/me",
            scopes: ["read:me", "read:account"],
            mapProfileToUser: (profile) => ({
              id: profile.account_id as string,
              email: profile.email as string,
              name: profile.name as string,
              image: profile.picture as string,
            }),
          },
        ],
      }),
    ],
  });
}

// Export getter that lazily creates auth instance
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_target, prop) {
    if (!_auth) {
      _auth = createAuth();
    }
    const value = (_auth as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(_auth);
    }
    return value;
  },
});

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
