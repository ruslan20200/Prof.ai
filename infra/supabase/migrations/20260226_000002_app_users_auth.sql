create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  age integer,
  role text not null check (role in ('candidate', 'employer', 'super_admin')),
  onboarding_completed boolean not null default false,
  profile_snapshot jsonb,
  onboarding_answers jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_users_role on public.app_users(role);
create index if not exists idx_app_users_created_at on public.app_users(created_at desc);
