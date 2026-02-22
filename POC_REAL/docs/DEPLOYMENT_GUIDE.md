# POC_REAL Deployment Guide

Deploy NUCLEA POC_REAL to Vercel + Supabase Cloud.

## 1. Supabase Cloud Setup

### Create Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. **Region**: `eu-west-1` (Frankfurt) for GDPR compliance.
3. Note your **project ref** (visible in the URL: `supabase.com/dashboard/project/<ref>`).
4. Save the **anon key**, **service role key**, and **project URL** from Settings > API.

### Link Local Project

```bash
cd POC_REAL
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

### Push Migrations

Push all migrations **except** `00002_disable_rls.sql` (which disables RLS for dev):

```bash
# Push migrations to cloud
npx supabase db push
```

**Important**: Migration `00002_disable_rls.sql` disables RLS for local dev convenience. Migration `00012_enable_rls_production.sql` re-enables RLS on all 12 tables and creates production-grade policies. Since migrations run in order, `00012` overrides `00002` — the final state has RLS enabled.

If you want to be extra safe, you can rename `00002_disable_rls.sql` to `00002_disable_rls.sql.skip` before pushing, but it is not strictly necessary since `00012` fully replaces the permissive state.

### Storage Bucket

The `capsule-contents` bucket is created by migration `00001`. Migration `00012` switches it from public to private (authenticated-only with RLS policies).

Verify in Supabase Dashboard > Storage that the bucket exists and `public` is `false`.

### Auth Configuration

In Supabase Dashboard > Authentication > Providers:

1. **Email**: Enable email provider (already default).
2. **Site URL**: Set to your Vercel domain (e.g., `https://poc-real.vercel.app`).
3. **Redirect URLs**: Add your Vercel domain:
   - `https://poc-real.vercel.app/**`
   - `http://localhost:3002/**` (for local dev)
4. **Email templates**: Optional — customize OTP/magic link emails with NUCLEA branding.

## 2. Vercel Deployment

### Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. **Root Directory**: Set to `POC_REAL`.
3. **Framework Preset**: Next.js (auto-detected).

### Environment Variables

Add these in Vercel > Settings > Environment Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | From Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Service role key (secret, server-only) |
| `BETA_GATE_ENABLED` | `true` | Enable beta gate for production |
| `CRON_SECRET` | `<generate-random-string>` | Auth for cron endpoint |
| `NEXT_PUBLIC_APP_URL` | `https://poc-real.vercel.app` | Used in notification links |

Generate `CRON_SECRET` with:
```bash
openssl rand -hex 32
```

### Deploy

```bash
# Or just push to master — Vercel auto-deploys
vercel --prod
```

### Cron Job

The `vercel.json` registers one cron:

| Path | Schedule | Purpose |
|------|----------|---------|
| `/api/cron/lifecycle` | `0 3 * * *` (3am UTC daily) | Capsule expiry, trust contact notifications, video purge queue |

Vercel cron sends a POST to the route. The route validates `CRON_SECRET` via `x-cron-secret` header or `Authorization: Bearer` header. Vercel automatically passes `CRON_SECRET` if the env var is set.

## 3. Post-Deploy Checklist

- [ ] **Auth callback**: Verify Supabase auth redirect URL matches your Vercel domain
- [ ] **RLS active**: Run `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';` in SQL Editor — all tables should show `true`
- [ ] **Storage private**: Verify `capsule-contents` bucket has `public = false` in Dashboard > Storage
- [ ] **Beta gate**: Visit any protected route without beta access — should redirect to `/beta/waitlist`
- [ ] **Cron**: Trigger manually with `curl -X POST https://your-domain.vercel.app/api/cron/lifecycle -H "x-cron-secret: <your-secret>"` and verify 200 response
- [ ] **Registration flow**: Create a new account, confirm email, check user row created in `users` table
- [ ] **Beta invite flow**: POST to `/api/beta/invite` with admin key, use returned token to test full accept flow
- [ ] **Upload**: Log in, create capsule, upload an image — verify it appears in Storage bucket under `{capsule_id}/`
- [ ] **Share page**: Open a share link (`/share/<token>`) in incognito — should render read-only without auth

### Seed Data (Optional)

To seed test users on cloud (Simpson family):

```bash
# Update .env.local with cloud credentials first
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<cloud-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<cloud-service-role-key>

npx tsx scripts/seed.ts
npx tsx scripts/seed-beta.ts
```

**Note**: seed.ts creates auth users via the Admin API. Test passwords are `nuclea123` — change or remove these users before any public access.

## 4. RLS Production Notes

Migration `00012_enable_rls_production.sql` provides:

### Helper Functions (SECURITY DEFINER)

| Function | Purpose |
|----------|---------|
| `current_user_id()` | Resolves `auth.uid()` to `users.id` (internal PK) |
| `owns_capsule(cap_id)` | Check if caller owns a capsule |
| `collaborates_on_capsule(cap_id)` | Check if caller is a collaborator |
| `is_capsule_receiver(cap_id)` | Check if caller is the gift receiver |
| `can_access_capsule(cap_id)` | Combined check: owner OR collaborator OR receiver |

### Table Policies Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `users` | Own profile | Own profile | Own profile | No (admin only) |
| `capsules` | Owner/collab/receiver | Owner (auth) | Owner | Owner |
| `contents` | Capsule access | Capsule access | Capsule access | Capsule access |
| `collaborators` | Owner + self | Owner | No | Owner + self |
| `designated_persons` | Owner | Owner | Owner | Owner |
| `notification_*` | No (service only) | Auth | No | No |
| `video_purge_jobs` | No (service only) | No | No | No |
| `beta_*` | Own access row only | No (service only) | No | No |

### Storage Policies

The `capsule-contents` bucket is private. Authenticated users can read/write/delete files only in capsules they have access to (via `can_access_capsule()` on the first path segment).

## 5. Known Limitations

- **No SMTP configured**: Supabase Cloud uses its built-in email for auth OTPs. For transactional emails (trust contact notifications), you need to configure SMTP in Dashboard > Auth > SMTP or use an external service.
- **Cron on free tier**: Vercel Hobby plan supports 1 cron job (daily only). Pro plan supports up to 10 with 1-minute granularity.
- **seed.ts uploads**: The seed script uploads placeholder images but does not set `file_size_bytes` on the content rows (known tech debt).
- **Admin UI**: Beta invitations are API-only. No admin dashboard yet.
