drop table if exists public.application_status_history cascade;
drop table if exists public.applications cascade;
drop table if exists public.job_requirements cascade;
drop table if exists public.job_skills cascade;
drop table if exists public.jobs cascade;
drop table if exists public.candidate_profiles cascade;
drop table if exists public.employer_profiles cascade;
drop table if exists public.ai_prompt_configs cascade;
drop table if exists public.ai_requests cascade;
drop table if exists public.audit_events cascade;
drop table if exists public.profiles cascade;

drop function if exists public.is_super_admin();
drop type if exists public.app_role;
