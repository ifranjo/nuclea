# PRM-PRODUCT-001: Capsule Onboarding & Creation System

**Product Requirements Document**
**NUCLEA -- Digital Legacy Platform**

| Field | Value |
|---|---|
| PRD ID | PRM-PRODUCT-001 |
| Version | 1.0 |
| Author | Technical Planning (Claude Opus 4.6) |
| Date | 2026-02-07 |
| Status | Draft -- Pending CEO/CTO Review |
| Confidentiality | NDA -- Internal Use Only |

---

## Table of Contents

1. [Problem](#1-problem)
2. [Success Metrics](#2-success-metrics)
3. [Scope](#3-scope)
4. [User Flows](#4-user-flows)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Dependencies](#7-dependencies)
8. [Risks and Mitigations](#8-risks-and-mitigations)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Delivery Phases](#10-delivery-phases)

---

## 1. Problem

### 1.1 Core Problem

People who want to preserve memories for loved ones -- whether as post-mortem legacy, couple milestones, pet memorials, or life chapter documentation -- have no accessible, emotionally engaging, Spanish-language tool. The existing market forces users into one of three dead ends:

1. **Price wall:** Eternos/Uare.ai charges $5K--$15K per setup. HereAfter AI requires ongoing subscription with English-only support. These are services for the wealthy, not for Spanish families.
2. **Clinical experience:** Empathy ($162M funded) is a B2B bereavement tool sold through insurance companies. Mi Legado Digital is a legal-tech document vault. Neither treats memory preservation as an emotional ritual.
3. **DIY fragmentation:** Users scatter memories across Google Photos, WhatsApp groups, USB drives, and paper boxes. No tool unifies these into a coherent, deliverable, emotionally resonant artifact.

### 1.2 What Specifically Needs Building

NUCLEA has two existing codebases that do not connect:

| Asset | What Exists | What's Missing |
|---|---|---|
| **POC_INTERNA** (port 3001) | 4-screen onboarding (capsule closed, opening animation, manifesto, type selection). Pure UI, no backend, no auth, white theme. React 19. | No capsule creation flow after type selection. No auth. No data persistence. Dead end at screen 4. |
| **PREREUNION_ANDREA** (port 3000) | Firebase auth (Google + Email), dashboard with capsule CRUD, dark theme. React 18. 5 capsule types (missing `legacy` and `together`). | No onboarding. No content upload UI. No closure flow. No capsule detail/editor. Dashboard create modal is a title+description form -- no emotional guidance. |

**The gap:** A user who completes the emotional onboarding has nowhere to go. A user who lands on the dashboard has no emotional context for why they're creating a capsule. The entire middle of the product -- from "I understand what NUCLEA is" to "I have a capsule with content I can close and download" -- does not exist.

### 1.3 Technical Debt to Resolve

| Issue | Impact | Resolution Required |
|---|---|---|
| Production uses `'everlife'` type, specs define `'legacy'` | Type mismatch between code and business model | Align to spec: use `legacy`. Add `together`. |
| Firebase backend (production) vs. Supabase target | Cannot build new features on deprecated backend | Migrate auth + data layer to Supabase |
| React 18 (prod) vs. React 19 (POC) | Component incompatibility | Standardize on React 19 with Next.js 15 |
| Contents stored as array inside capsule document (Firestore) | Cannot scale, cannot query, no individual file tracking | Move to relational schema (Supabase `contents` table) |
| No testing infrastructure | Cannot validate changes safely | Add Vitest + Playwright for critical paths |

---

## 2. Success Metrics

All metrics measured from beta launch (Week 12) through Week 24 (3 months post-beta).

### 2.1 Primary Metrics (Business KPIs)

| Metric | Definition | Target | Measurement Method | Baseline |
|---|---|---|---|---|
| **Onboarding-to-Creation Rate** | % of users who complete onboarding (reach P4) AND start capsule creation (enter capsule setup wizard) | >= 15% | `audit_logs` events: `onboarding.completed` -> `capsule.creation_started` | 0% (feature doesn't exist) |
| **Capsule Completion Rate** | % of capsules that reach `closed` status within 30 days of creation | >= 40% | `capsules.closed_at - capsules.created_at <= 30 days` | 0% (closure flow doesn't exist) |
| **Free-to-Paid Conversion** | % of free-tier users who upgrade to any paid plan within 90 days of registration | >= 5% | `subscriptions` table: `plan != 'free'` within 90 days of `users.created_at` | 0% (payments not implemented) |

### 2.2 Secondary Metrics (Product Health)

| Metric | Definition | Target | Measurement |
|---|---|---|---|
| **Onboarding Completion Rate** | % of users who reach P4 (capsule selection) after starting P1 | >= 70% | Funnel: `onboarding.p1_started` -> `onboarding.p4_reached` |
| **Content Density** | Average number of content items per active capsule at closure | >= 5 items | `AVG(COUNT(contents)) WHERE capsule.status = 'closed'` |
| **Time to First Content** | Median time from capsule creation to first content upload | <= 5 minutes | `contents.created_at - capsules.created_at` (first content per capsule) |
| **Capsule Abandonment Rate** | % of capsules in `draft` status for > 7 days | <= 30% | `capsules WHERE status='draft' AND created_at < NOW() - 7 days` |
| **Archive Download Rate** | % of closed capsules where user downloads the archive | >= 80% | `capsules WHERE status='downloaded' / status='closed'` |
| **Session Duration (Capsule Editor)** | Median time spent in capsule editor per session | >= 4 minutes | Client-side analytics (page visibility API) |

### 2.3 Guardrail Metrics (Do Not Regress)

| Metric | Threshold | Action if Breached |
|---|---|---|
| Page load time (LCP) | < 2.5s on 4G mobile | Audit bundle size, defer non-critical JS |
| Error rate (API 5xx) | < 1% of requests | Investigate Supabase edge function logs |
| Auth success rate | > 95% of attempts | Check OAuth config, Supabase auth logs |
| Upload success rate | > 90% of file uploads | Check storage limits, file size validation |

---

## 3. Scope

### 3.1 In Scope (Must Ship in 12 Weeks)

#### Onboarding System
- 4-screen emotional onboarding (port from POC_INTERNA to production app)
- Capsule type selection (all 6 types visible, 3 types functional)
- Capsule type detail screen with emotional copy, features, and "Create" CTA
- Auth gate: prompt registration after type selection (not before)

#### Authentication (Supabase Migration)
- Email + password registration and login
- Google OAuth
- Protected routes (dashboard, capsule editor, settings)
- User profile with plan tier, storage tracking, legal consent timestamps

#### Capsule Creation Wizard
- Step 1: Capsule naming and description (with emotional prompts per type)
- Step 2: Delivery configuration (Legacy: recipients + trigger; Life Chapter: date range; Pet: pet profile)
- Step 3: Legal consent screen
- Step 4: Capsule created confirmation with "Add first memory" CTA

#### Capsule Editor (Core Content Management)
- Photo upload (single and batch, max 20MB per file)
- Video upload (max 100MB per file, 2min for free tier)
- Audio recording (in-browser, max 5 min)
- Text note editor (rich text: bold, italic, basic formatting)
- Calendar timeline view (content organized by date)
- Content cards with thumbnails, titles, dates
- Content detail modal (view, edit metadata, delete)
- Storage usage indicator (used / limit bar)

#### Capsule Closure Flow
- Confirmation modal with consequences explained
- Client-side archive generation (JSZip)
- Download initiation
- Post-download: mark capsule as `downloaded`
- Server-side storage cleanup (Supabase Edge Function, async)

#### Dashboard
- List of user's capsules with status indicators
- Create new capsule entry point
- Storage summary across all capsules
- Plan tier display

#### Capsule Types Functional at Launch

| Type | Fully Functional | Visible but "Coming Soon" |
|---|---|---|
| Legacy | Yes | -- |
| Life Chapter | Yes | -- |
| Pet | Yes | -- |
| Together | -- | Yes |
| Social | -- | Yes |
| Origin | -- | Yes |

#### Subscription Tier Logic (No Payment Gateway)
- Plan limits enforced: capsule count, storage, video duration
- Upgrade prompts when limits approached
- Plan displayed in dashboard and settings
- **Manual plan assignment** by admin (no Stripe in MVP)

### 3.2 Out of Scope (Explicitly Excluded)

| Feature | Reason | Phase |
|---|---|---|
| Stripe/payment integration | Pre-seed; manual assignment sufficient for beta | Phase 2 |
| Future messages (Legacy) | Complex crypto + cron infrastructure; not needed for demo | Phase 2 |
| Inactivity detection trigger | Requires long-running monitoring; post-funding | Phase 2 |
| AI Avatar / EverLife | Major feature with voice cloning, video; Phase 3 | Phase 3 |
| Together capsule (full) | Requires collaboration infra, real-time sync | Phase 2 |
| Social capsule (full) | Requires invitation system, moderation | Phase 2 |
| Origin capsule (full) | Requires multi-year timeline, milestone system | Phase 2 |
| Apple Sign-In | Requires Apple Developer enrollment ($99/yr) | Phase 2 |
| Push notifications | Requires service worker + notification service | Phase 2 |
| Offline mode | Service worker complexity; not needed for beta | Phase 3 |
| Multi-language support | Spain Spanish only at launch | Phase 2 |
| Native mobile apps | React Native; post-validation | Phase 3 |
| Real-time collaboration | Supabase Realtime; not needed for single-user capsules in MVP | Phase 2 |
| 3D capsule animation | Performance concern on mobile; simplified 2D animation sufficient | Phase 2 |
| Content moderation / AI scanning | Not needed at beta scale | Phase 2 |
| Account deletion (GDPR right to erasure) | Must implement, but as admin-triggered process initially | Phase 2 (automated) |

### 3.3 Scope Boundaries -- Decision Log

| Decision | Rationale |
|---|---|
| 3 functional capsule types, not 6 | 2-person team, 12 weeks. Legacy (flagship), Life Chapter (common use case), Pet (quick emotional win) cover the demo scenarios. Other 3 types are shown as "coming soon" to validate demand. |
| Client-side ZIP, not server-side Edge Function | JSZip is proven, zero server cost, works offline. Server-side archive is Phase 2 optimization for large capsules (>1GB). |
| White theme (POC_INTERNA style), not dark theme (PREREUNION_ANDREA) | Andrea's PDFs use white theme. The dark theme was a developer choice without design validation. White theme aligns with "intimacy, calm, permanence" design philosophy. Decision should be confirmed with CEO. |
| Manual plan assignment, not Stripe | Pre-seed beta has <100 users. CTO can assign plans via Supabase dashboard. Saves 2+ weeks of Stripe integration. |

---

## 4. User Flows

### 4.1 Flow 1: First-Time User -- Onboarding to First Capsule

**Persona:** Maria, 52, "Guardian of Legacy." Lost her father 6 months ago. Wants to create something for her children.

```
ENTRY: Maria types nuclea.es in mobile browser
    |
    v
[P1: Capsule Closed]
    - White screen, metallic capsule centered, "NUCLEA" engraved
    - No UI chrome (no nav, no buttons)
    - Single affordance: tap the capsule
    |
    | Maria taps capsule
    v
[P2: Capsule Opening Animation]
    - Capsule splits horizontally
    - Polaroids emerge, float with subtle rotation
    - Speech bubbles appear with memory snippets
    - Duration: ~4 seconds, auto-advances
    |
    | Auto-advance
    v
[P3: Manifesto]
    - Small closed capsule at top
    - "Somos las historias que recordamos."
    - "Haz que las tuyas permanezcan."
    - "NUCLEA transforma recuerdos en legado."
    - CTA: "Continuar" button
    |
    | Maria taps "Continuar"
    v
[P4: Capsule Selection]
    - Header with "NUCLEA" centered
    - "Elige tu capsula"
    - 6 capsule type cards (3 active, 3 "Proximamente")
    - Each card: icon + name + one-line description + chevron
    |
    | Maria taps "Legacy Capsule"
    v
[P5: Capsule Type Detail -- Legacy]
    - Back arrow
    - Title: "Legacy Capsule"
    - Tagline: "Para que tu historia siga presente."
    - Description paragraph (from CAPSULE_TYPES.md copy)
    - Feature list: future messages, recipients, delivery trigger
    - [Crear esta capsula] button
    - Footnote: "Tu contenido es privado y solo tuyo."
    |
    | Maria taps "Crear esta capsula"
    v
[AUTH GATE: Not authenticated]
    |
    v
[P6: Registration]
    - Logo NUCLEA
    - "Crea tu cuenta"
    - Email field
    - Password field (with strength indicator)
    - [Crear cuenta] button
    - Divider: "--- o ---"
    - [Continuar con Google] button
    - "Ya tienes cuenta? Inicia sesion" link
    |
    | Maria registers with email
    v
[P7: Legal Consent]
    - "Tu historia es tuya. Y solo tuya."
    - Privacy commitment text
    - Checkbox: "He leido y acepto los terminos"
    - Checkbox: "Acepto la politica de privacidad"
    - [Continuar] button (disabled until both checked)
    |
    | Maria accepts
    v
[P8: Capsule Setup Wizard -- Step 1/3]
    - "Dale nombre a tu capsula"
    - Title field (placeholder: "Ej: Para mis hijos")
    - Description field (placeholder: "Que quieres que recuerden de ti?")
    - Progress indicator: 1 of 3
    - [Siguiente] button
    |
    | Maria names: "Para Lucia y Pablo"
    v
[P9: Capsule Setup Wizard -- Step 2/3 (Legacy-specific)]
    - "A quien quieres que llegue?"
    - Recipient 1: Name + Email fields
    - [+ Anadir otra persona]
    - Delivery trigger selector:
      - "Yo decidire cuando" (manual) [default]
      - "En una fecha concreta" (date picker)
      - "Si dejo de entrar durante X dias" (grayed out: "Disponible proximamente")
    - Progress indicator: 2 of 3
    - [Siguiente] button
    |
    | Maria adds: "Lucia - lucia@email.com"
    v
[P10: Capsule Setup Wizard -- Step 3/3]
    - "Tu capsula esta casi lista"
    - Summary card: type, name, recipients, delivery method
    - [Crear capsula] button
    - [Volver atras] link
    |
    | Maria taps "Crear capsula"
    v
[P11: Capsule Created -- First Memory CTA]
    - Celebratory micro-animation (capsule pulse + checkmark)
    - "Tu capsula 'Para Lucia y Pablo' esta lista."
    - "Ahora, anade tu primer recuerdo."
    - 4 action buttons in grid:
      - [Subir foto] (camera icon)
      - [Subir video] (film icon)
      - [Grabar audio] (mic icon)
      - [Escribir nota] (pen icon)
    - "O hazlo mas tarde" link -> Dashboard
    |
    | Maria taps "Subir foto"
    v
[CAPSULE EDITOR: Photo upload flow]
    - Native file picker (accept: image/*)
    - Preview with option to add title and date
    - [Guardar] button
    - Returns to capsule editor with photo visible in timeline
    |
    v
[CAPSULE EDITOR: Main view]
    - Header: capsule name + status badge ("Activa")
    - Calendar timeline (current month, dots on days with content)
    - Content cards below (most recent first)
    - Bottom action bar: [Foto] [Video] [Audio] [Nota]
    - Menu (...): Edit capsule, Manage recipients, Close capsule, Delete capsule
    - Storage indicator: "23 MB / 500 MB"
```

### 4.2 Flow 2: Returning User -- Add Content

**Persona:** Maria returns 3 days later to add more memories.

```
ENTRY: Maria opens nuclea.es
    |
    v
[AUTH CHECK: Session valid]
    |
    v
[DASHBOARD]
    - Header: "Mis capsulas" + capsule count + plan
    - Capsule card: "Para Lucia y Pablo" - Legacy - 3 items - Active
    |
    | Maria taps capsule card
    v
[CAPSULE EDITOR]
    - Calendar shows dots on days with content
    - 3 existing content cards visible
    - Maria taps [Video] in bottom bar
    |
    v
[VIDEO UPLOAD]
    - File picker (accept: video/*, max 100MB)
    - Upload progress bar
    - Processing indicator ("Procesando video...")
    - Thumbnail generated
    - Title field + date field (auto-populated from file metadata)
    - [Guardar]
    |
    v
[CAPSULE EDITOR]
    - Video card now visible in timeline
    - Storage indicator updated
```

### 4.3 Flow 3: Capsule Closure

**Persona:** Maria has added 12 items over 2 weeks. She wants to close the capsule.

```
[CAPSULE EDITOR] -> Menu (...) -> "Cerrar capsula"
    |
    v
[CLOSURE CONFIRMATION]
    - "Estas segura de que quieres cerrar esta capsula?"
    - Warning list:
      - "No podras anadir mas recuerdos"
      - "Se generara un archivo descargable"
      - "El contenido se eliminara del servidor tras la descarga"
    - Capsule summary: 12 items, 156 MB
    - [Cancelar] [Cerrar capsula]
    |
    | Maria taps "Cerrar capsula"
    v
[PROCESSING]
    - "Empaquetando tus recuerdos..."
    - Progress bar (client-side ZIP generation)
    - "Generando archivo NUCLEA..."
    |
    v
[DOWNLOAD READY]
    - "Tu capsula esta lista"
    - File size: "156 MB"
    - [Descargar ahora] button
    - "Tienes 30 dias para descargar"
    - "Despues de la descarga, el contenido se eliminara de nuestros servidores."
    |
    | Maria taps "Descargar"
    v
[DOWNLOAD COMPLETE]
    - "Capsula descargada con exito"
    - "Tu archivo esta en tu dispositivo"
    - [Ir al inicio] button
    |
    v
[DASHBOARD]
    - Capsule card now shows: "Para Lucia y Pablo" - Cerrada - Descargada
    - Greyed out, with "downloaded" badge
```

### 4.4 Flow 4: Life Chapter Capsule (Variant)

```
[P4: Capsule Selection] -> Tap "Life Chapter Capsule"
    |
    v
[P5: Type Detail -- Life Chapter]
    - "Para guardar etapas de tu vida."
    - Feature list: chapters, timeline, configurable delivery
    - Examples: Erasmus, pregnancy, sabbatical
    - [Crear esta capsula]
    |
    v
[AUTH GATE] (if not authenticated)
    |
    v
[CAPSULE SETUP -- Step 2/3 (Life Chapter-specific)]
    - "Define tu capitulo"
    - Chapter name (placeholder: "Ej: Mi Erasmus en Lisboa")
    - Start date (date picker, default: today)
    - End date (date picker, optional)
    - [Siguiente]
    |
    v
[... rest of creation flow identical ...]
```

### 4.5 Flow 5: Pet Capsule (Variant)

```
[P4: Capsule Selection] -> Tap "Pet Capsule"
    |
    v
[P5: Type Detail -- Pet]
    - "Momentos que compartimos con nuestras mascotas."
    - Feature list: pet profile, gallery, memorial option
    - [Crear esta capsula]
    |
    v
[AUTH GATE] (if not authenticated)
    |
    v
[CAPSULE SETUP -- Step 2/3 (Pet-specific)]
    - "Cuentanos sobre tu mascota"
    - Pet name field
    - Species selector (Perro, Gato, Otro)
    - Breed field (optional)
    - Birth date (optional)
    - Farewell date (optional, labeled sensitively: "Fecha de despedida")
    - Photo upload (pet profile photo)
    - [Siguiente]
    |
    v
[... rest of creation flow identical ...]
```

### 4.6 Flow 6: "Coming Soon" Capsule Types

```
[P4: Capsule Selection] -> Tap "Together Capsule" (badge: "Proximamente")
    |
    v
[COMING SOON MODAL]
    - Capsule type icon and name
    - "Estamos trabajando en esta capsula."
    - "Dejanos tu email y te avisaremos cuando este lista."
    - Email field (pre-filled if authenticated)
    - [Avisame] button
    - [Volver] link
    |
    | Saves to waitlist with capsule_type tag
    v
[P4: Capsule Selection] (returns to selection)
```

---

## 5. Functional Requirements

### 5.1 Onboarding

| ID | Requirement | Acceptance Test |
|---|---|---|
| FR-ONB-001 | System shall display P1 (closed capsule on white background) as the entry point for unauthenticated users visiting `/` for the first time. | Navigate to `/` while logged out with no `onboarding_completed` cookie. P1 screen renders. No navigation chrome visible. |
| FR-ONB-002 | Tapping the capsule on P1 shall transition to P2 (opening animation) with a 300ms fade transition. | Tap capsule. P2 renders within 350ms. P1 is no longer visible. |
| FR-ONB-003 | P2 animation shall auto-advance to P3 after 4 seconds (+/- 500ms). | Start timer at P2 render. P3 appears between 3.5s and 4.5s. |
| FR-ONB-004 | P3 shall display the manifesto text: "Somos las historias que recordamos." and "Haz que las tuyas permanezcan." exactly as specified. | Visual comparison against spec. Text matches character-for-character including accents. |
| FR-ONB-005 | P3 "Continuar" button shall transition to P4 (capsule selection). | Tap "Continuar". P4 renders with 6 capsule type cards. |
| FR-ONB-006 | P4 shall display all 6 capsule types as cards. Legacy, Life Chapter, and Pet cards shall be tappable. Together, Social, and Origin cards shall display a "Proximamente" badge and trigger the coming-soon modal on tap. | Count cards: 6. Tap Legacy: navigates to detail. Tap Together: modal appears. |
| FR-ONB-007 | System shall set a persistent cookie `onboarding_completed=true` when user reaches P4. Subsequent visits to `/` shall redirect to `/dashboard` (if authenticated) or to `/login` (if not). | Complete onboarding. Close browser. Reopen `/`. Redirected appropriately. |
| FR-ONB-008 | Each capsule type card on P4 shall display: icon, name, one-line description, and a right chevron. | Verify all 6 cards render with correct icons per CAPSULE_TYPES.md. |

### 5.2 Authentication

| ID | Requirement | Acceptance Test |
|---|---|---|
| FR-AUTH-001 | System shall support email + password registration with: email validation (RFC 5322), password minimum 8 characters with at least 1 number. | Register with `test@x` -> error. Register with `abc` password -> error. Register with valid email + `Pass1234` -> success. |
| FR-AUTH-002 | System shall support Google OAuth via Supabase Auth. | Click "Continuar con Google". Google consent screen appears. After consent, user is authenticated and redirected. |
| FR-AUTH-003 | Registration shall create a user record in `users` table with: email, full_name, plan='free', terms_accepted_at=NOW(), privacy_accepted_at=NOW(). | Query `users` table after registration. All fields populated. |
| FR-AUTH-004 | Auth gate shall trigger ONLY when user attempts to create a capsule (taps "Crear esta capsula" on type detail screen), NOT during onboarding browsing. | Browse P1-P4, tap Legacy card, view detail screen -- all without auth prompt. Tap "Crear esta capsula" -> registration screen if not authenticated. |
| FR-AUTH-005 | After authentication, system shall redirect user to the capsule setup wizard for the type they selected, NOT to the dashboard. | Select Legacy -> auth gate -> register -> lands on Legacy setup wizard Step 1. |
| FR-AUTH-006 | Session shall persist for 7 days via Supabase JWT refresh tokens. | Authenticate. Wait 24 hours (or simulate). Return to app. Still authenticated. |
| FR-AUTH-007 | Protected routes (`/dashboard`, `/capsulas/*`, `/settings`) shall redirect to `/login` if user is not authenticated. | Navigate to `/dashboard` while logged out. Redirected to `/login`. |

### 5.3 Capsule Creation

| ID | Requirement | Acceptance Test |
|---|---|---|
| FR-CAP-001 | Capsule creation wizard shall have 3 steps: (1) Name + Description, (2) Type-specific configuration, (3) Summary + Confirm. | Start creation. Navigate through 3 steps. All render correctly. |
| FR-CAP-002 | Step 1 shall require a title (min 1 character, max 100 characters). Description is optional (max 500 characters). | Submit with empty title -> validation error. Submit with 101-char title -> validation error. Submit with 1-char title + no description -> proceeds. |
| FR-CAP-003 | Step 2 for Legacy shall include: recipient fields (name + email, at least 1 required), delivery trigger selector (manual, date, inactivity-disabled). | Attempt to proceed without recipient -> validation error. Add recipient with invalid email -> error. Add valid recipient + select "manual" -> proceeds. |
| FR-CAP-004 | Step 2 for Life Chapter shall include: chapter name (required), start date (default: today), end date (optional). | Submit without chapter name -> error. Submit with chapter name + dates -> proceeds. |
| FR-CAP-005 | Step 2 for Pet shall include: pet name (required), species (required, select), breed (optional), birth date (optional), farewell date (optional), profile photo (optional). | Submit without pet name -> error. Submit with name + species -> proceeds. |
| FR-CAP-006 | Step 3 shall display a read-only summary of all entered data and a "Crear capsula" button. | All data from steps 1-2 visible. No editable fields. Button present. |
| FR-CAP-007 | "Crear capsula" shall insert a row into `capsules` table with status `active`, the correct `capsule_type`, and owner_id = authenticated user. | Query `capsules` after creation. Row exists with correct type, status='active', owner_id matches auth user. |
| FR-CAP-008 | For Legacy capsules, "Crear capsula" shall also insert row(s) into `designated_persons` table. | Query `designated_persons` after Legacy creation. Rows match entered recipients. |
| FR-CAP-009 | System shall enforce plan limits on capsule count. If user has reached their capsule limit, the "Crear esta capsula" button shall be disabled with message: "Has alcanzado el limite de capsulas de tu plan." | Free user with 1 existing capsule -> tries to create second -> button disabled + message. |
| FR-CAP-010 | After successful creation, system shall display a confirmation screen with 4 content action buttons (photo, video, audio, note) and a "Hazlo mas tarde" link to dashboard. | Capsule created -> confirmation screen renders with 4 buttons + link. |

### 5.4 Capsule Editor

| ID | Requirement | Acceptance Test |
|---|---|---|
| FR-EDT-001 | Capsule editor shall display: capsule title, status badge, calendar timeline, content cards, bottom action bar, and overflow menu (...). | Open an active capsule. All elements visible. |
| FR-EDT-002 | Calendar timeline shall display the current month with dots on days that have content. Tapping a day shall scroll to that day's content cards. | Add content with date Jan 15. Calendar shows dot on Jan 15. Tap Jan 15 -> cards scroll to Jan 15 content. |
| FR-EDT-003 | Photo upload shall: accept image/* files, enforce max 20MB per file, generate a thumbnail (client-side, 200x200), store original in Supabase Storage under `capsule-contents/{user_id}/{capsule_id}/photos/`, create a `contents` row with type='photo'. | Upload 21MB image -> error "Tamano maximo: 20 MB". Upload 5MB JPEG -> thumbnail generated, file in storage, row in `contents`. |
| FR-EDT-004 | Batch photo upload shall allow selecting up to 10 photos simultaneously. | Select 11 photos -> error. Select 8 photos -> all uploaded with individual progress indicators. |
| FR-EDT-005 | Video upload shall: accept video/* files, enforce max 100MB per file (any plan), enforce duration limit (2min free, 30min esencial, unlimited familiar+), create thumbnail from first frame (client-side). | Free user uploads 3min video -> error "Duracion maxima: 2 minutos en tu plan". Upload 90s video -> success. |
| FR-EDT-006 | Audio recording shall: use MediaRecorder API, display waveform visualization during recording, allow pause/resume, enforce max 5 minutes, save as m4a/webm. | Start recording -> waveform visible. Pause -> waveform stops. At 5:00 -> auto-stops. Save -> file in storage + `contents` row. |
| FR-EDT-007 | Text note editor shall support: plain text input, basic formatting (bold, italic via markdown), auto-saved date stamp, max 10,000 characters. | Type note with **bold** -> renders bold in preview. Type 10,001 chars -> truncated/blocked. Save -> `contents` row with type='text', text_content populated. |
| FR-EDT-008 | Content cards shall display: thumbnail (or icon for audio/text), title (or first line of text), date, and content type badge. | Create one of each type. All 4 render correctly with appropriate visual treatment. |
| FR-EDT-009 | Tapping a content card shall open a detail modal with: full-size preview, title, description, date, and actions (Edit, Delete). | Tap photo card -> modal with full image. Tap Delete -> confirmation -> content removed. |
| FR-EDT-010 | Storage indicator shall display: "{used} / {limit}" with a progress bar. Bar turns yellow at 80% usage, red at 95%. | Upload content to reach 82% -> bar yellow. Upload to 96% -> bar red. |
| FR-EDT-011 | When storage limit is reached, upload buttons shall be disabled with message: "Sin espacio. Elimina contenido o mejora tu plan." | Reach 100% storage -> all upload buttons disabled + message visible. |
| FR-EDT-012 | Deleting a content item shall: show confirmation dialog, remove file from Supabase Storage, soft-delete `contents` row, recalculate `capsules.storage_used_bytes`. | Delete a 5MB photo. Storage indicator decreases by ~5MB. File no longer accessible in storage. |

### 5.5 Capsule Closure

| ID | Requirement | Acceptance Test |
|---|---|---|
| FR-CLS-001 | Closure option shall be accessible from capsule editor overflow menu (...) -> "Cerrar capsula". | Open active capsule -> menu -> "Cerrar capsula" option visible. |
| FR-CLS-002 | Closure confirmation shall list consequences: cannot add more content, archive will be generated, server content will be deleted after download. | Confirmation modal displays all 3 consequences as bullet points. |
| FR-CLS-003 | Upon confirmation, system shall generate a ZIP archive client-side (JSZip) containing all capsule content files organized by type (photos/, videos/, audio/, notes/). | Capsule with 5 photos + 2 notes -> ZIP contains photos/ (5 files) + notes/ (2 .txt files). |
| FR-CLS-004 | ZIP archive shall include a `manifest.json` with capsule metadata: title, type, creation date, closure date, content inventory. | Unzip archive. `manifest.json` present with correct metadata. |
| FR-CLS-005 | After ZIP generation, system shall prompt download. Upon confirmed download (browser download event), update `capsules.status` to `downloaded` and `capsules.downloaded_at` to NOW(). | Download completes -> query capsules -> status='downloaded', downloaded_at is set. |
| FR-CLS-006 | After download confirmation, system shall trigger an async Supabase Edge Function to delete all files from `capsule-contents/{user_id}/{capsule_id}/` within 24 hours. | 24 hours after download -> storage bucket path is empty. `contents` rows have `deleted_at` set. |
| FR-CLS-007 | Closed capsules shall appear in dashboard with a "Cerrada" badge and be read-only (no edit actions available). | Navigate to dashboard -> closed capsule card shows "Cerrada" badge. Tap card -> read-only view, no action bar. |

### 5.6 Dashboard

| ID | Requirement | Acceptance Test |
|---|---|---|
| FR-DSH-001 | Dashboard shall display: page title "Mis capsulas", capsule count "{n} de {limit}", plan name, and "Nueva capsula" button. | Authenticated user with 1 capsule on free plan -> "1 de 1 capsulas . Plan Gratuito" |
| FR-DSH-002 | Each capsule card shall display: title, type icon, content count, last updated date, and status badge (Activa/Cerrada/Descargada). | Create 2 capsules of different types. Both cards render with correct icons and metadata. |
| FR-DSH-003 | "Nueva capsula" button shall navigate to P4 (capsule selection), bypassing P1-P3 onboarding. | Tap "Nueva capsula" -> P4 renders directly. |
| FR-DSH-004 | Empty state (0 capsules) shall display: illustration, "Aun no tienes capsulas", description text, and "Crear mi primera capsula" button. | New user navigates to dashboard -> empty state renders. |
| FR-DSH-005 | Dashboard shall be the default authenticated landing page. `/` shall redirect to `/dashboard` for authenticated users who have completed onboarding. | Authenticated user visits `/` -> redirected to `/dashboard`. |

### 5.7 Coming Soon / Waitlist

| ID | Requirement | Acceptance Test |
|---|---|---|
| FR-WL-001 | Tapping a "Proximamente" capsule type shall show a modal with: type name, "Estamos trabajando en esta capsula", email input, and "Avisame" button. | Tap "Together" card -> modal renders with all elements. |
| FR-WL-002 | "Avisame" shall save to a `waitlist` table with: email, capsule_type tag, timestamp. | Submit email -> query waitlist -> row exists with capsule_type='together'. |
| FR-WL-003 | If user is authenticated, email field shall be pre-filled with their registered email. | Authenticated user taps "Origin" -> email pre-filled. |

### 5.8 Analytics Events

| ID | Requirement | Acceptance Test |
|---|---|---|
| FR-ANL-001 | System shall log the following events to `audit_logs`: `onboarding.p1_started`, `onboarding.p2_opened`, `onboarding.p3_viewed`, `onboarding.p4_reached`, `capsule_type.detail_viewed`, `capsule.creation_started`, `capsule.created`, `content.uploaded`, `capsule.closure_initiated`, `capsule.closed`, `capsule.downloaded`. | Complete full flow from P1 to download. Query `audit_logs` -> all events present in correct order. |
| FR-ANL-002 | Each audit event shall include: user_id (if authenticated), action, resource_type, resource_id, timestamp, and device context (user_agent). | Query any audit event -> all fields populated. user_id is null for pre-auth onboarding events. |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Measurement |
|---|---|---|
| NFR-PERF-001 | Largest Contentful Paint (LCP) shall be < 2.5s on 4G mobile (Moto G Power equivalent). | Lighthouse mobile audit on `/`, `/dashboard`, `/capsulas/[id]`. |
| NFR-PERF-002 | First Input Delay (FID) shall be < 100ms. | Lighthouse mobile audit. |
| NFR-PERF-003 | Cumulative Layout Shift (CLS) shall be < 0.1. | Lighthouse mobile audit. |
| NFR-PERF-004 | Initial JS bundle shall be < 200KB gzipped (excluding lazy-loaded routes). | `next build` output analysis. |
| NFR-PERF-005 | File upload shall show progress indicator within 500ms of user selecting files. | Manual test on 4G. |
| NFR-PERF-006 | ZIP archive generation for a capsule with 50 items / 500MB shall complete within 60 seconds on a mid-range mobile device. | Test with 50-item capsule on Moto G Power or equivalent. |

### 6.2 Security

| ID | Requirement | Measurement |
|---|---|---|
| NFR-SEC-001 | All API routes shall validate JWT tokens via Supabase Auth. Unauthorized requests shall return 401. | Send request without token -> 401. Send request with expired token -> 401. |
| NFR-SEC-002 | Row Level Security (RLS) shall be enabled on ALL tables. Users shall only access their own data. | Attempt to query another user's capsule via Supabase client -> empty result. |
| NFR-SEC-003 | File uploads shall validate MIME type server-side (not just client extension). Accepted: image/jpeg, image/png, image/webp, image/heic, video/mp4, video/quicktime, video/webm, audio/mp4, audio/webm, audio/mpeg. | Upload a .txt file renamed to .jpg -> rejected. |
| NFR-SEC-004 | Supabase Storage paths shall include user_id to prevent path traversal. | Attempt to access `/capsule-contents/other-user-id/other-capsule-id/` -> 403. |
| NFR-SEC-005 | CSRF protection shall be enabled via SameSite cookie policy and Supabase's built-in CSRF tokens. | Attempt cross-origin POST -> rejected. |
| NFR-SEC-006 | Passwords shall be hashed by Supabase Auth (bcrypt). Never stored in plaintext. | Inspect `auth.users` table -> password column is hashed. |

### 6.3 GDPR / EU Compliance

| ID | Requirement | Measurement |
|---|---|---|
| NFR-GDPR-001 | Registration shall require explicit consent (checkbox, not pre-checked) for terms of service AND privacy policy as separate checkboxes. | Inspect registration form -> 2 unchecked checkboxes. Attempt submit without checking -> blocked. |
| NFR-GDPR-002 | `users.terms_accepted_at` and `users.privacy_accepted_at` shall record the exact timestamp of consent. | Query user record after registration -> both timestamps populated. |
| NFR-GDPR-003 | User shall be able to export all their data (capsules, contents, profile) from settings page. | Go to Settings -> "Exportar mis datos" -> ZIP downloaded with all user data. |
| NFR-GDPR-004 | User shall be able to request account deletion from settings page. Deletion shall be processed within 30 days. | Go to Settings -> "Eliminar mi cuenta" -> confirmation -> account marked for deletion. |
| NFR-GDPR-005 | Cookie consent banner shall appear on first visit, before any non-essential cookies are set. Only essential cookies (auth session) are used without consent. | First visit -> banner appears. Decline -> no analytics cookies set. |

### 6.4 Accessibility

| ID | Requirement | Measurement |
|---|---|---|
| NFR-A11Y-001 | All interactive elements shall have minimum touch target of 44x44px. | Inspect all buttons, links, cards -> minimum dimension >= 44px. |
| NFR-A11Y-002 | Text contrast shall meet WCAG AA (4.5:1 for normal text, 3:1 for large text). | Run axe audit on all pages. |
| NFR-A11Y-003 | All images shall have alt text. Decorative images shall use `alt=""`. | Run axe audit. No missing alt attributes. |
| NFR-A11Y-004 | Forms shall have associated labels. Error messages shall be linked to fields via `aria-describedby`. | Run axe audit on registration, capsule creation forms. |
| NFR-A11Y-005 | Keyboard navigation shall work for all flows (tab order, enter/space activation, escape to close modals). | Navigate full flow using only keyboard. All actions completable. |

### 6.5 Internationalization (Preparation)

| ID | Requirement | Measurement |
|---|---|---|
| NFR-I18N-001 | All user-facing strings shall be externalized into a single translations file (`/src/i18n/es.ts`), NOT hardcoded in components. | Grep for Spanish strings in component files -> none found. All come from i18n file. |
| NFR-I18N-002 | Date formatting shall use `Intl.DateTimeFormat` with `es-ES` locale. | Verify dates display as "7 feb 2026" not "Feb 7, 2026" or "2/7/2026". |
| NFR-I18N-003 | Number formatting shall use `Intl.NumberFormat` with `es-ES` locale (comma for decimal, dot for thousands). | Verify "1.500 MB" not "1,500 MB" in storage displays. |

### 6.6 Reliability

| ID | Requirement | Measurement |
|---|---|---|
| NFR-REL-001 | Failed file uploads shall be retried up to 3 times with exponential backoff (1s, 2s, 4s). User shall see retry indicator, not silent failure. | Simulate network failure during upload -> retry visible -> after 3 failures, error message shown. |
| NFR-REL-002 | Capsule creation (database write) shall be atomic. If any step fails (capsule row, recipient rows, audit log), all shall be rolled back. | Simulate DB failure after capsule insert but before recipient insert -> no orphaned capsule row. |
| NFR-REL-003 | Application shall handle Supabase downtime gracefully: show "Servicio temporalmente no disponible" message, not a white screen or unhandled error. | Disconnect Supabase -> attempt any action -> error message, not crash. |

---

## 7. Dependencies

### 7.1 External Service Dependencies

| Dependency | Purpose | Risk Level | Fallback |
|---|---|---|---|
| **Supabase** (Auth, DB, Storage, Edge Functions) | Entire backend | **Critical** | None. If Supabase is down, app is non-functional. Supabase SLA: 99.9% uptime on Pro plan. |
| **Vercel** (Hosting, CDN, Edge SSR) | Frontend deployment | **High** | Can deploy to Cloudflare Pages or Netlify within 1 day. |
| **Google OAuth** (via Supabase) | Social auth | **Medium** | Email/password auth still works. |
| **Google Fonts** (Inter, Cormorant Garamond) | Typography | **Low** | System font fallbacks defined in CSS. |

### 7.2 Library Dependencies (New)

| Library | Version | Purpose | Size Impact |
|---|---|---|---|
| `@supabase/supabase-js` | ^2.x | Supabase client (auth, DB, storage) | ~45KB gzipped |
| `@supabase/ssr` | ^0.x | Server-side auth helpers for Next.js | ~5KB gzipped |
| `jszip` | ^3.10 | Client-side ZIP generation for capsule closure | ~45KB gzipped |
| `file-saver` | ^2.0 | Cross-browser file download trigger | ~3KB gzipped |
| `vitest` | ^3.x | Unit/integration testing (dev dependency) | 0 (dev only) |
| `@playwright/test` | ^1.50 | E2E testing (dev dependency) | 0 (dev only) |
| `zod` | ^3.24 | Schema validation (already in project) | 0 (already bundled) |

### 7.3 Library Dependencies (Remove)

| Library | Reason |
|---|---|
| `firebase` | Replaced by Supabase |
| `firebase-admin` | Replaced by Supabase Edge Functions |

### 7.4 Infrastructure Dependencies

| Dependency | Status | Action Required | Owner |
|---|---|---|---|
| Supabase project | Not created | Create project, configure auth providers, run schema migration | CTO |
| Supabase Storage buckets | Not created | Create `capsule-contents`, `avatars` buckets with RLS | CTO |
| Google OAuth credentials (Supabase) | Exists (Firebase) | Re-register OAuth redirect URI for Supabase domain | CTO |
| Vercel project | Exists | Update environment variables from Firebase to Supabase | CTO |
| Domain (nuclea.es) | Unknown | Verify DNS + SSL configuration | CEO |
| Design assets (capsule illustrations) | Partial (POC has placeholders) | Finalize capsule type illustrations for P5 detail screens | CEO |

### 7.5 Team Dependencies

| Dependency | Description | Blocker For |
|---|---|---|
| CEO approval: white vs. dark theme | POC uses white, production uses dark. Must decide. | Phase 1 (Week 1) |
| CEO: finalize capsule type copy | CAPSULE_TYPES.md has draft copy. Needs final review. | Phase 1 capsule detail screens |
| CEO: legal text for consent screens | Terms of service and privacy policy content | Phase 1 registration flow |
| CTO: Supabase project setup | DB, auth, storage, RLS policies | Phase 1 (Week 1-2) |

---

## 8. Risks and Mitigations

### 8.1 Technical Risks

| # | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| T1 | **Supabase migration breaks existing Firebase auth users** | Medium | High | No existing production users (pre-launch). Clean migration with no data to carry over. Verify Google OAuth redirect works with Supabase before cutting over. | CTO |
| T2 | **Client-side ZIP generation fails on large capsules (>500MB) on mobile** | Medium | Medium | Enforce 500MB storage limit for free tier. Add memory check before ZIP generation. Show "Use WiFi and close other apps" warning for capsules >200MB. Server-side archive as Phase 2 fallback. | CTO |
| T3 | **MediaRecorder API not supported on all target browsers** | Low | Medium | Safari 14.5+ supports MediaRecorder. Add feature detection. Fallback: file upload for pre-recorded audio. Minimum browser requirement: Safari 15+, Chrome 90+. | CTO |
| T4 | **Supabase Storage upload fails silently on large video files** | Medium | Medium | Implement chunked upload for files >50MB using `tus` protocol (Supabase supports it). Show granular progress. Retry logic (NFR-REL-001). | CTO |
| T5 | **React 18 to 19 upgrade introduces breaking changes** | Low | Low | React 19 is stable as of Jan 2025. Main risk is `use()` hook conflicts. Test with POC_INTERNA's existing React 19 setup as reference. Pin exact versions. | CTO |

### 8.2 Product Risks

| # | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| P1 | **Users don't understand the capsule metaphor** | Medium | High | Onboarding P1-P3 is designed specifically for this. Add "?" tooltip on P4 that replays manifesto. Track `onboarding.p3_viewed` -> `onboarding.p4_reached` drop-off rate. If >40% drop: simplify manifesto. | CEO |
| P2 | **Users start capsules but abandon before adding content** | High | High | "Add first memory" prompt immediately after creation (FR-CAP-010). Email reminder at 24h and 72h if capsule is empty. Dashboard empty-capsule card with CTA "Anade tu primer recuerdo". | CEO |
| P3 | **Closure flow feels too final / scary, users avoid it** | Medium | Medium | Reframe closure as "seal your capsule" not "close forever". Add preview of what the archive looks like before confirming. Allow "reopen" within 24h of closure (before server cleanup). | CEO |
| P4 | **3 capsule types at launch feels limited** | Low | Low | "Coming soon" cards with waitlist capture gauges demand for other types. Legacy (post-mortem) + Life Chapter (transitions) + Pet (memorial) cover 3 distinct emotional needs. | CEO |
| P5 | **Users expect payment integration to unlock premium features** | Medium | Medium | Free tier is generous (1 capsule, 500MB). Display upgrade benefits clearly but redirect to "Contactanos" instead of payment form. Manual upgrade by CTO for beta testers. | CEO |

### 8.3 Execution Risks

| # | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| E1 | **12-week timeline is too aggressive for 2-person team** | High | High | Strict phase gates (see Section 10). Phase 1 (infra + auth + onboarding) is the minimum lovable product. Phase 2 (capsule editor) builds on solid foundation. If behind schedule at Week 6 checkpoint, cut Pet capsule (ship with 2 types). | CEO + CTO |
| E2 | **CEO bandwidth bottleneck (legal text, copy review, design decisions)** | Medium | Medium | Front-load ALL CEO decisions to Week 1-2 (theme, copy, legal). Create a "Decision Backlog" spreadsheet. CTO proceeds with placeholder text if CEO decisions are pending >3 business days. | CEO |
| E3 | **No testing infrastructure means regressions during rapid development** | High | Medium | Add Vitest in Phase 1 (Week 1). Add Playwright E2E for critical path in Phase 2. Minimum: unit tests for auth hook, capsule creation, storage calculation. E2E for: onboarding flow, capsule creation, content upload. | CTO |

---

## 9. Acceptance Criteria

### 9.1 Phase 1 Acceptance (Week 4 Gate)

All must pass to proceed to Phase 2.

- [ ] **AC-P1-01:** New Next.js 15 project with React 19, TypeScript, Tailwind, Framer Motion builds without errors on Vercel.
- [ ] **AC-P1-02:** Supabase project created with all tables from `DATA_MODEL.md` schema. RLS policies active on users, capsules, contents, designated_persons.
- [ ] **AC-P1-03:** Email + password registration creates user in Supabase Auth AND `users` table.
- [ ] **AC-P1-04:** Google OAuth creates user in Supabase Auth AND `users` table.
- [ ] **AC-P1-05:** Onboarding screens P1-P4 render correctly on iPhone SE (375px) and iPhone 14 Pro Max (428px).
- [ ] **AC-P1-06:** P1 capsule tap -> P2 animation -> P3 manifesto -> P4 selection flow works end-to-end.
- [ ] **AC-P1-07:** Capsule type detail screen (P5) renders for Legacy, Life Chapter, and Pet with correct copy from CAPSULE_TYPES.md.
- [ ] **AC-P1-08:** Auth gate triggers on "Crear esta capsula" tap when user is not authenticated.
- [ ] **AC-P1-09:** After auth, user is redirected to capsule setup wizard (not dashboard).
- [ ] **AC-P1-10:** Legal consent screen records timestamps to `users.terms_accepted_at` and `users.privacy_accepted_at`.
- [ ] **AC-P1-11:** Vitest configured with at least 1 passing test (auth hook).
- [ ] **AC-P1-12:** i18n file (`/src/i18n/es.ts`) created with all onboarding strings externalized.

### 9.2 Phase 2 Acceptance (Week 8 Gate)

All must pass to proceed to Phase 3.

- [ ] **AC-P2-01:** 3-step capsule creation wizard works for Legacy type (name -> recipients -> confirm -> capsule row in DB).
- [ ] **AC-P2-02:** 3-step capsule creation wizard works for Life Chapter type (name -> chapter config -> confirm).
- [ ] **AC-P2-03:** 3-step capsule creation wizard works for Pet type (name -> pet profile -> confirm).
- [ ] **AC-P2-04:** Capsule editor renders with calendar timeline, content cards, and bottom action bar.
- [ ] **AC-P2-05:** Photo upload (single file) works: file picker -> preview -> save -> visible in timeline.
- [ ] **AC-P2-06:** Batch photo upload (up to 10 files) works with individual progress indicators.
- [ ] **AC-P2-07:** Video upload works with duration validation per plan tier.
- [ ] **AC-P2-08:** Audio recording works with waveform visualization and 5-minute limit.
- [ ] **AC-P2-09:** Text note editor works with basic formatting and character limit.
- [ ] **AC-P2-10:** Content detail modal works: view, edit metadata, delete with confirmation.
- [ ] **AC-P2-11:** Storage indicator displays correct usage and changes color at 80% and 95%.
- [ ] **AC-P2-12:** Dashboard shows all capsules with correct type icons, content counts, and status badges.
- [ ] **AC-P2-13:** Playwright E2E test passes for: onboarding -> create Legacy capsule -> upload photo -> verify in editor.
- [ ] **AC-P2-14:** Plan limit enforcement works: free user with 1 capsule cannot create a second.

### 9.3 Phase 3 Acceptance (Week 12 -- Beta Launch Gate)

All must pass for beta launch.

- [ ] **AC-P3-01:** Capsule closure flow works: confirm -> ZIP generation -> download -> status update.
- [ ] **AC-P3-02:** ZIP archive contains all content files organized by type + manifest.json.
- [ ] **AC-P3-03:** Supabase Edge Function deletes storage files within 24h of download confirmation.
- [ ] **AC-P3-04:** Closed capsules appear in dashboard as read-only with "Cerrada"/"Descargada" badge.
- [ ] **AC-P3-05:** "Coming soon" modal works for Together, Social, Origin types with waitlist capture.
- [ ] **AC-P3-06:** Settings page shows: profile info, plan tier, storage summary, data export button, delete account button.
- [ ] **AC-P3-07:** Cookie consent banner appears on first visit.
- [ ] **AC-P3-08:** All audit events (FR-ANL-001) are logged correctly.
- [ ] **AC-P3-09:** Lighthouse mobile score >= 90 for Performance on `/` and `/dashboard`.
- [ ] **AC-P3-10:** axe accessibility audit passes with 0 critical/serious violations on all pages.
- [ ] **AC-P3-11:** All Vitest unit tests pass (>= 20 tests covering auth, capsule CRUD, storage calculation, validation).
- [ ] **AC-P3-12:** All Playwright E2E tests pass (>= 5 tests covering: onboarding, registration, capsule creation per type, content upload, closure).
- [ ] **AC-P3-13:** Full flow demo works on iPhone Safari (real device or BrowserStack): onboarding -> register -> create Legacy capsule -> upload 3 photos + 1 note -> close -> download ZIP.
- [ ] **AC-P3-14:** Full flow demo works on Chrome Android (real device or BrowserStack): same flow as AC-P3-13.
- [ ] **AC-P3-15:** Application deployed to production URL (nuclea.es or staging subdomain) with valid SSL.

---

## 10. Delivery Phases

### Phase 1: Foundation (Weeks 1--4)

**Goal:** Working app with onboarding, auth, and capsule creation shell on Supabase.

#### Week 1: Infrastructure

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Create Supabase project + configure auth providers (email, Google) | CTO | 4h | Supabase dashboard URL, auth working |
| Run database schema migration (all tables from DATA_MODEL.md) | CTO | 4h | All tables created with RLS policies |
| Create new Next.js 15 project with React 19 + Tailwind + Framer Motion | CTO | 4h | `npm run build` succeeds on Vercel |
| Configure Supabase client (`@supabase/supabase-js` + `@supabase/ssr`) | CTO | 4h | Auth sign-up/sign-in works in dev |
| Create i18n structure (`/src/i18n/es.ts`) | CTO | 2h | All strings externalized |
| Configure Vitest | CTO | 2h | 1 passing test |
| **CEO Decision Sprint** | CEO | 8h | Theme decision (white vs dark), copy review, legal text draft |

**Week 1 Gate:** Supabase auth works (email + Google). DB tables exist. New project builds.

#### Week 2: Onboarding

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Port P1CapsuleClosed component from POC_INTERNA | CTO | 3h | P1 renders on production app |
| Port P2CapsuleOpening component | CTO | 4h | Animation plays correctly |
| Port P3Manifesto component | CTO | 2h | Text renders per spec |
| Port P4CapsuleSelection component | CTO | 4h | 6 cards, 3 active + 3 coming soon |
| Create onboarding page orchestrator with fade transitions | CTO | 3h | P1->P2->P3->P4 flow works |
| Create P5 CapsuleTypeDetail screen (template for all types) | CTO | 4h | Detail screen renders for Legacy |
| Implement onboarding cookie + redirect logic (FR-ONB-007) | CTO | 2h | Returning users skip onboarding |
| Write unit tests for onboarding state machine | CTO | 2h | 3+ tests passing |

**Week 2 Gate:** Complete onboarding flow P1-P5 works on mobile.

#### Week 3: Auth + Registration

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Build registration page (email + password + Google) | CTO | 6h | Registration works, user in DB |
| Build login page | CTO | 4h | Login works, session persists |
| Implement auth gate (FR-AUTH-004, FR-AUTH-005) | CTO | 4h | Gate triggers at correct moment, redirects after auth |
| Build legal consent screen with checkboxes + timestamps | CTO | 3h | Consent recorded in `users` table |
| Implement protected route middleware | CTO | 3h | Unauthenticated users redirected |
| Build useAuth hook (Supabase version) | CTO | 4h | Hook returns user, loading, auth methods |
| Write unit tests for auth hook | CTO | 2h | 3+ tests passing |
| **CEO: Finalize legal text** | CEO | 4h | Terms + privacy policy text delivered |

**Week 3 Gate:** User can go from onboarding to registration to authenticated state.

#### Week 4: Capsule Creation + Phase Gate

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Build capsule setup wizard (3-step shell) | CTO | 6h | Step navigation works |
| Build Step 2 variants (Legacy: recipients, Life Chapter: dates, Pet: profile) | CTO | 8h | All 3 types have specific Step 2 |
| Build Step 3 summary + confirm | CTO | 3h | Summary renders, "Crear" writes to DB |
| Build post-creation confirmation screen with 4 CTAs | CTO | 3h | Confirmation screen renders |
| Implement plan limit enforcement (FR-CAP-009) | CTO | 2h | Free user cannot exceed 1 capsule |
| Build basic dashboard (capsule list, empty state) | CTO | 4h | Dashboard shows created capsules |
| Phase 1 acceptance testing (AC-P1-01 through AC-P1-12) | CTO + CEO | 4h | All criteria pass |

**Week 4 Gate Review:** Demo to CEO. Decide if on track or need scope adjustment.

---

### Phase 2: Capsule Editor (Weeks 5--8)

**Goal:** Users can add content to capsules and manage it.

#### Week 5: Content Upload Infrastructure

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Configure Supabase Storage buckets + RLS policies | CTO | 4h | Buckets created, upload works via SDK |
| Build file upload service (client-side validation, chunked upload for large files) | CTO | 8h | Upload function with progress callback |
| Build photo upload flow (picker -> preview -> metadata -> save) | CTO | 6h | Photo upload end-to-end works |
| Build batch photo upload (up to 10, parallel with individual progress) | CTO | 4h | Multi-photo upload works |
| Client-side thumbnail generation (canvas resize to 200x200) | CTO | 3h | Thumbnails generated for all photos |
| Write `contents` table CRUD hooks (`useContents`) | CTO | 4h | Hook returns contents, upload, delete methods |

**Week 5 Gate:** Photos can be uploaded and appear in DB with storage paths.

#### Week 6: Rich Content Types + Timeline

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Build video upload flow (file picker, duration check, thumbnail extraction) | CTO | 6h | Video upload works with plan limit enforcement |
| Build audio recording flow (MediaRecorder, waveform, pause/resume) | CTO | 8h | Audio recording works |
| Build text note editor (textarea with markdown preview) | CTO | 4h | Note save/edit works |
| Build calendar timeline component | CTO | 6h | Calendar with content dots, day tap scrolls to content |
| Build content card component (thumbnail, title, date, type badge) | CTO | 3h | Cards render for all 4 content types |
| Build content detail modal (view, edit, delete) | CTO | 4h | Modal works for all types |

**Week 6 Gate Review:** All 4 content types work. Calendar timeline functional. Mid-project checkpoint with CEO -- scope adjustment if needed.

#### Week 7: Capsule Editor Assembly + Storage Management

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Assemble capsule editor page (header, calendar, cards, action bar, menu) | CTO | 6h | Full editor page functional |
| Build storage usage indicator with color thresholds | CTO | 3h | Indicator works, colors change at 80%/95% |
| Implement storage limit enforcement (disable uploads at 100%) | CTO | 3h | Upload buttons disabled at limit |
| Build capsule metadata edit (title, description from overflow menu) | CTO | 3h | Edit works, DB updated |
| Build recipient management for Legacy capsules (from overflow menu) | CTO | 4h | Add/remove recipients works |
| Write E2E test: onboarding -> create -> upload photo -> verify | CTO | 4h | Playwright test passes |
| Responsive testing on mobile (iPhone SE, iPhone 14 Pro Max) | CTO | 4h | No layout breaks |

**Week 7 Gate:** Complete capsule editing experience works on mobile.

#### Week 8: Dashboard Polish + Phase Gate

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Enhance dashboard: type icons, content counts, status badges, last updated | CTO | 4h | Dashboard shows rich capsule cards |
| "Nueva capsula" from dashboard (skip onboarding, go to P4) | CTO | 2h | Dashboard -> P4 works |
| Build coming-soon modal with waitlist capture | CTO | 3h | Modal works for 3 coming-soon types |
| Error handling sweep: loading states, error toasts, empty states | CTO | 6h | No unhandled errors, no white screens |
| Audit log implementation (FR-ANL-001 events) | CTO | 4h | Events logged to `audit_logs` table |
| Phase 2 acceptance testing (AC-P2-01 through AC-P2-14) | CTO + CEO | 4h | All criteria pass |

**Week 8 Gate Review:** Full demo to CEO. Capsule creation + content upload + dashboard. Decide closure scope for Phase 3.

---

### Phase 3: Closure + Polish + Launch (Weeks 9--12)

**Goal:** Complete the capsule lifecycle. Polish for beta launch.

#### Week 9: Capsule Closure

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Build closure confirmation modal with consequence list | CTO | 3h | Modal renders correctly |
| Integrate JSZip for client-side archive generation | CTO | 6h | ZIP generates with all content types |
| Build `manifest.json` generator (capsule metadata) | CTO | 2h | Manifest included in ZIP |
| Build download flow (progress -> trigger download -> status update) | CTO | 4h | Download works, status updated in DB |
| Build Supabase Edge Function for async storage cleanup | CTO | 6h | Files deleted within 24h of download |
| Closed capsule read-only view in dashboard | CTO | 3h | Closed capsules non-editable |

**Week 9 Gate:** Capsule lifecycle complete: create -> add content -> close -> download.

#### Week 10: Settings, GDPR, Accessibility

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Build settings page: profile, plan, storage summary | CTO | 4h | Settings page functional |
| Build data export function (GDPR) | CTO | 4h | Export generates ZIP of all user data |
| Build account deletion request flow | CTO | 3h | Deletion request recorded, admin notified |
| Build cookie consent banner | CTO | 3h | Banner appears, preference stored |
| Accessibility audit + fixes (axe, keyboard nav, focus states) | CTO | 6h | 0 critical/serious axe violations |
| Implement all remaining audit events | CTO | 3h | All FR-ANL-001 events logging |

**Week 10 Gate:** GDPR compliance in place. Accessibility passing.

#### Week 11: Testing + Performance

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Write remaining unit tests (target: 20+ total) | CTO | 8h | Vitest suite passing |
| Write remaining E2E tests (target: 5+ scenarios) | CTO | 8h | Playwright suite passing |
| Performance audit + optimization (bundle size, lazy loading, image optimization) | CTO | 6h | Lighthouse >= 90 mobile performance |
| Cross-browser testing (Safari iOS, Chrome Android, Chrome Desktop, Firefox) | CTO | 4h | No critical issues on any browser |
| Fix all bugs found during testing | CTO | 8h | 0 P0/P1 bugs remaining |

**Week 11 Gate:** All tests passing. Performance targets met.

#### Week 12: Launch Prep + Beta Deploy

| Task | Owner | Est. Hours | Deliverable |
|---|---|---|---|
| Deploy to production URL (nuclea.es or staging) | CTO | 4h | App accessible at production URL |
| Configure production Supabase (separate from dev) | CTO | 4h | Production DB isolated from dev |
| SSL verification + DNS configuration | CTO | 2h | HTTPS working correctly |
| Smoke test full flow on production | CTO + CEO | 4h | Full flow works on production |
| Phase 3 acceptance testing (AC-P3-01 through AC-P3-15) | CTO + CEO | 6h | All criteria pass |
| Create beta user accounts for testers (5-10 invited users) | CTO | 2h | Accounts created, welcome email sent |
| **CEO: Beta launch communication** | CEO | 8h | Beta invitation emails sent to selected testers |

**Week 12 Gate:** Beta launched. 5-10 testers invited. Monitoring active.

---

### Milestone Summary

| Milestone | Week | Key Deliverable | Success Criteria |
|---|---|---|---|
| **M1: Foundation** | 4 | Auth + Onboarding + Capsule Creation | AC-P1-01 through AC-P1-12 all pass |
| **M2: Editor** | 8 | Content upload + Dashboard + Timeline | AC-P2-01 through AC-P2-14 all pass |
| **M3: Beta Launch** | 12 | Closure + Polish + Production Deploy | AC-P3-01 through AC-P3-15 all pass |

### Scope Reduction Plan (If Behind Schedule)

If the Week 6 checkpoint reveals significant delays:

| Cut | Impact | Savings |
|---|---|---|
| **Cut 1:** Drop Pet capsule, ship with Legacy + Life Chapter only | Lose 1 demo scenario. Low demand risk. | ~8 hours |
| **Cut 2:** Replace audio recording with audio file upload only | Lose in-browser recording. Users record on phone, upload file. | ~8 hours |
| **Cut 3:** Replace calendar timeline with simple chronological list | Lose visual calendar. Content still organized by date. | ~6 hours |
| **Cut 4:** Skip batch photo upload, single-file only | Users upload one at a time. Annoying but functional. | ~4 hours |
| **Cut 5:** Skip data export (GDPR) -- implement as admin-manual | Legal risk. Only acceptable for <100 beta users. | ~4 hours |

Total recovery possible: ~30 hours (approximately 1 week of full-time CTO work).

---

## Appendix A: Type System Alignment

The production codebase must be aligned with the spec before development begins.

### Current State (PREREUNION_ANDREA)

```typescript
type CapsuleType = 'everlife' | 'life-chapter' | 'social' | 'pet' | 'origin'
```

### Target State (This PRD)

```typescript
type CapsuleType = 'legacy' | 'together' | 'social' | 'pet' | 'life_chapter' | 'origin'
```

### Changes Required

| Change | Rationale |
|---|---|
| `'everlife'` -> `'legacy'` | `everlife` is a feature (AI avatar), not a capsule type. Spec uses `legacy`. |
| Add `'together'` | Spec defines 6 types. Code has 5. |
| `'life-chapter'` -> `'life_chapter'` | PostgreSQL enum convention (underscore). Frontend can display with hyphen. |

---

## Appendix B: File Structure (Target)

```
PREREUNION_ANDREA/         (renamed or new project)
src/
  app/
    page.tsx                    # Landing/Redirect logic
    layout.tsx                  # Root layout (fonts, providers)
    onboarding/
      page.tsx                  # P1-P4 orchestrator
    capsulas/
      nueva/
        page.tsx                # P4 selection (reusable from onboarding)
      [type]/
        page.tsx                # P5 type detail
      crear/
        page.tsx                # P8-P10 creation wizard
      [id]/
        page.tsx                # Capsule editor
    dashboard/
      page.tsx                  # Dashboard
    login/
      page.tsx                  # Login
    registro/
      page.tsx                  # Registration
    settings/
      page.tsx                  # User settings
    api/
      capsules/
        route.ts                # Capsule CRUD
      contents/
        route.ts                # Content CRUD
      waitlist/
        route.ts                # Waitlist capture
  components/
    onboarding/
      P1CapsuleClosed.tsx
      P2CapsuleOpening.tsx
      P3Manifesto.tsx
      P4CapsuleSelection.tsx
    capsule/
      CapsuleTypeDetail.tsx
      CapsuleCreationWizard.tsx
      CapsuleEditor.tsx
      CapsuleTimeline.tsx
      CapsuleCard.tsx
      ClosureModal.tsx
    content/
      PhotoUpload.tsx
      VideoUpload.tsx
      AudioRecorder.tsx
      NoteEditor.tsx
      ContentCard.tsx
      ContentDetailModal.tsx
    ui/
      Button.tsx
      Input.tsx
      Modal.tsx
      StorageIndicator.tsx
      StatusBadge.tsx
    layout/
      Header.tsx
      Sidebar.tsx
      CookieConsent.tsx
  hooks/
    useAuth.ts                  # Supabase auth
    useCapsules.ts              # Capsule CRUD
    useContents.ts              # Content CRUD
    useStorage.ts               # Storage tracking
    useAudit.ts                 # Event logging
  lib/
    supabase/
      client.ts                 # Browser client
      server.ts                 # Server client
      middleware.ts              # Auth middleware
    storage.ts                  # File upload/download utilities
    zip.ts                      # JSZip archive generation
    validation.ts               # Zod schemas
  i18n/
    es.ts                       # All Spanish strings
  types/
    index.ts                    # Type definitions
    database.ts                 # Supabase generated types
  __tests__/
    hooks/
      useAuth.test.ts
      useCapsules.test.ts
    components/
      onboarding.test.ts
    e2e/
      onboarding.spec.ts
      capsule-creation.spec.ts
      content-upload.spec.ts
      closure.spec.ts
```

---

## Appendix C: Database Schema Quick Reference

See `POC_INTERNA/01_SPECS/DATA_MODEL.md` for full schema. Key tables for this PRD:

| Table | Purpose | Phase |
|---|---|---|
| `users` | User profiles + plan tier + consent timestamps | Phase 1 |
| `capsules` | Capsule records with type, status, storage tracking | Phase 1 |
| `contents` | Individual content items linked to capsules | Phase 2 |
| `designated_persons` | Recipients for Legacy capsules | Phase 1 |
| `collaborators` | (Not used in MVP -- Phase 2 for Together/Social) | Phase 2 |
| `future_messages` | (Not used in MVP -- Phase 2) | Phase 2 |
| `subscriptions` | (Placeholder -- manual plan assignment in MVP) | Phase 2 |
| `audit_logs` | Event tracking for analytics | Phase 2 |

---

## Appendix D: Open Questions for CEO Decision

These questions must be resolved in Week 1. CTO cannot proceed without answers.

| # | Question | Options | Recommendation | Deadline |
|---|---|---|---|---|
| Q1 | White theme (POC) or dark theme (production)? | A) White (POC_INTERNA) B) Dark (PREREUNION_ANDREA) C) Light with dark capsule elements | A) White. Aligns with Andrea's PDFs and "intimacy, calm" philosophy. | Week 1 Day 2 |
| Q2 | Body font: Inter (POC) or DM Sans (production)? | A) Inter B) DM Sans | A) Inter. Better readability, wider weight range, more standard. | Week 1 Day 2 |
| Q3 | Is `nuclea.es` domain secured and configured? | A) Yes B) No C) Different domain | Need answer to configure Supabase OAuth redirects. | Week 1 Day 1 |
| Q4 | Are there final capsule illustrations (not placeholders)? | A) Yes, ready B) Need to commission C) Use placeholders for beta | C) Placeholders acceptable for beta. Commission for public launch. | Week 2 |
| Q5 | Terms of service and privacy policy text -- who drafts? | A) CEO writes B) Use template + lawyer review later C) Lawyer drafts | B) Template for beta, lawyer review before public launch. Minimizes legal cost at pre-seed. | Week 3 |
| Q6 | Should the "Crear esta capsula" button require auth for ALL types or only paid types? | A) All types require auth B) Free capsule (1st) can start without auth | A) All require auth. Need email for capsule delivery, storage tracking, GDPR compliance. | Week 1 Day 3 |

---

*End of Document*

*Generated: 2026-02-07 | PRM-PRODUCT-001 v1.0*
*Next Review: Week 1 CEO Decision Sprint*
