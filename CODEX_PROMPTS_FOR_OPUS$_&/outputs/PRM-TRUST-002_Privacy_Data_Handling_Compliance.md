# PRM-TRUST-002 Privacy & Data Handling Compliance Output

## Metadata
- Prompt: PRM-TRUST-002 v1.0.0
- Date: 2026-02-08
- Reviewer: CTO PromptOps (Opus 4.6)
- Apps: PREREUNION_ANDREA (Firebase) + POC_INTERNA/app (no backend)
- Jurisdiction: Spain/EU (GDPR + LOPD 3/2018)

---

## 1. Data Classification Matrix

### User Data (PREREUNION_ANDREA/src/types/index.ts)

| Field | Classification | GDPR Category |
|-------|---------------|---------------|
| email | PERSONAL | Art. 4(1) |
| displayName | PERSONAL | Art. 4(1) |
| photoURL | PERSONAL | Art. 4(1) |
| plan, capsuleCount, storageUsed | Operational | N/A |

### AI Avatar Data (types/index.ts lines 41-52)

| Field | Classification | GDPR Category |
|-------|---------------|---------------|
| voiceId (ElevenLabs) | **BIOMETRIC** | Art. 9(1) |
| voiceModelUrl | **BIOMETRIC** | Art. 9(1) |
| profilePhotoUrl | **BIOMETRIC** | Art. 9(1) |
| videoUrls | **BIOMETRIC** | Art. 9(1) |
| personalityPrompt | **SENSITIVE** | Art. 9 |
| consentDocumentUrl, consentSignedAt | Legal | N/A |

### Future Messages (01_SPECS/DATA_MODEL.md)

| Field | Classification | GDPR Category |
|-------|---------------|---------------|
| recipient_email | PERSONAL (3rd party) | Art. 4(1) |
| recipient_name | PERSONAL (3rd party) | Art. 4(1) |
| encrypted_content | SENSITIVE/POST-MORTEM | Art. 9 |

---

## 2. GDPR Article Compliance

| Article | Requirement | Status | Evidence |
|---------|-------------|--------|----------|
| Art. 6 | Lawful basis | **FAIL** | No privacy policy documenting legal basis |
| Art. 7 | Consent conditions | **FAIL** | Checkbox exists (registro/page.tsx:181) but NOT persisted to DB |
| Art. 9 | Biometric processing | **FAIL** | AI Avatar collects voice/face without explicit separate consent |
| Art. 13-14 | Right to be informed | **FAIL** | /privacidad and /terminos are dead links (404) |
| Art. 15 | Right of access | **FAIL** | No data export feature |
| Art. 17 | Right to erasure | **FAIL** | Hard delete in DB, Storage files NOT deleted |
| Art. 20 | Right to portability | **FAIL** | No JSON/ZIP export |
| Art. 21 | Right to object | **FAIL** | No opt-out for waitlist |
| Art. 28 | Processor agreements | **FAIL** | No DPA for Firebase, ElevenLabs, Vercel |
| Art. 44-49 | International transfers | **FAIL** | Firebase region NOT configured (defaults us-central1) |

---

## 3. LOPD 3/2018 Spain-Specific

| Requirement | Status |
|-------------|--------|
| Digital inheritance (Art. 96) | PARTIAL - spec exists, not implemented |
| Post-mortem data access | PARTIAL - mechanism planned, code missing |
| Designated person notification | FAIL - no UI |

---

## 4. Consent Flow Audit

- Registration checkbox EXISTS but state NOT persisted to Firestore
- Google OAuth auto-creates user WITHOUT consent prompt
- User creation (useAuth.ts:33-46): NO terms_accepted_at field
- Dead links: /privacidad, /terminos, /consentimiento, /contacto (all 404)
- AI Avatar consent document: consentDocumentUrl field exists, NO actual document in codebase

---

## 5. Data Lifecycle - Capsule

- Create (useCapsules.ts:60-93): NO retention period set
- Delete (useCapsules.ts:110-124): HARD DELETE in Firestore, Storage files ORPHANED
- Product promise: content deleted after download (USER_FLOWS.md:278)
- Reality: NO code exists to delete storage files after download
- Planned retention (STORAGE_BUCKETS.md): spec only, not implemented

---

## 6. Post-Mortem Data & Future Messages

- User A stores User B email without User B consent (Art. 6 violation)
- Encryption spec exists (AES-256-GCM) but NOT implemented
- 30-day auto-delete planned but recipient has NO erasure control

---

## 7. Third-Party Processors

| Processor | Data Shared | DPA Status |
|-----------|-------------|------------|
| Google Firebase | All user data | NOT referenced |
| ElevenLabs | Voice biometric data | NOT found |
| Vercel | HTTP logs, IPs | NOT referenced |

No analytics/tracking found (positive).

---

## 8. Remediation Backlog (by legal risk)

| Priority | Issue | File Target |
|----------|-------|-------------|
| P0 | Create Privacy Policy (ES) | new: /app/privacidad/page.tsx |
| P0 | Create Terms of Service (ES) | new: /app/terminos/page.tsx |
| P0 | Persist consent timestamps | hooks/useAuth.ts:33-46 |
| P0 | Create AI Avatar consent doc | new: /public/legal/ |
| P0 | Configure Firebase EU region | lib/firebase.ts |
| P0 | Sign Google Cloud DPA | External |
| P1 | Delete Storage files on capsule delete | hooks/useCapsules.ts:110-124 |
| P1 | Add data export (Art. 15) | new: settings page |
| P1 | Add account deletion flow | new: settings page |
| P1 | Add waitlist consent + unsubscribe | api/waitlist/route.ts |
| P2 | Add audit logging | new: middleware |
| P2 | Add recipient notification (future msgs) | new: edge function |
| P3 | Automated data retention cleanup | new: cron |

---

## 9. Compliance Score: 32/100 (FAIL)

| Category | Score |
|----------|-------|
| Legal Documents | 0/20 |
| Consent Mechanisms | 5/20 |
| Data Rights | 3/20 |
| Security & Encryption | 14/20 |
| Third-party Compliance | 4/20 |
| Audit & Accountability | 2/20 |

---

## 10. Gate Decision

| Domain | Gate |
|--------|------|
| Legal documents | **FAIL** |
| Consent capture | **FAIL** |
| Data erasure | **FAIL** |
| Biometric handling | **FAIL** |
| International transfers | **FAIL** |
| Third-party DPAs | **FAIL** |

**Overall: FAIL** (6/6 domains fail)

Estimated remediation: ~160 hours + legal fees (5-10K EUR)

Pre-launch blockers: Cannot launch in EU without privacy policy (Art. 13) and biometric consent (Art. 9).
