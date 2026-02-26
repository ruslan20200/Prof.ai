# Prof.ai

## Supabase (auth-only mode)

- Initialize a fresh auth-only schema with [infra/supabase/auth_only_init.sql](infra/supabase/auth_only_init.sql).
- If the old extended schema was already applied, run [infra/supabase/migrations/20260226_000003_auth_only_cleanup.sql](infra/supabase/migrations/20260226_000003_auth_only_cleanup.sql) first, then run [infra/supabase/auth_only_init.sql](infra/supabase/auth_only_init.sql).
