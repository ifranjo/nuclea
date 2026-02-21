# NUCLEA POC_REAL - QA Runbook

## Prerequisites

1. **Supabase must be running** (Docker required)
   ```bash
   cd POC_REAL
   npx supabase start
   ```

2. **Database must be seeded**
   ```bash
   npx supabase db reset
   npx tsx scripts/seed.ts
   npx tsx scripts/seed-beta.ts
   ```

3. **Dev server must be running** on port 3002
   ```bash
   npm run dev
   ```

## Test Users

| User | Email | Password | Purpose |
|------|-------|----------|---------|
| Homer | homer@nuclea.test | nuclea123 | Primary test user |
| Marge | marge@nuclea.test | nuclea123 | Secondary tests |
| Bart | bart@nuclea.test | nuclea123 | Beta flow tests |

## Running Tests

### Canonical QA Suites

```bash
# CEO bug regression suite
npm run test:ceo

# Beta invitation/access suite
npm run test:beta

# Upload flow suite
npm run test:upload
```

### Upload Flow E2E Test

```bash
# Run upload flow test
npm run test:upload

# Screenshots saved to:
# screenshots/upload_qa/
```

### Install Playwright Browsers

```bash
# Only needed once or after Playwright updates
npm run test:install
```

## Screenshot Directories

| Directory | Purpose |
|-----------|---------|
| `screenshots/ceo_qa/` | CEO review screenshots |
| `screenshots/beta_qa/` | Beta invitation flow screenshots |
| `screenshots/upload_qa/` | Upload flow test evidence |

## Exit Codes

- `0` = All tests passed
- `Non-zero` = One or more tests failed

## Troubleshooting

### Port 3002 in use
```bash
netstat -ano | findstr :3002
taskkill //PID <pid> //F
```

### Supabase not running
```bash
npx supabase status
npx supabase start
```

### Playwright not installed
```bash
npx playwright install chromium
```
