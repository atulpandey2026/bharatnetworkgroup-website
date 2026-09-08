-- Add MFA/2FA support column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_user_profiles_mfa_enabled ON public.user_profiles(mfa_enabled);
