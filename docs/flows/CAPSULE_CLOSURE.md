# Capsule Closure Flow

**Source:** NUCLEA_CIERRE CAPSULA.pdf

## Overview

Capsule closure is a **critical business feature** that enables NUCLEA's cost-efficient model:
1. User closes capsule (story complete)
2. User downloads archive
3. NUCLEA deletes from servers
4. App acts as viewer (like PDF reader)

This reduces storage costs to near-zero for closed capsules.

## Closure Types by Capsule

| Capsule Type | Closure Trigger | Confirmation | Download |
|--------------|-----------------|--------------|----------|
| Legacy | Death/Inactivity | Recipients | Recipients download |
| Together | Mutual consent | Both partners | Both download |
| Social | Owner decides | Owner only | Owner + optional friends |
| Pet | Owner decides | Owner only | Owner + optional family |
| Life Chapter | Owner decides | Owner only | Owner |
| Origin | Owner decides | Owner only | Owner → Gift to child |

## Standard Closure Flow (Owner-Initiated)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. INITIATE CLOSURE                                                        │
│                                                                             │
│     User navigates to capsule settings → "Cerrar cápsula"                  │
│                                                                             │
│     ┌─────────────────────────────┐                                        │
│     │  ⚙️ Configuración           │                                        │
│     │                             │                                        │
│     │  · Editar título            │                                        │
│     │  · Gestionar acceso         │                                        │
│     │  · Exportar datos           │                                        │
│     │  ─────────────────────────  │                                        │
│     │  · Cerrar cápsula    ⚠️     │                                        │
│     │                             │                                        │
│     └─────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. CLOSURE EXPLANATION                                                     │
│     ┌─────────────────────────────┐                                        │
│     │  Cerrar tu cápsula          │                                        │
│     │                             │                                        │
│     │  Al cerrar:                 │                                        │
│     │                             │                                        │
│     │  ✓ Tu historia quedará      │                                        │
│     │    completa y sellada       │                                        │
│     │                             │                                        │
│     │  ✓ Podrás descargar todo    │                                        │
│     │    en un archivo único      │                                        │
│     │                             │                                        │
│     │  ✓ La app actuará como      │                                        │
│     │    visor (sin conexión)     │                                        │
│     │                             │                                        │
│     │  ⚠️ No podrás añadir más    │                                        │
│     │     contenido después       │                                        │
│     │                             │                                        │
│     │  [Entendido, continuar]     │                                        │
│     │  [Cancelar]                 │                                        │
│     └─────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. OPTIONAL: CLOSING MESSAGE                                               │
│     ┌─────────────────────────────┐                                        │
│     │  Mensaje de cierre          │                                        │
│     │  (opcional)                 │                                        │
│     │                             │                                        │
│     │  ┌───────────────────────┐  │                                        │
│     │  │ Escribe unas palabras │  │                                        │
│     │  │ finales para esta     │  │                                        │
│     │  │ cápsula...            │  │                                        │
│     │  │                       │  │                                        │
│     │  └───────────────────────┘  │                                        │
│     │                             │                                        │
│     │  [Omitir]  [Añadir mensaje] │                                        │
│     └─────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. FINAL CONFIRMATION                                                      │
│     ┌─────────────────────────────┐                                        │
│     │  ¿Confirmas el cierre?      │                                        │
│     │                             │                                        │
│     │  Esta acción no se puede    │                                        │
│     │  deshacer. Tu cápsula       │                                        │
│     │  contendrá X fotos,         │                                        │
│     │  Y videos y Z notas.        │                                        │
│     │                             │                                        │
│     │  Escribe "CERRAR" para      │                                        │
│     │  confirmar:                 │                                        │
│     │                             │                                        │
│     │  [__________________]       │                                        │
│     │                             │                                        │
│     │  [Confirmar cierre]         │                                        │
│     └─────────────────────────────┘                                        │
│                                                                             │
│  Type-to-confirm prevents accidental closure                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  5. ARCHIVE GENERATION                                                      │
│     ┌─────────────────────────────┐                                        │
│     │                             │                                        │
│     │  Preparando tu archivo...   │                                        │
│     │                             │                                        │
│     │  ████████████░░░░  75%     │                                        │
│     │                             │                                        │
│     │  Empaquetando recuerdos     │                                        │
│     │                             │                                        │
│     └─────────────────────────────┘                                        │
│                                                                             │
│  Server generates downloadable archive                                      │
│  - All content files                                                        │
│  - Metadata JSON                                                            │
│  - Viewer HTML (optional)                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  6. DOWNLOAD                                                                │
│     ┌─────────────────────────────┐                                        │
│     │  ¡Tu cápsula está lista!    │                                        │
│     │                             │                                        │
│     │  [capsule_icon]             │                                        │
│     │                             │                                        │
│     │  mi_erasmus_2026.nuclea     │                                        │
│     │  2.3 GB                     │                                        │
│     │                             │                                        │
│     │  [⬇️ Descargar ahora]        │                                        │
│     │                             │                                        │
│     │  También enviado a tu email │                                        │
│     └─────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  7. POST-DOWNLOAD CONFIRMATION                                              │
│     ┌─────────────────────────────┐                                        │
│     │  ¿Descarga completada?      │                                        │
│     │                             │                                        │
│     │  Confirma que has guardado  │                                        │
│     │  tu archivo en un lugar     │                                        │
│     │  seguro.                    │                                        │
│     │                             │                                        │
│     │  ⚠️ NUCLEA eliminará los    │                                        │
│     │     datos del servidor      │                                        │
│     │     tras esta confirmación  │                                        │
│     │                             │                                        │
│     │  [Sí, tengo mi archivo]     │                                        │
│     │  [Descargar de nuevo]       │                                        │
│     └─────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  8. SERVER CLEANUP                                                          │
│                                                                             │
│  After user confirms download:                                              │
│  1. Mark capsule status = 'downloaded'                                      │
│  2. Queue storage deletion (async)                                          │
│  3. Keep metadata for 30 days (recovery window)                             │
│  4. Full deletion after 30 days                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  9. VIEWER MODE                                                             │
│     ┌─────────────────────────────┐                                        │
│     │  Cápsula cerrada            │                                        │
│     │                             │                                        │
│     │  [capsule_icon] 🔒          │                                        │
│     │                             │                                        │
│     │  Esta cápsula está cerrada  │                                        │
│     │  y guardada en tu           │                                        │
│     │  dispositivo.               │                                        │
│     │                             │                                        │
│     │  [Abrir visor]              │                                        │
│     │  [Descargar de nuevo]       │                                        │
│     │  (solo 30 días disponible)  │                                        │
│     └─────────────────────────────┘                                        │
│                                                                             │
│  App shows closed capsules with viewer option                               │
│  Download link expires after 30 days                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Together Capsule - Dual Consent Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Partner A initiates closure                                                │
│                                                                             │
│     ┌─────────────────────────────┐                                        │
│     │  Solicitar cierre           │                                        │
│     │                             │                                        │
│     │  Para cerrar una cápsula    │                                        │
│     │  compartida, ambos debéis   │                                        │
│     │  estar de acuerdo.          │                                        │
│     │                             │                                        │
│     │  [Enviar solicitud a María] │                                        │
│     └─────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Partner B receives notification                                            │
│                                                                             │
│     ┌─────────────────────────────┐                                        │
│     │  🔔 Solicitud de cierre     │                                        │
│     │                             │                                        │
│     │  Carlos quiere cerrar       │                                        │
│     │  vuestra cápsula            │                                        │
│     │  "Nuestro primer año"       │                                        │
│     │                             │                                        │
│     │  [Ver cápsula]              │                                        │
│     │  [Aceptar cierre]           │                                        │
│     │  [Rechazar]                 │                                        │
│     └─────────────────────────────┘                                        │
│                                                                             │
│  48-hour window to respond                                                  │
│  If no response, request expires                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Both confirm → Standard closure flow                                       │
│  Each receives their own download link                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Legacy Capsule - Automatic Closure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Inactivity threshold reached (e.g., 12 months)                             │
│                                                                             │
│  System actions:                                                            │
│  1. Send warning emails to user (3x over 30 days)                          │
│  2. Contact trusted person for verification                                 │
│  3. If no response → trigger delivery to recipients                        │
│                                                                             │
│  Recipients receive:                                                        │
│     ┌─────────────────────────────┐                                        │
│     │  Has recibido un legado     │                                        │
│     │                             │                                        │
│     │  [Nombre] te ha dejado      │                                        │
│     │  una cápsula de recuerdos.  │                                        │
│     │                             │                                        │
│     │  [Acceder a la cápsula]     │                                        │
│     └─────────────────────────────┘                                        │
│                                                                             │
│  30-day download window, then server deletion                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Archive Format

### File Structure
```
mi_capsula.nuclea/
├── manifest.json           # Capsule metadata
├── content/
│   ├── photos/
│   │   ├── 2026-01-15_001.jpg
│   │   ├── 2026-01-15_002.jpg
│   │   └── ...
│   ├── videos/
│   │   └── ...
│   ├── audio/
│   │   └── ...
│   └── notes/
│       └── 2026-01-15_nota.md
├── thumbnails/
│   └── ...
├── viewer/
│   ├── index.html          # Offline viewer
│   ├── style.css
│   └── app.js
└── README.txt              # Instructions
```

### manifest.json
```json
{
  "version": "1.0",
  "capsule": {
    "id": "uuid",
    "type": "life_chapter",
    "title": "Mi Erasmus en Berlín",
    "created_at": "2025-09-01T10:00:00Z",
    "closed_at": "2026-06-30T18:00:00Z",
    "owner": {
      "name": "Usuario",
      "email": "user@example.com"
    },
    "metadata": {
      "chapter_type": "erasmus",
      "start_date": "2025-09-01",
      "end_date": "2026-06-30"
    }
  },
  "content": [
    {
      "id": "uuid",
      "type": "photo",
      "path": "content/photos/2026-01-15_001.jpg",
      "thumbnail": "thumbnails/2026-01-15_001_thumb.jpg",
      "date": "2026-01-15",
      "title": "Primer día en Berlín",
      "description": "Llegada al aeropuerto"
    }
  ],
  "closing_message": "Un año inolvidable..."
}
```

## Technical Implementation

### Archive Generation (Edge Function)
```typescript
// Supabase Edge Function: generate-archive
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';

export async function generateArchive(capsuleId: string): Promise<Blob> {
  const supabase = createClient(/* ... */);

  // 1. Fetch capsule and content metadata
  const { data: capsule } = await supabase
    .from('capsules')
    .select('*, contents(*)')
    .eq('id', capsuleId)
    .single();

  // 2. Create ZIP
  const zip = new JSZip();

  // 3. Add manifest
  zip.file('manifest.json', JSON.stringify({
    version: '1.0',
    capsule: {
      id: capsule.id,
      type: capsule.type,
      title: capsule.title,
      // ...
    },
    content: capsule.contents.map(c => ({
      id: c.id,
      type: c.type,
      path: `content/${c.type}s/${c.id}_${c.storage_path.split('/').pop()}`,
      date: c.content_date,
      title: c.title,
      description: c.description
    }))
  }));

  // 4. Download and add each content file
  for (const content of capsule.contents) {
    const { data: fileData } = await supabase.storage
      .from('content')
      .download(content.storage_path);

    const folder = `content/${content.type}s`;
    const filename = `${content.id}_${content.storage_path.split('/').pop()}`;
    zip.file(`${folder}/${filename}`, fileData);
  }

  // 5. Add offline viewer
  zip.file('viewer/index.html', VIEWER_HTML_TEMPLATE);
  zip.file('viewer/style.css', VIEWER_CSS);
  zip.file('viewer/app.js', VIEWER_JS);

  // 6. Generate and return
  return await zip.generateAsync({ type: 'blob' });
}
```

### Cleanup Job (Cron)
```sql
-- Run daily: Clean up confirmed downloads after 30 days
CREATE OR REPLACE FUNCTION cleanup_downloaded_capsules()
RETURNS void AS $$
BEGIN
  -- Delete storage files for capsules downloaded 30+ days ago
  -- (Actual storage deletion via Supabase Storage API)

  -- Mark as fully deleted
  UPDATE capsules
  SET status = 'deleted'
  WHERE status = 'downloaded'
    AND downloaded_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

### Download Verification
```typescript
// Track download completion
async function confirmDownload(capsuleId: string): Promise<void> {
  // 1. Update capsule status
  await supabase
    .from('capsules')
    .update({
      status: 'downloaded',
      downloaded_at: new Date().toISOString()
    })
    .eq('id', capsuleId);

  // 2. Queue storage cleanup (async)
  await supabase.functions.invoke('cleanup-capsule-storage', {
    body: { capsuleId, deleteAfter: '30d' }
  });

  // 3. Send confirmation email
  await sendEmail({
    to: user.email,
    template: 'capsule-downloaded',
    data: { capsuleTitle: capsule.title }
  });
}
```

## Cost Impact

| Scenario | Server Storage | Ongoing Cost |
|----------|----------------|--------------|
| Active capsule (5GB) | 5GB | ~$0.10/month |
| Closed, not downloaded | 5GB (temporary) | ~$0.10/month |
| Downloaded & confirmed | 0GB | $0/month |

**Key insight:** Once users download, NUCLEA's storage cost for that capsule drops to zero. This is the core of the sustainable business model.
