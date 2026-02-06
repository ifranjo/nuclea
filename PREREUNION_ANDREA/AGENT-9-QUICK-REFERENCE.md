# Agent 9: Quick Reference Guide

## 🎯 Component Usage Examples

### 1. DeliveryConfigStep

Import and use in wizard:

```tsx
import { DeliveryConfigStep } from '@/components/wizard/steps'

// In your wizard container
<DeliveryConfigStep onNext={() => console.log('Next step')} />
```

**Props:**
- `onNext?: () => void` - Called when form is valid and user clicks next

**Store Updates:**
```typescript
// Updates useWizardStore.formData with:
{
  deliveryDate?: Date,
  recipientEmail?: string,
  recipientName?: string,
  deliveryMessage?: string
}
```

---

### 2. PreviewConfirmStep

Import and use in wizard:

```tsx
import { PreviewConfirmStep } from '@/components/wizard/steps'

// In your wizard container
<PreviewConfirmStep onComplete={() => router.push('/dashboard')} />
```

**Props:**
- `onComplete?: () => void` - Called after successful capsule creation

**Store Actions:**
```typescript
// Calls useCapsuleStore.addCapsule() with:
{
  id: string,           // Temporary ID (replaced by Firestore)
  userId: string,       // From useAuthStore.user.id
  type: CapsuleType,    // From useWizardStore.capsuleType
  title: string,        // From formData
  description: string,  // From formData
  status: 'draft',      // Always starts as draft
  deliveryDate?: Date,  // From formData
  recipientEmail?: string,
  recipientName?: string,
  contentIds: string[], // From useUploadStore.files
  createdAt: Date,
  updatedAt: Date
}
```

---

### 3. CapsulePreview

Display capsule details:

```tsx
import { CapsulePreview } from '@/components/capsule'

// In your page
<CapsulePreview capsule={currentCapsule} />
```

**Props:**
- `capsule: Capsule` - Complete capsule object

**Display Sections:**
1. Status badge with semantic color
2. Delivery date (Spanish format)
3. Recipient information
4. Creation timestamp
5. Content grid with animations

---

### 4. Capsule Detail Page

Navigate to: `/capsule/[capsuleId]`

**Features:**
- Loads capsule from store by ID
- Displays full capsule info
- Edit and delete actions
- Back navigation to dashboard

**URL Parameters:**
- `capsuleId`: String ID of the capsule

---

### 5. Capsule Edit Page

Navigate to: `/capsule/[capsuleId]/edit`

**Features:**
- Pre-populates wizard with capsule data
- Reuses wizard steps for editing
- Saves updates to existing capsule

**Store Pre-population:**
```typescript
setCapsuleType(capsule.type)
updateFormData({
  title: capsule.title,
  description: capsule.description,
  deliveryDate: capsule.deliveryDate,
  recipientEmail: capsule.recipientEmail,
  recipientName: capsule.recipientName,
})
```

---

## 🛠️ Shared Components

### AnimatedSection

Scroll-triggered fade-in:

```tsx
import { AnimatedSection } from '@/components/shared'

<AnimatedSection delay={0.2}>
  <div>Your content here</div>
</AnimatedSection>
```

**Props:**
- `children: ReactNode` - Content to animate
- `className?: string` - Additional CSS classes
- `delay?: number` - Animation delay in seconds (default: 0)

---

### LoadingSpinner

Show loading state:

```tsx
import { LoadingSpinner } from '@/components/shared'

<LoadingSpinner size="md" />
```

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Spinner size (default: 'md')
- `className?: string` - Additional CSS classes

---

### ErrorMessage

Display errors or warnings:

```tsx
import { ErrorMessage } from '@/components/shared'

<ErrorMessage
  title="Error al guardar"
  message="No se pudo conectar con el servidor"
  variant="error"
/>
```

**Props:**
- `title?: string` - Error title (optional)
- `message: string` - Error message (required)
- `variant?: 'error' | 'warning'` - Visual style (default: 'error')
- `className?: string` - Additional CSS classes

---

### ConfirmationDialog

Reusable confirmation modal:

```tsx
import { ConfirmationDialog } from '@/components/shared'

const [showDialog, setShowDialog] = useState(false)

<ConfirmationDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  title="¿Eliminar cápsula?"
  description="Esta acción no se puede deshacer."
  confirmText="Eliminar"
  cancelText="Cancelar"
  variant="destructive"
  onConfirm={() => deleteCapsule(id)}
  onCancel={() => console.log('Cancelled')}
/>
```

**Props:**
- `open: boolean` - Dialog visibility
- `onOpenChange: (open: boolean) => void` - Control visibility
- `title: string` - Dialog title
- `description: string` - Dialog description
- `confirmText?: string` - Confirm button text (default: 'Confirmar')
- `cancelText?: string` - Cancel button text (default: 'Cancelar')
- `variant?: 'default' | 'destructive'` - Button style (default: 'default')
- `onConfirm: () => void` - Confirm callback
- `onCancel?: () => void` - Cancel callback (optional)

---

## 📋 Common Patterns

### Pattern 1: Complete Wizard Flow

```tsx
// pages/capsule/life-chapter/page.tsx
import { WizardContainer } from '@/components/wizard'
import {
  BasicInfoStep,
  ContentUploadStep,
  DeliveryConfigStep,
  PreviewConfirmStep
} from '@/components/wizard/steps'

const steps = [
  { id: 'info', title: 'Información', component: BasicInfoStep },
  { id: 'content', title: 'Contenido', component: ContentUploadStep },
  { id: 'delivery', title: 'Entrega', component: DeliveryConfigStep },
  { id: 'preview', title: 'Confirmar', component: PreviewConfirmStep },
]

export default function LifeChapterPage() {
  return <WizardContainer capsuleType="life-chapter" steps={steps} />
}
```

---

### Pattern 2: Capsule CRUD Operations

```tsx
import { useCapsuleStore } from '@/stores'

function MyCapsuleComponent() {
  const { capsules, addCapsule, updateCapsule, deleteCapsule } = useCapsuleStore()

  // Create
  const handleCreate = () => {
    addCapsule({
      id: Date.now().toString(),
      userId: 'user-123',
      type: 'life-chapter',
      title: 'Mi Graduación',
      description: 'Fotos y recuerdos de mi graduación universitaria',
      status: 'draft',
      contentIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  // Update
  const handleUpdate = (id: string) => {
    updateCapsule(id, {
      title: 'Mi Graduación (Actualizado)',
      status: 'active'
    })
  }

  // Delete
  const handleDelete = (id: string) => {
    deleteCapsule(id)
  }

  return (
    <div>
      {capsules.map(capsule => (
        <div key={capsule.id}>
          <h3>{capsule.title}</h3>
          <button onClick={() => handleUpdate(capsule.id)}>Editar</button>
          <button onClick={() => handleDelete(capsule.id)}>Eliminar</button>
        </div>
      ))}
    </div>
  )
}
```

---

### Pattern 3: Form with Validation

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { deliverySchema, type DeliveryInput } from '@/schemas'

function MyDeliveryForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<DeliveryInput>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      recipientEmail: '',
      recipientName: '',
      deliveryMessage: '',
    }
  })

  const onSubmit = (data: DeliveryInput) => {
    console.log('Valid data:', data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('recipientEmail')} />
      {errors.recipientEmail && <span>{errors.recipientEmail.message}</span>}

      <button type="submit">Guardar</button>
    </form>
  )
}
```

---

### Pattern 4: Animated List

```tsx
import { motion } from 'framer-motion'

function AnimatedCapsuleList({ capsules }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {capsules.map((capsule, i) => (
        <motion.div
          key={capsule.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <CapsuleCard capsule={capsule} />
        </motion.div>
      ))}
    </div>
  )
}
```

---

## 🔍 Debugging Tips

### Check Wizard State

```tsx
import { useWizardStore } from '@/stores'

function DebugWizard() {
  const { currentStep, formData, capsuleType } = useWizardStore()

  console.log('Current step:', currentStep)
  console.log('Form data:', formData)
  console.log('Capsule type:', capsuleType)

  return <pre>{JSON.stringify({ currentStep, formData, capsuleType }, null, 2)}</pre>
}
```

---

### Check Capsule Store

```tsx
import { useCapsuleStore } from '@/stores'

function DebugCapsules() {
  const { capsules, currentCapsule, loading, error } = useCapsuleStore()

  console.log('Capsules:', capsules)
  console.log('Current:', currentCapsule)
  console.log('Loading:', loading)
  console.log('Error:', error)

  return <pre>{JSON.stringify({ capsules, currentCapsule, loading, error }, null, 2)}</pre>
}
```

---

### Verify Form Validation

```tsx
import { deliverySchema } from '@/schemas'

// Test validation
const testData = {
  deliveryDate: new Date('2025-01-01'), // Past date - should fail
  recipientEmail: 'invalid-email',      // Invalid - should fail
  recipientName: 'A',                   // Too short - should fail
  deliveryMessage: 'Test'
}

const result = deliverySchema.safeParse(testData)
console.log('Valid?', result.success)
console.log('Errors:', result.error?.errors)
```

---

## 📚 Import Paths

```typescript
// Wizard Steps
import {
  BasicInfoStep,
  ChapterTypeStep,
  ContentUploadStep,
  DeliveryConfigStep,
  PreviewConfirmStep,
  ConsentStep
} from '@/components/wizard/steps'

// Capsule Components
import {
  CapsuleCard,
  CapsuleGrid,
  CapsulePreview,
  CapsuleStatusBadge,
  CapsuleTypeSelector,
  EmptyState
} from '@/components/capsule'

// Shared Components
import {
  AnimatedSection,
  LoadingSpinner,
  ErrorMessage,
  ConfirmationDialog
} from '@/components/shared'

// UI Components
import {
  Button,
  Input,
  Textarea,
  DatePicker,
  Checkbox,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  CardRoot
} from '@/components/ui'

// Stores
import {
  useAuthStore,
  useWizardStore,
  useCapsuleStore,
  useUploadStore,
  useUIStore
} from '@/stores'

// Schemas
import {
  basicInfoSchema,
  deliverySchema,
  chapterTypeSchema,
  capsuleSchema,
  fileUploadSchema,
  type BasicInfoInput,
  type DeliveryInput,
  type ChapterTypeInput,
  type CapsuleInput,
  type FileUploadInput
} from '@/schemas'

// Types
import {
  type Capsule,
  type CapsuleType,
  type CapsuleStatus,
  type CapsuleMetadata
} from '@/types/capsule'

// Config
import {
  capsuleTypes,
  chapterTypes,
  getCapsuleTypeById,
  getChapterTypeById,
  getActiveCapsuleTypes,
  getComingSoonCapsuleTypes
} from '@/config/capsule-types'
```

---

## 🎨 Styling Reference

### Colors (from theme)

```typescript
// Status colors
draft: '#6B7280'      // Gray
active: '#10B981'     // Green
scheduled: '#3B82F6'  // Blue
delivered: '#8B5CF6'  // Purple

// Capsule type colors (from config)
life-chapter: '#e94560'
everlife: '#9b59b6'
social: '#3498db'
pet: '#f39c12'
origin: '#2ecc71'
```

---

### Common Classes

```typescript
// Containers
'max-w-4xl mx-auto'           // Page container
'space-y-6'                   // Vertical spacing
'grid grid-cols-3 gap-4'      // Grid layout

// Cards
'p-6'                         // Card padding
'border-b border-white/10'    // Divider
'rounded-lg'                  // Rounded corners

// Text
'text-2xl font-semibold'      // Heading
'text-foreground/60'          // Muted text
'text-sm'                     // Small text

// Icons
'h-5 w-5'                     // Standard icon
'text-accent'                 // Accent color icon
```

---

## ✅ Checklist for New Features

When adding features to these components:

- [ ] Add Spanish text for all UI strings
- [ ] Include TypeScript types for props
- [ ] Add form validation if user input
- [ ] Include loading and error states
- [ ] Add Framer Motion animations
- [ ] Test with empty/null data
- [ ] Verify responsive layout
- [ ] Check accessibility (labels, ARIA)
- [ ] Update this documentation
- [ ] Add to integration checklist

---

**Quick Reference Complete** 📚

Use this guide when working with Agent 9 components. All patterns follow existing architecture and design system.
