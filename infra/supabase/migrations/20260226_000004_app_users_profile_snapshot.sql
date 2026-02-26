alter table if exists public.app_users
  add column if not exists profile_snapshot jsonb,
  add column if not exists onboarding_answers jsonb;
