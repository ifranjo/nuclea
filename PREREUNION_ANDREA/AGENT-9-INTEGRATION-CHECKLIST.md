> [!WARNING]
> Historical artifact (Jan 2026).
> This document is preserved for delivery traceability and is not the live runtime contract.
> Use `docs/SOURCE_OF_TRUTH.md`, `PREREUNION_ANDREA/CLAUDE.md`, and `docs/TYPESCRIPT_TYPES.md` for current normative behavior.
# Agent 9: Integration & Testing Checklist

## ✅ File Verification

All files created successfully:

| File | Size | Status |
|------|------|--------|
| `delivery-config-step.tsx` | 3.1K | ✅ Created |
| `preview-confirm-step.tsx` | 6.8K | ✅ Created |
| `capsule-preview.tsx` | 3.9K | ✅ Created |
| `capsule/[capsuleId]/page.tsx` | 3.4K | ✅ Created |
| `capsule/[capsuleId]/edit/page.tsx` | 2.3K | ✅ Created |
| `shared/animated-section.tsx` | 668B | ✅ Created |
| `shared/loading-spinner.tsx` | 602B | ✅ Created |
| `shared/error-message.tsx` | 1.2K | ✅ Created |
| `shared/confirmation-dialog.tsx` | 1.7K | ✅ Created |
| `shared/index.ts` | 210B | ✅ Created |

**Total:** 10 files, ~24KB of code

## 🔧 Integration Points to Test

### 1. Wizard Flow Integration

```bash
# Test URL
http://localhost:3000/capsule/life-chapter
```

**Test Steps:**
1. Navigate through wizard to delivery step
2. Verify date picker shows future dates only
3. Enter recipient info
4. Click next to preview step
5. Verify all data displays correctly
6. Check terms checkbox
7. Click "Crear Cápsula"
8. Should redirect to capsule detail page

**Expected Store Updates:**
- `useWizardStore.formData` updated with delivery config
- `useCapsuleStore.capsules` has new capsule
- `useWizardStore.reset()` called after creation

### 2. Capsule Detail Page

```bash
# Test URL (replace {id} with actual capsule ID)
http://localhost:3000/capsule/{id}
```

**Test Steps:**
1. After creating capsule, should auto-redirect here
2. Verify capsule type badge shows correct color
3. Verify title and description display
4. Check delivery date formatted in Spanish
5. Verify recipient info displays
6. Check content count is accurate
7. Test Edit button navigation
8. Test Delete button opens confirmation dialog

**Expected Behavior:**
- All capsule data renders correctly
- Spanish date format: "17 de enero, 2026"
- Status badge shows "Borrador" for new capsules
- Content grid shows placeholder icons

### 3. Capsule Edit Flow

```bash
# Test URL
http://localhost:3000/capsule/{id}/edit
```

**Test Steps:**
1. Click Edit button from capsule detail
2. Verify wizard loads with existing data
3. Change title and description
4. Update delivery date
5. Save changes
6. Should return to capsule detail
7. Verify changes persisted

**Expected Store Updates:**
- `useWizardStore.formData` pre-populated
- `useCapsuleStore.updateCapsule()` called on save
- Updated capsule reflects changes

### 4. Capsule Delete Flow

**Test Steps:**
1. From capsule detail, click Delete button
2. Confirmation dialog should appear
3. Verify warning icon displays
4. Click "Cancelar" → Dialog closes, capsule remains
5. Click Delete again → Click "Eliminar"
6. Should redirect to dashboard
7. Capsule should be removed from list

**Expected Store Updates:**
- `useCapsuleStore.deleteCapsule(id)` called
- `useCapsuleStore.capsules` no longer contains capsule
- Navigation to `/dashboard`

## 🎨 UI Component Tests

### DatePicker (Delivery Config)
- [ ] Opens calendar on click
- [ ] Past dates disabled
- [ ] Selected date highlights
- [ ] Formats date in Spanish
- [ ] Clear button works
- [ ] Validation error shows for invalid dates

### Form Validation (Delivery Config)
- [ ] Empty recipient name → No error (optional)
- [ ] Invalid email → "Email inválido"
- [ ] Future date required → Error on past date
- [ ] Message max length → 1000 character limit
- [ ] Form submits when valid

### Preview Card (Preview Step)
- [ ] Capsule type badge color matches config
- [ ] Title displays correctly
- [ ] Description wraps properly
- [ ] Delivery date formatted: "d 'de' MMMM, yyyy"
- [ ] Recipient name and email display
- [ ] Content stats accurate (images/videos/files)
- [ ] Empty content shows "Sin contenido multimedia"

### Terms Checkbox (Preview Step)
- [ ] Unchecked by default
- [ ] Button disabled when unchecked
- [ ] Button enabled when checked
- [ ] Link to terms opens in new tab

### CapsulePreview Component
- [ ] Status badge shows correct color
- [ ] All info cards display
- [ ] Content grid responsive (3 cols → 4 cols)
- [ ] Placeholder icons show
- [ ] Animation staggers correctly
- [ ] Empty state shows when no content

### Shared Components
- [ ] AnimatedSection fades in on scroll
- [ ] LoadingSpinner rotates
- [ ] ErrorMessage shows with correct color
- [ ] ConfirmationDialog opens/closes
- [ ] All icons render (lucide-react)

## 🔍 TypeScript Validation

Run TypeScript check:
```bash
cd C:\Users\Kaos\scripts\nuclea\app
npm run type-check
```

**Expected:** No TypeScript errors in new files

## 🌐 Spanish Language Validation

All UI text should be in Spanish:

### Wizard Steps
- [x] "Configurar Entrega"
- [x] "Confirmar y Crear"
- [x] "Fecha de Entrega"
- [x] "Nombre del Destinatario"
- [x] "Email del Destinatario"
- [x] "Mensaje de Entrega (Opcional)"
- [x] "Seleccionar fecha..."
- [x] "Crear Cápsula"

### Capsule Pages
- [x] "Volver al Dashboard"
- [x] "Volver a la cápsula"
- [x] "Editar Cápsula"
- [x] "¿Eliminar cápsula?"
- [x] "Cancelar" / "Eliminar"
- [x] "Cargando..."
- [x] "Cápsula no encontrada"

### Status Labels
- [x] "Borrador" (draft)
- [x] "Activa" (active)
- [x] "Programada" (scheduled)
- [x] "Entregada" (delivered)

### Validation Messages
- [x] "Título requerido"
- [x] "Email inválido"
- [x] "Mínimo 2 caracteres"
- [x] "Máximo 1000 caracteres"
- [x] "La fecha debe ser futura"

## 🔗 Store Integration Tests

### useWizardStore
```typescript
// Should update form data
updateFormData({
  deliveryDate: new Date(),
  recipientEmail: 'test@example.com',
  recipientName: 'Test User',
  deliveryMessage: 'Test message'
})
// formData should contain all fields
```

### useCapsuleStore
```typescript
// Should add capsule
addCapsule({
  id: '123',
  userId: 'user-1',
  type: 'life-chapter',
  title: 'Test',
  description: 'Test desc',
  status: 'draft',
  contentIds: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
// capsules array should have new item

// Should delete capsule
deleteCapsule('123')
// capsules array should be empty
```

### useUploadStore
```typescript
// Should track uploaded files
files.length // Number of uploaded items
files.filter(f => f.file.type.startsWith('image/')).length // Image count
```

## 🎯 Accessibility Checks

- [ ] All form inputs have labels
- [ ] Error messages linked to inputs (aria-describedby)
- [ ] Buttons have descriptive text
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Dialog traps focus
- [ ] Screen reader friendly

## 📱 Responsive Design Tests

### Mobile (< 768px)
- [ ] Content grid: 3 columns
- [ ] Form inputs: Full width
- [ ] Buttons: Full width
- [ ] Text readable without zoom

### Tablet (768px - 1024px)
- [ ] Content grid: 3-4 columns
- [ ] Two-column info layout

### Desktop (> 1024px)
- [ ] Content grid: 4 columns
- [ ] Two-column info layout
- [ ] Max width containers centered

## 🚀 Performance Checks

- [ ] Components lazy load when possible
- [ ] Animations smooth (60fps)
- [ ] No console errors
- [ ] No console warnings
- [ ] Network requests optimized

## ✅ Final Acceptance Criteria

Before marking complete, verify:

1. **Functionality**
   - [ ] All wizard steps navigate correctly
   - [ ] Capsule creation works
   - [ ] Capsule viewing works
   - [ ] Capsule editing works
   - [ ] Capsule deletion works

2. **Data Integrity**
   - [ ] Form data persists across steps
   - [ ] Created capsules have correct data
   - [ ] Edited capsules save changes
   - [ ] Deleted capsules removed from store

3. **User Experience**
   - [ ] All text in Spanish
   - [ ] Validation messages clear
   - [ ] Loading states show
   - [ ] Error states handled gracefully
   - [ ] Success states confirm actions

4. **Code Quality**
   - [ ] No TypeScript errors
   - [ ] No ESLint warnings
   - [ ] Consistent code style
   - [ ] Proper component composition
   - [ ] Type-safe props

5. **Integration**
   - [ ] Uses existing stores correctly
   - [ ] Uses existing UI components
   - [ ] Follows existing patterns
   - [ ] Matches design system

---

## 📝 Test Report Template

```markdown
# Test Results - Agent 9 Components

**Tester:** [Name]
**Date:** [Date]
**Environment:** Development

## Wizard Flow
- [ ] PASS: Delivery config step renders
- [ ] PASS: Form validation works
- [ ] PASS: Preview step shows data
- [ ] PASS: Capsule creation successful

## Capsule Viewing
- [ ] PASS: Detail page renders
- [ ] PASS: All data displays correctly
- [ ] PASS: Edit navigation works
- [ ] PASS: Delete confirmation works

## Edge Cases
- [ ] PASS: No recipient info (optional fields)
- [ ] PASS: No content uploaded
- [ ] PASS: Very long descriptions
- [ ] PASS: Special characters in names

## Issues Found
[List any bugs or issues]

## Notes
[Additional observations]
```

---

**Ready for Testing** ✅

All components have been created and are ready for integration testing. Follow this checklist to verify functionality before deploying to production.

