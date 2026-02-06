# NUCLEA Technical Documentation

Technical source of truth for architecture, data model, API shape, user flows, and capsule behavior.

## What this folder covers

| Area | Main file |
|------|-----------|
| System architecture | `ARCHITECTURE.md` |
| Database and entities | `DATABASE_SCHEMA.md` |
| UI system tokens/components | `DESIGN_SYSTEM.md` |
| Type contracts | `TYPESCRIPT_TYPES.md` |
| MVP boundaries | `MVP_SCOPE.md` |
| API contract | `api/ENDPOINTS.md` |
| Capsule behavior | `capsules/INDEX.md` |
| End-to-end flows | `flows/INDEX.md` |

## Documentation map

```text
docs/
├── README.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── DESIGN_SYSTEM.md
├── TYPESCRIPT_TYPES.md
├── MVP_SCOPE.md
├── api/
│   └── ENDPOINTS.md
├── capsules/
│   ├── INDEX.md
│   ├── legacy/{README.md,FEATURES.md}
│   ├── together/{README.md,FEATURES.md}
│   ├── social/{README.md,FEATURES.md}
│   ├── pet/{README.md,FEATURES.md}
│   ├── life-chapter/{README.md,FEATURES.md}
│   └── origin/{README.md,FEATURES.md}
├── flows/
│   ├── INDEX.md
│   ├── ONBOARDING.md
│   ├── CONTENT_UPLOAD.md
│   ├── CAPSULE_CLOSURE.md
│   └── FUTURE_MESSAGES.md
└── spec/
    ├── animation/ANIMATION_STRATEGY.md
    ├── capsules/CAPSULE_TYPES_SPEC.md
    └── design-system/DESIGN_SYSTEM.md
```

## Reading paths by role

### Product + UX
1. `MVP_SCOPE.md`
2. `capsules/INDEX.md`
3. `flows/INDEX.md`
4. `DESIGN_SYSTEM.md`

### Frontend engineer
1. `DESIGN_SYSTEM.md`
2. `TYPESCRIPT_TYPES.md`
3. `flows/ONBOARDING.md`
4. `api/ENDPOINTS.md`

### Backend engineer
1. `DATABASE_SCHEMA.md`
2. `ARCHITECTURE.md`
3. `api/ENDPOINTS.md`
4. `flows/CAPSULE_CLOSURE.md`

## Relationship with `POC_INTERNA/`

- `docs/` describes the product/system target state.
- `POC_INTERNA/` tracks the internal implementation path and onboarding PoC execution artifacts.
- Before implementing new behavior, check both:
  - Target behavior: `docs/`
  - Current PoC reality: `POC_INTERNA/app/README.md`

## Maintenance rules

1. Update links in this file whenever adding/removing docs.
2. Keep naming consistent (`life-chapter`, not mixed variants).
3. If implementation diverges from spec, either:
   - Update spec to match reality, or
   - Open a gap note in the relevant spec file.
