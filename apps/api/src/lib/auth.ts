import { betterAuth } from "better-auth";
import { genericOAuth, twoFactor, haveIBeenPwned, captcha } from "better-auth/plugins";
import pg from "pg";
import { Resend } from "resend";

const { Pool } = pg;

const resend = new Resend(process.env.RESEND_API_KEY);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"],

  // Custom table names to avoid conflicts
  user: {
    modelName: "ba_user",
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Thalamus <noreply@thalamus.app>",
          to: newEmail,
          subject: "Verify your new email address",
          html: `
            <h2>Verify Your New Email</h2>
            <p>Hi${user.name ? ` ${user.name}` : ""},</p>
            <p>You requested to change your email to this address.</p>
            <p>Click the link below to verify:</p>
            <p><a href="${url}">Verify Email</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `,
        });
      },
    },
  },
  session: {
    modelName: "ba_session",
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  account: {
    modelName: "ba_account",
  },
  verification: {
    modelName: "ba_verification",
  },

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Thalamus <noreply@thalamus.app>",
        to: user.email,
        subject: "Reset your password",
        html: `
          <h2>Reset Your Password</h2>
          <p>Hi${user.name ? ` ${user.name}` : ""},</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${url}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
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

export type Session = typeof auth.$Infer.Session;
