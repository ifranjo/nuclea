# Operations Runbook (Terminal)

Fecha: 22 Feb 2026

## 1) POC_REAL - arranque rapido

```bash
cd POC_REAL
npm install
npm run dev
```

Checks:

```bash
curl -I http://localhost:3002/login
node tests/healthcheck.mjs
```

## 2) Soak tests (20h o 100 retries)

Comando recomendado:

```bash
cd POC_REAL
npm run soak:20h
```

Regla de corte:
- termina si pasan 20h
- o si llega a 100 retries/fallos de infraestructura

## 3) Validacion sin Playwright

```bash
cd POC_REAL
npm run typecheck
npx tsx --test src/lib/**/*.test.ts src/lib/lifecycle/*.test.ts src/lib/trust/*.test.ts
node tests/smoke_send_claim.mjs
```

## 4) Validacion con Playwright

```bash
cd POC_REAL
npx playwright test tests/e2e/auth.spec.ts -g "registration form validates required fields" --reporter=line
npx playwright screenshot --device="Desktop Chrome" http://localhost:3002/login logs/screenshots/login-smoke.png
npx playwright screenshot --device="Desktop Chrome" http://localhost:3002/registro logs/screenshots/registro-smoke.png
```

## 5) Bloqueo actual conocido

Estado actual en esta sesion:
- App `3002`: OK
- Supabase local `54321`: caido por Docker daemon con `500 Internal Server Error`
- Consecuencia: `smoke_send_claim` falla por infraestructura, no por logica de app

Recuperacion minima:

```bash
# 1) Reiniciar Docker Desktop manualmente (UI)
# 2) Luego:
cd POC_REAL
npx supabase start
node tests/healthcheck.mjs
```

Si `docker info` sigue en 500, reiniciar Windows o arrancar Docker Desktop con permisos elevados.

## 6) Variables minimas (`POC_REAL/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_API_SECRET=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3002
BETA_GATE_ENABLED=false
TRUST_CONTACT_NOTIFY_BEFORE_HOURS=24
```
