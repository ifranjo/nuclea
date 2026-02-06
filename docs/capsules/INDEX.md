# Capsule Types Index

## Quick Comparison

| Capsule | Purpose | AI Avatar | Special Feature | Priority |
|---------|---------|-----------|-----------------|----------|
| [Legacy](./legacy/) | Post-mortem inheritance | Yes (EverLife) | Inactivity detection, Future messages | HIGH |
| [Together](./together/) | Couples shared memories | No | Dual consent, Gift mode | MEDIUM |
| [Social](./social/) | Private diary for friends | No | Anti-algorithm, No metrics | MEDIUM |
| [Pet](./pet/) | Pet memorial | No | Audio emphasis, Memorial mode | LOW-MEDIUM |
| [Life Chapter](./life-chapter/) | Bounded life experiences | Optional | Progress tracking, Templates | MEDIUM |
| [Origin](./origin/) | Parents → children | Optional | Drawings, 18-year journey | MEDIUM-HIGH |

## Content Types by Capsule

| Content | Legacy | Together | Social | Pet | Life Chapter | Origin |
|---------|--------|----------|--------|-----|--------------|--------|
| Photo | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Video | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Audio | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Note | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Drawing | - | - | - | - | - | ✓ |

## Pricing Availability

| Capsule | Free | Esencial | Familiar | EverLife |
|---------|------|----------|----------|----------|
| Legacy | - | - | ✓ | ✓ |
| Together | - | ✓ | ✓ | - |
| Social | - | 1 | ∞ | - |
| Pet | 1 | 2 | ∞ | - |
| Life Chapter | 1 | 3 | ∞ | - |
| Origin | - | 1 | ∞ | - |

## Closure Models

| Capsule | Closure Trigger | Who Downloads | Auto-delete |
|---------|-----------------|---------------|-------------|
| Legacy | Death/Inactivity | Recipients | After 90 days |
| Together | Mutual consent | Both partners | After confirm |
| Social | Owner | Owner + optional friends | After confirm |
| Pet | Owner | Owner + optional family | After confirm |
| Life Chapter | Owner | Owner | After confirm |
| Origin | Owner → Gift | Child (new owner) | After confirm |

## Documentation per Capsule

Each capsule folder contains:

```
capsules/
├── {type}/
│   ├── README.md       # Overview, key features, user flow
│   └── FEATURES.md     # Detailed feature specifications
```

## Common Patterns

### All Capsules Share
- Calendar-based timeline
- Photo/Video/Audio/Note content
- Owner-controlled closure
- Download archive on closure
- Server deletion after confirm

### Recipient-Based Capsules
- Legacy: Recipients receive after trigger
- Social: "Mis Socials" can view
- Pet: Family can view (optional)

### Collaborator-Based Capsules
- Together: Partner co-edits
- Origin: Co-parent can add (Familiar only)

### Gift-Enabled Capsules
- Together: Gift mode
- Life Chapter: Gift on completion
- Origin: Gift to child at target age

## Implementation Priority

### Phase 1 (MVP)
1. **Legacy** - Flagship product
2. **Life Chapter** - Common use case

### Phase 2
3. **Origin** - High emotional value
4. **Pet** - Quick wins

### Phase 3
5. **Together** - Collaboration complexity
6. **Social** - Feed infrastructure

## Database Impact

| Capsule | Uses Recipients | Uses Collaborators | Uses Future Messages | Uses Milestones |
|---------|-----------------|--------------------|--------------------|-----------------|
| Legacy | ✓ | - | ✓ | - |
| Together | - | ✓ | - | - |
| Social | ✓ (as Socials) | - | - | - |
| Pet | ✓ (as Family) | - | - | - |
| Life Chapter | - | - | - | ✓ |
| Origin | - | ✓ (Co-parent) | - | ✓ |

## Related Documentation

- [Database Schema](../DATABASE_SCHEMA.md)
- [API Endpoints](../api/ENDPOINTS.md)
- [TypeScript Types](../TYPESCRIPT_TYPES.md)
- [Design System](../DESIGN_SYSTEM.md)
