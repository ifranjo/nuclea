# PRM-PRODUCT-002: Capsule Creation Flow -- Frontend Implementation Plan

**Document ID:** PRM-PRODUCT-002
**Version:** 1.0
**Date:** 2026-02-07
**Author:** Staff Frontend Architect (Opus 4.6)
**Status:** Ready for Implementation
**Target App:** `POC_INTERNA/app/` (port 3001, white theme, pure UI)

---

## 0. Prerequisites and Assumptions

| # | Assumption | Implication |
|---|-----------|-------------|
| A1 | Implementation targets `POC_INTERNA/app/` (pure UI, no backend) | All data persisted via `useState`/Zustand local store; Supabase integration is post-MVP |
| A2 | Existing P1-P4 onboarding is complete and stable | New routes start after P4 capsule type selection |
| A3 | Framer Motion 11.15 is the sole animation library | No GSAP/Three.js; closure ritual uses Framer Motion reverse-capsule animation |
| A4 | Mobile-first: 390px primary breakpoint, 1440px desktop | All components designed at 390px, responsive up |
| A5 | No auth gate for POC | User is always "logged in" with mock profile |
| A6 | File uploads are simulated | `File` objects stored in memory/blob URLs; no Supabase Storage calls |
| A7 | Spain Spanish exclusively | All UI copy in `es-ES` |

---

## 1. Implementation Strategy

### 1.1 Routing Architecture

Extend the existing Next.js App Router structure. After P4 selection navigates to `/onboarding/capsule/[type]`, the new creation flow lives under a dedicated `/capsule/` route group.

```
src/app/
  onboarding/                     # EXISTING (P1-P4)
    page.tsx
    capsule/[type]/page.tsx       # EXISTING detail page (modify: add "Crear" CTA)
  capsule/                        # NEW route group
    create/[type]/                # Wizard: name, description, cover
      page.tsx
    [id]/                         # Active capsule shell
      page.tsx                    # Content timeline + FAB
      editor/page.tsx             # Content editor (full-screen)
      preview/page.tsx            # Read-only preview
      settings/page.tsx           # Settings, recipients, metadata
      close/page.tsx              # Closure ritual flow
```

### 1.2 Sequencing Rules

Each milestone (`M1`-`M8`) must satisfy its verification gate before the next milestone begins. No milestone may be started in parallel with another unless explicitly marked `PARALLEL-OK`.

```
M1 (State + Types) ──> M2 (Wizard) ──> M3 (Content Editor) ──> M4 (Organization)
                                                                        │
                                                                        ▼
                                              M5 (Preview) ──> M6 (Closure) ──> M7 (Contacts/Settings)
                                                                                        │
                                                                                        ▼
                                                                                  M8 (Polish + QA)
```

### 1.3 Build Approach

- **Atomic-first:** Build shared UI primitives (BottomSheet, FAB, MediaCard, ProgressRing) before page-level components
- **Mobile-first:** Every component starts at 390px, scales to 1440px via Tailwind responsive classes
- **Type-safe:** All new types added to `src/types/index.ts` before component work begins
- **Copy-first:** All Spanish UI strings defined in a `src/lib/copy.ts` constants file

---

## 2. Component Breakdown

### 2.1 Shared UI Primitives (New)

#### `BottomSheet`
```
Path: src/components/ui/BottomSheet.tsx
Purpose: Slide-up modal for content type picker, confirmations
Props:
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  snapPoints?: number[]          // [0.4, 0.8] = 40% and 80% of viewport
State: internal drag position (useMotionValue)
Dependencies: framer-motion
Animation: spring damping=25, stiffness=300, 300ms
Accessibility: role="dialog", aria-modal="true", focus trap, Escape to close
```

#### `FAB` (Floating Action Button)
```
Path: src/components/ui/FAB.tsx
Purpose: Primary action trigger in capsule view (+ add content)
Props:
  onClick: () => void
  icon?: LucideIcon              // default: Plus
  label: string                  // aria-label, visible on desktop
  disabled?: boolean
State: none
Dependencies: lucide-react
Position: fixed bottom-6 right-6, z-50
Accessibility: role="button", aria-label, focus-visible ring
```

#### `MediaCard`
```
Path: src/components/ui/MediaCard.tsx
Purpose: Thumbnail card for content items in timeline/grid
Props:
  content: CapsuleContent
  onClick: (id: string) => void
  onLongPress?: (id: string) => void
  isSelected?: boolean
  isDragging?: boolean
State: none (controlled)
Dependencies: next/image, lucide-react
Variants: photo (polaroid frame), video (play overlay), audio (waveform mini), note (text preview)
Accessibility: role="button", aria-selected, keyboard enter/space
```

#### `ProgressRing`
```
Path: src/components/ui/ProgressRing.tsx
Purpose: Upload progress, archive generation progress
Props:
  progress: number               // 0-100
  size?: number                  // default: 64
  strokeWidth?: number           // default: 4
  label?: string
State: none
Dependencies: none (SVG)
```

#### `ConfirmDialog`
```
Path: src/components/ui/ConfirmDialog.tsx
Purpose: Destructive action confirmations (delete content, close capsule)
Props:
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description: string
  confirmLabel: string
  confirmVariant: 'danger' | 'primary'
  requireTypedConfirmation?: string   // e.g. "CERRAR"
State: typedValue (if requireTypedConfirmation)
Dependencies: framer-motion (AnimatePresence)
Accessibility: role="alertdialog", aria-describedby, auto-focus cancel button
```

#### `DatePicker`
```
Path: src/components/ui/DatePicker.tsx
Purpose: Content date selection, delivery date selection
Props:
  value: Date
  onChange: (date: Date) => void
  label: string
  min?: Date
  max?: Date
State: isOpen, selectedMonth
Dependencies: none (native HTML date + custom overlay)
Accessibility: aria-label, keyboard navigable
```

#### `TagInput`
```
Path: src/components/ui/TagInput.tsx
Purpose: Add tags/labels to content items
Props:
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  maxTags?: number
  placeholder: string
State: inputValue, isFocused
Accessibility: role="listbox" for suggestions, aria-live for additions
```

### 2.2 Capsule Creation Wizard

#### `CapsuleCreatePage` (Route Component)
```
Path: src/app/capsule/create/[type]/page.tsx
Purpose: Multi-step wizard for capsule creation
Props: params.type (from URL)
State: wizardStep (1-3), formData (CapsuleCreateFormData)
Steps:
  1. Name + Description (text inputs)
  2. Cover Photo (upload or choose template)
  3. Review + Create
Dependencies: Header, Button, BottomSheet
```

#### `WizardStepIndicator`
```
Path: src/components/capsule/WizardStepIndicator.tsx
Purpose: Visual progress dots for wizard steps
Props:
  currentStep: number
  totalSteps: number
State: none
```

#### `CoverPhotoUploader`
```
Path: src/components/capsule/CoverPhotoUploader.tsx
Purpose: Upload or select cover image for capsule
Props:
  value: string | null            // blob URL or template ID
  onChange: (value: string) => void
  capsuleType: CapsuleType
State: isDragOver
Dependencies: next/image
Accessibility: drag-and-drop + click fallback, keyboard accessible
```

#### `CapsuleTemplateGrid`
```
Path: src/components/capsule/CapsuleTemplateGrid.tsx
Purpose: Pre-made cover templates per capsule type
Props:
  capsuleType: CapsuleType
  selected: string | null
  onSelect: (templateId: string) => void
State: none
```

### 2.3 Content Editor

#### `CapsuleEditorPage` (Route Component)
```
Path: src/app/capsule/[id]/page.tsx
Purpose: Main capsule view -- timeline of content + FAB for adding
Props: params.id (from URL)
State: pulls from useCapsuleStore
Layout:
  - Header with capsule title + settings icon
  - Calendar strip (horizontal scrollable months)
  - Content grid (masonry-like for photos, list for notes/audio)
  - FAB (+) bottom-right
Dependencies: Header, FAB, MediaCard, BottomSheet, CalendarStrip
```

#### `ContentTypePickerSheet`
```
Path: src/components/capsule/ContentTypePickerSheet.tsx
Purpose: Bottom sheet showing content type options (photo, video, audio, note, drawing)
Props:
  isOpen: boolean
  onClose: () => void
  onSelect: (type: ContentType) => void
  capsuleType: CapsuleType        // Controls visibility of "drawing" (Origin only)
State: none (controlled)
Dependencies: BottomSheet, lucide-react icons
```

#### `PhotoUploader`
```
Path: src/components/capsule/editors/PhotoUploader.tsx
Purpose: Photo capture/upload with drag-and-drop
Props:
  onSave: (photos: PendingContent[]) => void
  onCancel: () => void
State: selectedFiles, previews, isDragOver, currentIndex (for batch carousel)
Features:
  - Drag-and-drop zone
  - Click to open file picker (accept="image/*")
  - Camera capture button (input capture="environment")
  - Multi-select (max 10)
  - Per-photo: date picker, description textarea
  - Carousel navigation for batch
Dependencies: next/image, DatePicker
Validation: Max 20MB per file, image/* MIME only
Accessibility: dropzone role="button", aria-live for file count
```

#### `VideoUploader`
```
Path: src/components/capsule/editors/VideoUploader.tsx
Purpose: Video upload or camera recording
Props:
  onSave: (video: PendingContent) => void
  onCancel: () => void
State: selectedFile, preview, isRecording, recordingDuration
Features:
  - File picker (accept="video/*")
  - Camera record (input capture="environment")
  - Video preview with playback
  - Date picker, description
Validation: Max 500MB, video/* MIME, max 10min
Dependencies: DatePicker
```

#### `AudioRecorder`
```
Path: src/components/capsule/editors/AudioRecorder.tsx
Purpose: In-app voice recording with waveform visualization
Props:
  onSave: (audio: PendingContent) => void
  onCancel: () => void
State: isRecording, isPaused, duration, waveformData[], audioBlob
Features:
  - MediaRecorder API
  - Real-time waveform (AnalyserNode → canvas/SVG bars)
  - Max 5 minutes with countdown
  - Playback review before saving
  - Re-record option
  - Date picker, title input
Dependencies: DatePicker, WaveformVisualizer
Accessibility: aria-live for duration, keyboard stop/start
```

#### `WaveformVisualizer`
```
Path: src/components/capsule/WaveformVisualizer.tsx
Purpose: Audio waveform bar visualization
Props:
  data: number[]                  // 0-255 frequency data
  isPlaying: boolean
  progress?: number               // 0-1 for playback position
  height?: number
State: animationFrame ref
Render: SVG bars, gold accent color for active bars
```

#### `NoteEditor`
```
Path: src/components/capsule/editors/NoteEditor.tsx
Purpose: Rich text note creation
Props:
  onSave: (note: PendingContent) => void
  onCancel: () => void
  initialContent?: string
State: title, content, contentDate, charCount
Features:
  - Title input (optional)
  - Textarea with basic formatting toolbar (bold, italic, list)
  - Character count (max 10,000)
  - Auto-save draft (debounced to store)
  - Date picker
Dependencies: DatePicker
Accessibility: aria-label on toolbar buttons, role="textbox" with aria-multiline
```

#### `CalendarStrip`
```
Path: src/components/capsule/CalendarStrip.tsx
Purpose: Horizontal scrollable month selector showing content density
Props:
  contentDates: Date[]            // Dates that have content
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
State: scrollPosition
Dependencies: none
Render: Horizontal scroll, months with dot indicators for content days
```

### 2.4 Content Organization

#### `ContentGridView`
```
Path: src/components/capsule/ContentGridView.tsx
Purpose: Masonry-style grid of all capsule content
Props:
  contents: CapsuleContent[]
  isReorderMode: boolean
  onReorder: (newOrder: string[]) => void
  onSelect: (id: string) => void
State: draggedItemId
Features:
  - Default: tap to view detail
  - Long-press / edit button: enter reorder mode
  - Drag-and-drop reorder (touch + mouse)
  - Selection mode for batch operations
Dependencies: MediaCard
Accessibility: role="list", aria-grabbed for drag, aria-dropeffect
```

#### `ContentDetailModal`
```
Path: src/components/capsule/ContentDetailModal.tsx
Purpose: Full-screen view of a single content item with edit capabilities
Props:
  content: CapsuleContent | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<CapsuleContent>) => void
  onDelete: (id: string) => void
State: isEditing, editForm
Features:
  - Photo: full-screen image with zoom
  - Video: native video player
  - Audio: playback with waveform
  - Note: rendered rich text
  - Edit mode: change title, description, date, tags
  - Delete with confirmation
Dependencies: ConfirmDialog, DatePicker, TagInput, WaveformVisualizer
Accessibility: role="dialog", focus trap, close on Escape
```

### 2.5 Preview Mode

#### `CapsulePreviewPage` (Route Component)
```
Path: src/app/capsule/[id]/preview/page.tsx
Purpose: Read-only preview showing how recipient will see the capsule
Props: params.id
State: pulls from useCapsuleStore
Features:
  - Simulates capsule opening animation (reuses P2CapsuleOpening logic)
  - Polaroids fly out with actual capsule photos
  - Scroll to timeline view
  - No edit controls visible
  - "Volver al editor" floating button
  - Banner: "Asi verian tu capsula los destinatarios"
Dependencies: PolaroidPlaceholder, MediaCard, CalendarStrip
```

### 2.6 Capsule Closure Ritual

#### `CapsuleClosePage` (Route Component)
```
Path: src/app/capsule/[id]/close/page.tsx
Purpose: Multi-step closure ceremony
Props: params.id
State: closureStep (1-7), closingMessage, typedConfirmation, archiveProgress
Steps:
  1. ClosureExplanation — what happens when you close
  2. ClosingMessage — optional farewell text
  3. FinalConfirmation — type "CERRAR" to confirm
  4. ClosureAnimation — reverse of P2 (polaroids fly back into capsule, capsule halves close)
  5. ArchiveGeneration — simulated progress bar
  6. Download — download link + file info
  7. PostDownload — confirm safe storage, viewer mode
Dependencies: ConfirmDialog, ProgressRing, CapsuleClosureAnimation
```

#### `CapsuleClosureAnimation`
```
Path: src/components/capsule/CapsuleClosureAnimation.tsx
Purpose: Dramatic reverse animation -- polaroids converge to center, capsule halves close
Props:
  onComplete: () => void
  capsuleContents: CapsuleContent[]   // Up to 8 items for polaroid thumbnails
State: phase ('gathering' | 'closing' | 'sealed' | 'done')
Animation sequence:
  Phase 1 (0-1.5s): Polaroids with real photos drift from scattered positions toward center
  Phase 2 (1.5-2.3s): Capsule halves slide in from edges, glow at seam
  Phase 3 (2.3-3.0s): Light burst at seam, gold particles, "SELLADA" text fades in
  Phase 4 (3.0-4.0s): Capsule shrinks, settles, subtle float
Duration: 4 seconds total (matches P2)
Dependencies: framer-motion, PolaroidPlaceholder, next/image
Accessibility: prefers-reduced-motion → instant transition, aria-live for "sealed" status
```

### 2.7 Designated Contacts

#### `CapsuleSettingsPage` (Route Component)
```
Path: src/app/capsule/[id]/settings/page.tsx
Purpose: Capsule configuration, recipients, metadata
Props: params.id
State: pulls from useCapsuleStore
Sections:
  - Capsule info (edit title, description, cover)
  - Recipients list + add
  - Delivery conditions (per recipient)
  - Privacy settings
  - Danger zone (close capsule, delete capsule)
Dependencies: RecipientForm, RecipientCard, ConfirmDialog, DatePicker
```

#### `RecipientForm`
```
Path: src/components/capsule/RecipientForm.tsx
Purpose: Add a new designated recipient
Props:
  onSave: (recipient: NewRecipient) => void
  onCancel: () => void
State: form fields (name, email, phone, relationship, deliveryCondition)
Fields:
  - Nombre: text input (required)
  - Email: email input (required)
  - Telefono: tel input (optional)
  - Relacion: select (hijo/a, pareja, amigo/a, hermano/a, otro)
  - Condicion de entrega: select (upon death/inactivity, specific date, anniversary, manual)
  - Specific date picker (conditional on deliveryCondition)
  - Permissions: canView, canDownload checkboxes
Validation: Zod schema
Dependencies: DatePicker
```

#### `RecipientCard`
```
Path: src/components/capsule/RecipientCard.tsx
Purpose: Display a recipient with edit/remove actions
Props:
  recipient: Recipient
  onEdit: (id: string) => void
  onRemove: (id: string) => void
State: none
Dependencies: lucide-react (User, Mail, Trash2, Edit3)
Accessibility: role="listitem", button labels for actions
```

#### `DeliveryConditionPicker`
```
Path: src/components/capsule/DeliveryConditionPicker.tsx
Purpose: Select when capsule is delivered to recipient
Props:
  value: DeliveryCondition
  onChange: (condition: DeliveryCondition) => void
State: none (controlled)
Options:
  - 'on_death' — Por inactividad (configurable months)
  - 'specific_date' — Fecha concreta (date picker)
  - 'anniversary' — Aniversario anual (date picker for first)
  - 'manual' — Entrega manual (owner triggers)
Dependencies: DatePicker
```

---

## 3. State Model

### 3.1 Store Architecture

Introduce Zustand for capsule creation flow state. Keep the POC's onboarding on `useState` (no breaking changes).

```
src/lib/stores/
  capsuleStore.ts         # Active capsule + contents
  wizardStore.ts          # Creation wizard form state
  uiStore.ts              # Bottom sheets, modals, toasts
```

### 3.2 `wizardStore` (Creation Wizard)

```typescript
// src/lib/stores/wizardStore.ts
import { create } from 'zustand'
import type { CapsuleType } from '@/types'

interface WizardFormData {
  capsuleType: CapsuleType
  title: string
  description: string
  coverImage: string | null       // Blob URL or template ID
  coverImageFile: File | null
}

interface WizardState {
  step: 1 | 2 | 3
  formData: WizardFormData
  isValid: boolean

  // Actions
  setStep: (step: 1 | 2 | 3) => void
  updateFormData: (partial: Partial<WizardFormData>) => void
  reset: () => void
  submit: () => CapsuleCreateResult
}
```

### 3.3 `capsuleStore` (Active Capsule)

```typescript
// src/lib/stores/capsuleStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CapsuleType, ContentType, CapsuleContent, Recipient, DeliveryCondition } from '@/types'

interface Capsule {
  id: string
  type: CapsuleType
  title: string
  description: string
  coverImageUrl: string | null
  status: 'active' | 'closed' | 'downloaded'
  createdAt: Date
  closedAt: Date | null
  closingMessage: string | null
}

interface CapsuleContent {
  id: string
  capsuleId: string
  type: ContentType
  title: string | null
  description: string | null
  tags: string[]
  blobUrl: string               // In-memory blob URL (POC only)
  thumbnailUrl: string | null
  contentDate: Date
  fileSizeBytes: number
  mimeType: string
  sortOrder: number
  metadata: Record<string, unknown>
  createdAt: Date
}

interface Recipient {
  id: string
  capsuleId: string
  name: string
  email: string
  phone: string | null
  relationship: string
  canView: boolean
  canDownload: boolean
  deliveryCondition: DeliveryCondition
  deliveryDate: Date | null
  createdAt: Date
}

interface CapsuleState {
  // Data
  capsules: Capsule[]
  currentCapsuleId: string | null
  contents: CapsuleContent[]         // Contents for current capsule
  recipients: Recipient[]            // Recipients for current capsule
  contentSortOrder: string[]         // Content IDs in display order

  // Computed (selector pattern)
  currentCapsule: () => Capsule | null
  currentContents: () => CapsuleContent[]
  currentRecipients: () => Recipient[]
  contentsByDate: () => Map<string, CapsuleContent[]>    // grouped by YYYY-MM-DD
  contentDates: () => Date[]

  // Capsule CRUD
  createCapsule: (data: CreateCapsuleInput) => string    // returns new ID
  updateCapsule: (id: string, updates: Partial<Capsule>) => void
  deleteCapsule: (id: string) => void
  closeCapsule: (id: string, closingMessage?: string) => void
  setCurrentCapsule: (id: string | null) => void

  // Content CRUD
  addContent: (content: AddContentInput) => string       // returns new ID
  updateContent: (id: string, updates: Partial<CapsuleContent>) => void
  deleteContent: (id: string) => void
  reorderContent: (contentIds: string[]) => void

  // Recipient CRUD
  addRecipient: (recipient: AddRecipientInput) => string
  updateRecipient: (id: string, updates: Partial<Recipient>) => void
  removeRecipient: (id: string) => void
}
```

### 3.4 `uiStore` (UI State)

```typescript
// src/lib/stores/uiStore.ts
import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

interface UIState {
  // Bottom sheets
  isContentPickerOpen: boolean
  isRecipientFormOpen: boolean

  // Modals
  activeContentDetailId: string | null
  isConfirmDialogOpen: boolean
  confirmDialogConfig: ConfirmDialogConfig | null

  // Toasts
  toasts: Toast[]

  // Edit modes
  isReorderMode: boolean
  selectedContentIds: string[]

  // Actions
  openContentPicker: () => void
  closeContentPicker: () => void
  openContentDetail: (id: string) => void
  closeContentDetail: () => void
  showToast: (message: string, type?: Toast['type']) => void
  dismissToast: (id: string) => void
  toggleReorderMode: () => void
  toggleContentSelection: (id: string) => void
  clearSelection: () => void
}
```

### 3.5 Data Flow Diagram

```
P4 CapsuleSelection
        │
        │ router.push(`/capsule/create/${type}`)
        ▼
WizardStore ──(submit)──> CapsuleStore.createCapsule()
                                │
                                │ returns capsuleId
                                ▼
                        router.push(`/capsule/${id}`)
                                │
                    ┌───────────┼───────────────┐
                    │           │               │
                    ▼           ▼               ▼
              ContentCRUD   RecipientCRUD   Settings
              (addContent)  (addRecipient)  (updateCapsule)
                    │           │               │
                    └───────────┼───────────────┘
                                │
                                ▼
                          CapsuleStore
                       (single source of truth)
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
               Timeline    Preview     Closure
               (reads)     (reads)     (closeCapsule)
```

---

## 4. Data Contracts

### 4.1 New TypeScript Types

Add to `src/types/index.ts`:

```typescript
// --- Capsule Creation Flow Types ---

export type CapsuleStatus = 'active' | 'closed' | 'downloaded'

export type ContentType = 'photo' | 'video' | 'audio' | 'note' | 'drawing'

export type DeliveryCondition = 'on_death' | 'specific_date' | 'anniversary' | 'manual'

export type RelationshipType =
  | 'hijo'
  | 'hija'
  | 'pareja'
  | 'amigo'
  | 'amiga'
  | 'hermano'
  | 'hermana'
  | 'padre'
  | 'madre'
  | 'otro'

export interface Capsule {
  id: string
  type: CapsuleType
  title: string
  description: string
  coverImageUrl: string | null
  status: CapsuleStatus
  createdAt: Date
  updatedAt: Date
  closedAt: Date | null
  closingMessage: string | null
  metadata: Record<string, unknown>
}

export interface CapsuleContent {
  id: string
  capsuleId: string
  type: ContentType
  title: string | null
  description: string | null
  tags: string[]
  blobUrl: string
  thumbnailUrl: string | null
  contentDate: Date
  fileSizeBytes: number
  mimeType: string
  sortOrder: number
  metadata: ContentMetadata
  createdAt: Date
  updatedAt: Date
}

export interface ContentMetadata {
  originalName?: string
  width?: number
  height?: number
  durationSeconds?: number
  location?: string
  childAgeAtCreation?: string     // Origin/drawing only
  titleByChild?: string           // Origin/drawing only
  medium?: string                 // Origin/drawing only
}

export interface Recipient {
  id: string
  capsuleId: string
  name: string
  email: string
  phone: string | null
  relationship: RelationshipType
  canView: boolean
  canDownload: boolean
  deliveryCondition: DeliveryCondition
  deliveryDate: Date | null       // For specific_date and anniversary
  notifyOnClosure: boolean
  createdAt: Date
}

// --- Form Input Types ---

export interface CreateCapsuleInput {
  type: CapsuleType
  title: string
  description: string
  coverImageUrl: string | null
}

export interface AddContentInput {
  capsuleId: string
  type: ContentType
  file?: File
  blobUrl: string
  title?: string
  description?: string
  contentDate: Date
  metadata?: Partial<ContentMetadata>
}

export interface AddRecipientInput {
  capsuleId: string
  name: string
  email: string
  phone?: string
  relationship: RelationshipType
  deliveryCondition: DeliveryCondition
  deliveryDate?: Date
}

// --- Wizard Types ---

export type WizardStep = 1 | 2 | 3

export interface CapsuleCreateFormData {
  capsuleType: CapsuleType
  title: string
  description: string
  coverImage: string | null
  coverImageFile: File | null
}

// --- Closure Types ---

export type ClosureStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface ClosureState {
  step: ClosureStep
  closingMessage: string
  typedConfirmation: string
  archiveProgress: number         // 0-100
  isArchiveReady: boolean
  downloadUrl: string | null
}
```

### 4.2 Supabase Tables (Target Schema, Not Implemented in POC)

The following tables from `docs/DATABASE_SCHEMA.md` map to the above types:

| TypeScript Interface | Supabase Table | Notes |
|---------------------|----------------|-------|
| `Capsule` | `capsules` | `type` uses underscore (`life_chapter`) in DB, hyphen (`life-chapter`) in POC types -- reconcile at integration |
| `CapsuleContent` | `contents` | `blobUrl` → `storage_path`; `tags` not in DB (add JSONB column or use metadata) |
| `Recipient` | `recipients` | `deliveryCondition` not in DB schema -- add to metadata JSONB or new column |

### 4.3 API Routes (POC: Mock Endpoints)

For POC, no real API routes needed. If API simulation is desired for realism:

```
src/app/api/
  capsules/
    route.ts                    # GET (list), POST (create)
    [id]/
      route.ts                  # GET, PATCH, DELETE
      contents/
        route.ts                # GET (list), POST (upload)
      recipients/
        route.ts                # GET, POST
      close/
        route.ts                # POST (initiate closure)
      archive/
        route.ts                # GET (download)
```

All would return mock data from the Zustand store. **Recommendation for POC:** Skip API routes entirely; components read/write directly from Zustand stores.

### 4.4 Zod Validation Schemas

```typescript
// src/lib/validation.ts
import { z } from 'zod'

export const capsuleCreateSchema = z.object({
  title: z.string().min(1, 'El nombre es obligatorio').max(100, 'Maximo 100 caracteres'),
  description: z.string().max(500, 'Maximo 500 caracteres').optional().default(''),
  coverImage: z.string().nullable().optional(),
})

export const contentMetadataSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  contentDate: z.date(),
  tags: z.array(z.string().max(30)).max(10).optional(),
})

export const recipientSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  email: z.string().email('Email no valido'),
  phone: z.string().max(20).optional(),
  relationship: z.enum(['hijo', 'hija', 'pareja', 'amigo', 'amiga', 'hermano', 'hermana', 'padre', 'madre', 'otro']),
  deliveryCondition: z.enum(['on_death', 'specific_date', 'anniversary', 'manual']),
  deliveryDate: z.date().optional(),
})

export const noteContentSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1, 'Escribe algo').max(10000, 'Maximo 10.000 caracteres'),
  contentDate: z.date(),
})
```

---

## 5. Edge Cases

### 5.1 Content Upload

| # | Edge Case | Handling |
|---|-----------|----------|
| EC-01 | File exceeds size limit (20MB photo, 500MB video, 50MB audio) | Show toast: "El archivo es demasiado grande (max {limit}MB)". Reject file. |
| EC-02 | Unsupported MIME type | Show toast: "Formato no soportado. Usa {formats}". Reject file. |
| EC-03 | User selects >10 photos in batch | Show toast: "Maximo 10 fotos a la vez". Only keep first 10. |
| EC-04 | Camera permission denied | Show toast: "Permiso de camara denegado". Fallback to file picker only. |
| EC-05 | Microphone permission denied | Show toast: "Permiso de microfono denegado". Offer file upload instead. |
| EC-06 | Audio recording exceeds 5 min | Auto-stop recording. Show review screen. |
| EC-07 | User navigates away during upload | POC: blob URLs lost. Show warning via `beforeunload`. |
| EC-08 | Drag-and-drop on mobile | Not supported natively. Only show drag zone on desktop (`hover:` media query). |
| EC-09 | HEIC image format | Accept and display via browser native support (Safari). On Chrome, show warning if no support. |
| EC-10 | Very long video (>10 min) | Reject with message: "La duracion maxima del video es 10 minutos". |

### 5.2 Capsule Operations

| # | Edge Case | Handling |
|---|-----------|----------|
| EC-11 | Close capsule with 0 content | Block closure. Show: "Anade al menos un recuerdo antes de cerrar". |
| EC-12 | Close capsule with 0 recipients (Legacy type) | Show warning but allow: "No has anadido destinatarios. La capsula se cerrara sin entregar a nadie." |
| EC-13 | Typed confirmation mismatch ("CERRAR") | Keep confirm button disabled until exact match. Case-insensitive. |
| EC-14 | User tries to edit closed capsule | All edit controls hidden. Show lock icon + "Esta capsula esta sellada". |
| EC-15 | User re-enters create wizard with existing capsule of same type (free plan) | Show: "Ya tienes una capsula {type}. Tu plan solo permite 1." |
| EC-16 | Capsule title is empty | Wizard "Siguiente" button disabled. Inline error on blur. |
| EC-17 | Together capsule closure without partner consent | Show: "Ambos debeis aceptar para cerrar esta capsula". Block unilateral closure. |
| EC-18 | Browser refresh during closure animation | Closure state persisted in Zustand `persist`. Resume from last completed step. |

### 5.3 Recipients

| # | Edge Case | Handling |
|---|-----------|----------|
| EC-19 | Duplicate email for same capsule | Show: "Este email ya esta anadido". Reject. |
| EC-20 | Owner adds own email as recipient | Show: "No puedes ser tu propio destinatario". Reject. |
| EC-21 | Invalid email format | Zod validation error inline. |
| EC-22 | Delivery date in the past | DatePicker `min` set to tomorrow. If somehow submitted, reject with error. |
| EC-23 | Remove last recipient from Legacy capsule | Allow but show warning: "Sin destinatarios, nadie recibira esta capsula." |

### 5.4 UI/UX

| # | Edge Case | Handling |
|---|-----------|----------|
| EC-24 | Content reorder on touch device | Touch-and-hold (300ms) enters reorder mode. Drag handle visible. |
| EC-25 | prefers-reduced-motion | All Framer Motion animations resolve instantly. Closure "animation" becomes fade transition. |
| EC-26 | Keyboard-only navigation | All interactive elements reachable via Tab. Custom focus rings. Enter/Space to activate. |
| EC-27 | Screen reader announces capsule closure | aria-live="assertive" for step changes. Descriptive alt text for sealed capsule state. |
| EC-28 | Viewport < 320px | Minimum width: 320px. Below that, horizontal scroll tolerated. |
| EC-29 | Landscape orientation on mobile | Content reflows to 2-column grid. No layout breaks. |

---

## 6. Milestones and Estimates

### Assumptions for estimates
- 1 senior frontend developer working 6h/day
- Familiarity with Next.js App Router, Tailwind, Framer Motion
- Existing design system tokens (colors, fonts, spacing) already configured
- No backend integration required (POC)

| Milestone | Scope | Duration | Cumulative |
|-----------|-------|----------|------------|
| **M1: Foundation** | Types, stores, validation schemas, UI primitives (BottomSheet, FAB, ConfirmDialog, ProgressRing, DatePicker, TagInput) | 5 days | Week 1 |
| **M2: Creation Wizard** | `/capsule/create/[type]` route, WizardStepIndicator, CoverPhotoUploader, CapsuleTemplateGrid, P4 "Crear" CTA wiring | 4 days | Week 2 |
| **M3: Content Editor** | `/capsule/[id]` route, FAB + ContentTypePicker, PhotoUploader, VideoUploader, AudioRecorder + WaveformVisualizer, NoteEditor, CalendarStrip, MediaCard | 8 days | Week 3-4 |
| **M4: Organization** | ContentGridView (drag reorder), ContentDetailModal (view/edit/delete), tag management, batch operations | 4 days | Week 4 |
| **M5: Preview** | `/capsule/[id]/preview` route, preview banner, reused P2 animation with real content photos, scroll timeline | 3 days | Week 5 |
| **M6: Closure Ritual** | `/capsule/[id]/close` route, 7-step flow, CapsuleClosureAnimation (reverse P2), archive progress simulation, download mock | 5 days | Week 5-6 |
| **M7: Contacts + Settings** | `/capsule/[id]/settings` route, RecipientForm, RecipientCard, DeliveryConditionPicker, privacy toggles, metadata editing | 4 days | Week 6-7 |
| **M8: Polish + QA** | Accessibility audit, keyboard navigation, reduced-motion, responsive breakpoints, error states, empty states, loading skeletons, CLS/LCP optimization | 5 days | Week 7-8 |

**Total: 38 working days (~8 weeks at 5 days/week)**

### Gantt (Simplified)

```
Week 1  ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  M1: Foundation
Week 2  ░░░░░░░░░░░░░░░░████████████████████░░░░░░░░░░░░░░░░  M2: Wizard
Week 3  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█████████████████  M3: Content Editor
Week 4  █████████████████████████████████████░░░░░░░░░░░░░░░░  M3+M4: Editor+Org
Week 5  ░░░░░░░░░░░░████████████████████████████████████░░░░░  M5+M6: Preview+Close
Week 6  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████████████  M6+M7: Close+Settings
Week 7  ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░  M7+M8: Settings+QA
Week 8  ░░░░░░░░░░░░░░░░████████████████████████████████████░  M8: Polish+QA
```

---

## 7. Verification Plan

### M1: Foundation

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Types compile | `npx tsc --noEmit` | Zero errors |
| Zustand stores initialize | Unit test: create store, verify initial state | All default values correct |
| Zustand actions work | Unit test: call each action, verify state mutation | State updates as expected |
| Zod schemas validate | Unit test: valid input passes, invalid input returns errors | All edge cases covered |
| BottomSheet renders | Manual: open, drag, close | Smooth spring animation, backdrop click closes |
| BottomSheet accessibility | Keyboard: Tab navigates inside, Escape closes | Focus trapped, aria attributes present |
| FAB renders | Manual: click triggers handler | Visible at bottom-right, touch target >= 44px |
| ConfirmDialog typed confirmation | Manual: type "CERRAR" | Button enables only on exact match |
| ProgressRing | Manual: pass 0, 50, 100 | SVG arc renders correctly |
| DatePicker | Manual: select date | Value updates, min/max enforced |
| All primitives on 390px | Chrome DevTools mobile | No overflow, no truncation, readable text |

### M2: Creation Wizard

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Route `/capsule/create/legacy` loads | Navigate from P4 | Page renders without error |
| Step 1 validation | Leave title empty, click Next | "Siguiente" disabled, inline error on blur |
| Step 2 cover upload | Drag image file onto zone | Preview displays, blob URL in store |
| Step 2 template selection | Click template | Selected state visible, value in store |
| Step 3 review | Complete steps 1-2 | All entered data displayed correctly |
| Submit creates capsule | Click "Crear capsula" | `capsuleStore.capsules` has new entry, redirects to `/capsule/{id}` |
| Back navigation | Click back at step 2 | Returns to step 1 with data preserved |
| All 6 capsule types | Repeat for each type | Page title and icon match type |
| Mobile 390px | Chrome DevTools | Inputs full-width, buttons reachable, no horizontal scroll |

### M3: Content Editor

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| FAB opens content picker | Tap FAB | BottomSheet slides up with 4-5 content type icons |
| Photo upload: single | Select 1 photo | Preview shown, date picker visible, save stores content |
| Photo upload: batch 10 | Select 10 photos | Carousel navigation works, all 10 saveable |
| Photo upload: reject >20MB | Select 25MB image | Toast error, file rejected |
| Video upload | Select .mp4 file | Video preview plays, metadata form shown |
| Audio recording | Grant mic, record 5s, stop | Waveform animates during recording, playback works |
| Audio max duration | Record and wait 5 min | Auto-stops at 300s |
| Note creation | Type title + 100 chars | Character count visible, saves correctly |
| CalendarStrip | Add content on 3 different dates | Dots appear on correct dates, tap scrolls to date |
| MediaCard variants | Add one of each type | Photo=polaroid, video=play icon, audio=waveform, note=text |
| Content appears in timeline | Add 3 items | All 3 visible in grid, sorted by date |
| Camera permission denied | Block in browser settings | Graceful fallback message, file picker still works |
| Content count persists | Add items, navigate away, return | All items still in store |

### M4: Organization

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Enter reorder mode | Long-press on item OR tap edit icon | Items show drag handles, visual feedback |
| Drag reorder (mouse) | Drag item A above item B | Order persists in store after drop |
| Drag reorder (touch) | Same on mobile simulator | Works with touch events |
| Exit reorder mode | Tap "Listo" button | Handles disappear, new order saved |
| ContentDetailModal opens | Tap MediaCard | Full-screen modal with content and metadata |
| Edit content metadata | In modal, tap edit, change title | Save updates store, reflected in grid |
| Delete content | In modal, tap delete | ConfirmDialog appears, confirm removes from store |
| Add tags | In detail modal, add 3 tags | Tags display as pills, saved to content |
| Tag limit (10) | Try adding 11th tag | Input disabled or rejected with message |

### M5: Preview

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Preview route loads | Navigate to `/capsule/{id}/preview` | Page renders with banner text |
| Opening animation plays | Page load | Polaroids with actual content photos emerge from center |
| Scroll to timeline | Scroll down after animation | Content visible in read-only grid |
| No edit controls | Check UI | No FAB, no edit buttons, no delete buttons |
| "Volver al editor" button | Tap | Returns to `/capsule/{id}` |
| Reduced motion | Set `prefers-reduced-motion: reduce` | No animation, instant content display |

### M6: Closure Ritual

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Closure entry from settings | Tap "Cerrar capsula" in settings | Step 1: explanation screen |
| Step 1 explanation | Read | Correct bullet points about what happens |
| Step 2 closing message | Type message, skip | Both paths work, message saved if entered |
| Step 3 type "CERRAR" | Type incorrect, then correct | Button enables only on "CERRAR" (case-insensitive) |
| Step 4 animation plays | Confirm | Polaroids gather to center, capsule closes, gold burst |
| Step 4 reduced motion | `prefers-reduced-motion` | Instant fade transition instead |
| Step 5 progress bar | Observe | Simulated progress 0→100% over ~3s |
| Step 6 download | Click download button | Mock download triggered (blob URL) |
| Step 7 post-download | Confirm safe storage | Capsule status → 'downloaded', redirect to sealed view |
| Sealed capsule view | Navigate to `/capsule/{id}` after closure | Lock icon, "Sellada" badge, no edit controls |
| Block closure with 0 content | Try closing empty capsule | Error: "Anade al menos un recuerdo" |
| Browser refresh during step 4 | Refresh | Resumes from step 4 (or restarts step 4) |

### M7: Contacts + Settings

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Settings page loads | Navigate to `/capsule/{id}/settings` | Sections render: info, recipients, delivery, privacy |
| Edit capsule title | Change title, save | Store updated, reflected in header |
| Add recipient | Fill form, save | Recipient appears in list |
| Recipient validation | Submit empty name, invalid email | Inline Zod errors |
| Duplicate email | Add same email twice | Toast: "Este email ya esta anadido" |
| Delivery condition: specific date | Select, pick date in future | Saved correctly |
| Delivery condition: past date | Try selecting yesterday | DatePicker blocks it |
| Remove recipient | Tap remove, confirm | Removed from store and list |
| Privacy toggle | Toggle "Solo yo puedo ver" | State saved |

### M8: Polish + QA

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Keyboard navigation (full flow) | Tab through entire creation→edit→close flow | All interactive elements reachable, focus visible |
| Screen reader | VoiceOver/NVDA on key flows | All content announced, landmarks defined |
| Color contrast | axe-core or Lighthouse | All text meets WCAG AA (4.5:1 normal, 3:1 large) |
| LCP < 2.5s | Lighthouse mobile on creation page | Pass |
| CLS < 0.1 | Lighthouse mobile on content editor | Pass |
| FID < 100ms | Lighthouse mobile on any interactive page | Pass |
| 390px viewport | All pages | No horizontal scroll, no overlapping elements |
| 1440px viewport | All pages | Content centered, max-width applied, no stretching |
| Empty states | View capsule with 0 content, 0 recipients | Illustration + CTA for each |
| Loading skeletons | Simulate slow load (React Suspense) | Skeleton shapes for MediaCards, recipient list |
| Error states | Trigger validation errors | Inline errors below fields, toast for system errors |
| Toast notifications | Add content, delete content, add recipient | Correct messages appear and auto-dismiss |
| Image optimization | Check network tab for images | All served via next/image with proper `sizes` |
| Lazy loading | Scroll capsule with 50+ items | Below-fold items load as they enter viewport |
| `prefers-reduced-motion` all pages | Set OS preference | All animations skip or use instant transitions |

---

## 8. Rollout and Rollback

### 8.1 Rollout Strategy

Since this is a POC (not production), rollout is a dev-local merge strategy:

| Phase | Action | Gate |
|-------|--------|------|
| **Dev** | All work on `feature/capsule-creation-flow` branch | Each milestone passes its verification checklist |
| **Review** | Andrea (CEO) demo on localhost:3001 | Visual approval of key flows: wizard, editor, closure animation |
| **Merge** | Merge to `main` in `POC_INTERNA/app/` | All M1-M8 verifications pass |
| **Demo-ready** | Tag as `v0.2.0-capsule-flow` | Complete happy path works end-to-end |

### 8.2 Rollback Plan

| Scenario | Action |
|----------|--------|
| Merge breaks existing onboarding (P1-P4) | `git revert` merge commit; onboarding routes are isolated from `/capsule/` routes, so this should not happen |
| Zustand store conflicts | `wizardStore` and `capsuleStore` are new files with no overlap to existing `useState` state; rollback = delete store files + route group |
| Performance regression | Lazy-load all `/capsule/` route components via `next/dynamic`; if LCP degrades, split out heavy components (AudioRecorder, WaveformVisualizer) into dynamic imports |
| Animation jank on low-end devices | CapsuleClosureAnimation has `prefers-reduced-motion` fallback; additionally can disable particle effects via feature flag in `uiStore` |

### 8.3 Feature Flags (Optional)

For progressive rollout within the POC:

```typescript
// src/lib/featureFlags.ts
export const FLAGS = {
  ENABLE_AUDIO_RECORDER: true,     // Requires MediaRecorder API
  ENABLE_VIDEO_UPLOAD: true,
  ENABLE_CLOSURE_ANIMATION: true,  // False = simple fade
  ENABLE_DRAG_REORDER: true,       // False = manual sort buttons
  MAX_BATCH_PHOTOS: 10,
  MAX_AUDIO_SECONDS: 300,
  MAX_VIDEO_MB: 500,
  MAX_PHOTO_MB: 20,
} as const
```

### 8.4 Post-Implementation Path

After POC validation:

| Step | Action | Owner |
|------|--------|-------|
| 1 | Replace Zustand `persist` (localStorage) with Supabase client calls | CTO |
| 2 | Replace `blobUrl` with Supabase Storage signed URLs | CTO |
| 3 | Add real file upload with progress tracking via Supabase Storage `.upload()` | CTO |
| 4 | Implement API routes for capsule CRUD (or use Supabase client directly) | CTO |
| 5 | Add auth gate before capsule creation (Supabase Auth) | CTO |
| 6 | Archive generation via Supabase Edge Function (JSZip) | CTO |
| 7 | Migrate to production app (`PREREUNION_ANDREA/`) or unify codebases | CTO + CEO |

---

## Appendix A: File Creation Checklist

New files to create (in order):

```
# M1: Foundation
src/types/index.ts                              # MODIFY (add new types)
src/lib/stores/capsuleStore.ts                  # NEW
src/lib/stores/wizardStore.ts                   # NEW
src/lib/stores/uiStore.ts                       # NEW
src/lib/validation.ts                           # NEW
src/lib/copy.ts                                 # NEW (all UI strings)
src/lib/featureFlags.ts                         # NEW
src/lib/utils.ts                                # NEW (generateId, formatDate, formatFileSize)
src/components/ui/BottomSheet.tsx               # NEW
src/components/ui/FAB.tsx                       # NEW
src/components/ui/ConfirmDialog.tsx             # NEW
src/components/ui/ProgressRing.tsx              # NEW
src/components/ui/DatePicker.tsx                # NEW
src/components/ui/TagInput.tsx                  # NEW
src/components/ui/Toast.tsx                     # NEW
src/components/ui/Skeleton.tsx                  # NEW

# M2: Creation Wizard
src/app/capsule/create/[type]/page.tsx          # NEW
src/components/capsule/WizardStepIndicator.tsx  # NEW
src/components/capsule/CoverPhotoUploader.tsx   # NEW
src/components/capsule/CapsuleTemplateGrid.tsx  # NEW
src/app/onboarding/capsule/[type]/page.tsx      # MODIFY (add "Crear" CTA button)

# M3: Content Editor
src/app/capsule/[id]/page.tsx                   # NEW
src/app/capsule/[id]/layout.tsx                 # NEW (shared header/nav)
src/components/capsule/ContentTypePickerSheet.tsx # NEW
src/components/capsule/editors/PhotoUploader.tsx # NEW
src/components/capsule/editors/VideoUploader.tsx # NEW
src/components/capsule/editors/AudioRecorder.tsx # NEW
src/components/capsule/editors/NoteEditor.tsx   # NEW
src/components/capsule/CalendarStrip.tsx         # NEW
src/components/capsule/WaveformVisualizer.tsx    # NEW

# M4: Organization
src/components/capsule/ContentGridView.tsx       # NEW
src/components/capsule/ContentDetailModal.tsx    # NEW

# M5: Preview
src/app/capsule/[id]/preview/page.tsx           # NEW
src/components/capsule/CapsulePreviewBanner.tsx # NEW

# M6: Closure Ritual
src/app/capsule/[id]/close/page.tsx             # NEW
src/components/capsule/CapsuleClosureAnimation.tsx # NEW
src/components/capsule/ClosureExplanation.tsx    # NEW
src/components/capsule/ClosingMessageForm.tsx    # NEW
src/components/capsule/ArchiveProgress.tsx       # NEW
src/components/capsule/DownloadPrompt.tsx        # NEW
src/components/capsule/PostDownloadConfirm.tsx   # NEW
src/components/capsule/SealedCapsuleView.tsx     # NEW

# M7: Contacts + Settings
src/app/capsule/[id]/settings/page.tsx          # NEW
src/components/capsule/RecipientForm.tsx         # NEW
src/components/capsule/RecipientCard.tsx         # NEW
src/components/capsule/DeliveryConditionPicker.tsx # NEW

# M8: Polish
src/components/ui/EmptyState.tsx                # NEW
# + modifications across all existing components for a11y, loading, errors
```

**Total new files: ~45**
**Total modified files: ~3**

---

## Appendix B: NPM Dependencies

No new dependencies required. All functionality built with existing stack:

| Package | Already Installed | Used For |
|---------|-------------------|----------|
| `next` 15.1+ | Yes | App Router, Image, dynamic imports |
| `react` 19 | Yes | Components, hooks |
| `framer-motion` 11.15 | Yes | All animations, AnimatePresence, drag |
| `lucide-react` 0.469 | Yes | All icons |
| `tailwindcss` 3.4 | Yes | All styling |
| `zod` 3.24 | Yes | Form validation |
| `zustand` | **ADD** | State management |

```bash
cd POC_INTERNA/app && npm install zustand
```

No other additions needed. Audio recording uses native `MediaRecorder` API. Drag-and-drop uses Framer Motion's `drag` prop. File picking uses native `<input type="file">`.

---

## Appendix C: Capsule Type Feature Matrix

Which features are available per capsule type (controls conditional UI):

| Feature | Legacy | Together | Social | Pet | Life Chapter | Origin |
|---------|--------|----------|--------|-----|-------------|--------|
| Photo upload | Y | Y | Y | Y | Y | Y |
| Video upload | Y | Y | Y | Y | Y | Y |
| Audio recording | Y | Y | Y | Y | Y | Y |
| Note editor | Y | Y | Y | Y | Y | Y |
| Drawing capture | N | N | N | N | N | **Y** |
| Recipients | **Y** | N | Optional | Optional | N | **Y** |
| Collaborators | N | **Y** | N | N | N | N |
| Delivery conditions | **Y** | N | N | N | N | **Y** |
| Milestones | N | N | N | N | **Y** | **Y** |
| Future messages | **Y** | N | N | N | N | N |
| Closure: dual consent | N | **Y** | N | N | N | N |
| Closure: standard | Y | N | Y | Y | Y | Y |
| AI Avatar | Phase 3 | N | N | N | Phase 3 | Phase 3 |
| Pet profile fields | N | N | N | **Y** | N | N |
| Child profile fields | N | N | N | N | N | **Y** |

This matrix drives the `ContentTypePickerSheet` (show/hide drawing), `RecipientForm` (show/hide delivery conditions), and `CapsuleSettingsPage` (show/hide sections).

---

*End of document. Implementation begins at M1.*
