# Bharat Network Group – Admin Login Fix

This package contains the project with the admin authentication client simplified
to use the standard Supabase SSR browser client where the existing project uses
`@supabase/ssr`.

## What was changed
- Removed problematic custom browser fetch/cookie manipulation where detected.
- Removed the `Partitioned` cookie attribute.
- Standardized the browser Supabase client to:
  - persist sessions
  - auto-refresh tokens
  - detect sessions in the URL
- Existing admin pages, website sections, content, and assets were left unchanged.
- A `_backup_before_admin_auth_fix` folder contains the original versions of files
  that were modified.

## Deployment
1. Replace the existing project files with this project.
2. Confirm these environment variables are present in the production environment:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Rebuild/redeploy the Next.js application.
4. Open `/admin/login` in an incognito/private window and sign in again.

If the deployed project still loops on login, check the browser Network tab for
the Supabase `/auth/v1/token` request and the response status.
