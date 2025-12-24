-- Fix column names for better-auth compatibility
-- better-auth expects camelCase column names by default

-- ba_user table
ALTER TABLE public.ba_user RENAME COLUMN email_verified TO "emailVerified";
ALTER TABLE public.ba_user RENAME COLUMN two_factor_enabled TO "twoFactorEnabled";
ALTER TABLE public.ba_user RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.ba_user RENAME COLUMN updated_at TO "updatedAt";

-- ba_session table
ALTER TABLE public.ba_session RENAME COLUMN user_id TO "userId";
ALTER TABLE public.ba_session RENAME COLUMN expires_at TO "expiresAt";
ALTER TABLE public.ba_session RENAME COLUMN ip_address TO "ipAddress";
ALTER TABLE public.ba_session RENAME COLUMN user_agent TO "userAgent";
ALTER TABLE public.ba_session RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.ba_session RENAME COLUMN updated_at TO "updatedAt";

-- ba_account table
ALTER TABLE public.ba_account RENAME COLUMN user_id TO "userId";
ALTER TABLE public.ba_account RENAME COLUMN account_id TO "accountId";
ALTER TABLE public.ba_account RENAME COLUMN provider_id TO "providerId";
ALTER TABLE public.ba_account RENAME COLUMN access_token TO "accessToken";
ALTER TABLE public.ba_account RENAME COLUMN refresh_token TO "refreshToken";
ALTER TABLE public.ba_account RENAME COLUMN access_token_expires_at TO "accessTokenExpiresAt";
ALTER TABLE public.ba_account RENAME COLUMN refresh_token_expires_at TO "refreshTokenExpiresAt";
ALTER TABLE public.ba_account RENAME COLUMN id_token TO "idToken";
ALTER TABLE public.ba_account RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.ba_account RENAME COLUMN updated_at TO "updatedAt";

-- ba_verification table
ALTER TABLE public.ba_verification RENAME COLUMN expires_at TO "expiresAt";
ALTER TABLE public.ba_verification RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.ba_verification RENAME COLUMN updated_at TO "updatedAt";

-- ba_two_factor table
ALTER TABLE public.ba_two_factor RENAME COLUMN user_id TO "userId";
ALTER TABLE public.ba_two_factor RENAME COLUMN backup_codes TO "backupCodes";
ALTER TABLE public.ba_two_factor RENAME COLUMN created_at TO "createdAt";
ALTER TABLE public.ba_two_factor RENAME COLUMN updated_at TO "updatedAt";
