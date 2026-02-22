/**
 * NUCLEA POC_REAL — Seed Script
 *
 * Populates a local Supabase instance with Simpsons-themed test data.
 * Run with: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
// Local demo key — safe to commit (published in Supabase docs)
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const DEFAULT_IMAGES_DIR = fileURLToPath(new URL('../public/images/polaroids', import.meta.url))
const IMAGES_DIR = process.env.SEED_IMAGES_DIR || DEFAULT_IMAGES_DIR

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserSeed {
  email: string
  password: string
  fullName: string
}

interface CapsuleSeed {
  ownerEmail: string
  title: string
  type: 'legacy' | 'together' | 'social' | 'pet' | 'origin'
  description: string
  imageCount: number
  notes: string[]
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const USERS: UserSeed[] = [
  { email: 'homer@nuclea.test', password: 'nuclea123', fullName: 'Homer Simpson' },
  { email: 'marge@nuclea.test', password: 'nuclea123', fullName: 'Marge Simpson' },
  { email: 'bart@nuclea.test', password: 'nuclea123', fullName: 'Bart Simpson' },
  { email: 'lisa@nuclea.test', password: 'nuclea123', fullName: 'Lisa Simpson' },
  { email: 'maggie@nuclea.test', password: 'nuclea123', fullName: 'Maggie Simpson' },
]

const CAPSULES: CapsuleSeed[] = [
  {
    ownerEmail: 'homer@nuclea.test',
    title: 'Momentos en Springfield',
    type: 'legacy',
    description: 'Los mejores momentos vividos en Springfield, para que nunca se olviden.',
    imageCount: 25,
    notes: [
      "D'oh! Otro dia en la planta nuclear",
      'Recuerdo cuando Marge y yo nos conocimos en el instituto. Fue el mejor dia de mi vida.',
      'Springfield siempre sera mi hogar, aunque explote la planta una vez al mes.',
      'La cerveza Duff es mi mejor amiga. Bueno, despues de Marge... y Lenny... y Carl.',
    ],
  },
  {
    ownerEmail: 'homer@nuclea.test',
    title: 'Homer y Marge',
    type: 'together',
    description: 'Nuestra historia de amor, desde el baile del instituto hasta hoy.',
    imageCount: 15,
    notes: [
      'Marge, eres la mujer mas paciente del mundo. Te quiero.',
      'Nuestro primer beso bajo las estrellas de Springfield.',
      'Cada dia contigo es una aventura. Sobre todo cuando cocino.',
    ],
  },
  {
    ownerEmail: 'marge@nuclea.test',
    title: 'La familia Simpson',
    type: 'social',
    description: 'Momentos en familia que quiero guardar para siempre.',
    imageCount: 20,
    notes: [
      'Los ninos crecen tan rapido. Parece que fue ayer cuando Bart rompio su primera ventana.',
      'Otro dia de aventuras familiares. Homer intento arreglar el tejado otra vez.',
      'La familia es lo mas importante. Aunque a veces Homer me vuelva loca.',
    ],
  },
  {
    ownerEmail: 'bart@nuclea.test',
    title: 'Ayudante de Santa',
    type: 'pet',
    description: 'Mi perro, mi compadre, mi mejor amigo de cuatro patas.',
    imageCount: 12,
    notes: [
      'Ay caramba! Ayudante de Santa es el mejor perro del mundo.',
      'Corriendo juntos por Springfield, causando el caos habitual.',
      'Mi perro, mi amigo. Siempre leal, incluso cuando me castigan.',
    ],
  },
  {
    ownerEmail: 'lisa@nuclea.test',
    title: 'Recuerdos de Lisa',
    type: 'origin',
    description: 'Mis primeros recuerdos, mis pasiones, y todo lo que me hace ser quien soy.',
    imageCount: 20,
    notes: [
      'Hoy aprendi algo nuevo sobre el jazz. Coltrane sigue siendo mi favorito.',
      'Mis primeros recuerdos de Springfield. La biblioteca fue mi segundo hogar.',
      'La musica siempre ha sido mi refugio. Mi saxofon entiende lo que siento.',
      'Papa intento cocinar otra vez... llamamos a los bomberos. Otra vez.',
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shareToken(): string {
  return randomUUID().slice(0, 8)
}

/** Spread dates between Jan 1 and Feb 15, 2026 */
function spreadDate(index: number, total: number): string {
  const start = new Date('2026-01-01T00:00:00Z').getTime()
  const end = new Date('2026-02-15T23:59:59Z').getTime()
  const step = (end - start) / Math.max(total - 1, 1)
  return new Date(start + step * index).toISOString()
}

function mimeFromExt(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  }
  return map[ext] ?? 'application/octet-stream'
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  console.log('🌱 Starting NUCLEA seed...\n')

  // -----------------------------------------------------------------------
  // Step 0 — Verify images directory
  // -----------------------------------------------------------------------
  let allImages: string[] = []
  if (!fs.existsSync(IMAGES_DIR)) {
    console.warn(`⚠️  Images directory not found: ${IMAGES_DIR}`)
    console.warn('   Continuing seed without photo uploads (notes and metadata only).')
  } else {
    allImages = fs
      .readdirSync(IMAGES_DIR)
      .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      .sort()
  }

  console.log(`📂 Found ${allImages.length} images in ${IMAGES_DIR}`)

  // -----------------------------------------------------------------------
  // Step 1 — Clean existing data (order matters for FK constraints)
  // -----------------------------------------------------------------------
  console.log('\n🧹 Cleaning existing data...')
  try {
    // Delete in dependency order
    await supabase.from('contents').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('designated_persons').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('collaborators').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('capsules').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('  ✓ Tables cleaned')
  } catch (err) {
    console.error('  ⚠️  Error cleaning tables (may be empty):', err)
  }

  // Clean storage bucket
  try {
    const { data: folders } = await supabase.storage.from('capsule-contents').list('', { limit: 1000 })
    if (folders && folders.length > 0) {
      for (const folder of folders) {
        const { data: files } = await supabase.storage
          .from('capsule-contents')
          .list(folder.name, { limit: 1000 })
        if (files && files.length > 0) {
          const paths = files.map((f) => `${folder.name}/${f.name}`)
          await supabase.storage.from('capsule-contents').remove(paths)
        }
      }
      // Also try removing top-level files
      const topLevelFiles = folders.filter((f) => f.id !== null).map((f) => f.name)
      if (topLevelFiles.length > 0) {
        await supabase.storage.from('capsule-contents').remove(topLevelFiles)
      }
    }
    console.log('  ✓ Storage bucket cleaned')
  } catch (err) {
    console.error('  ⚠️  Error cleaning storage (bucket may not exist yet):', err)
  }

  // Clean auth users
  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    if (existingUsers?.users) {
      for (const u of existingUsers.users) {
        if (u.email?.endsWith('@nuclea.test')) {
          await supabase.auth.admin.deleteUser(u.id)
        }
      }
    }
    console.log('  ✓ Auth users cleaned')
  } catch (err) {
    console.error('  ⚠️  Error cleaning auth users:', err)
  }

  // -----------------------------------------------------------------------
  // Step 2 — Create auth users
  // -----------------------------------------------------------------------
  console.log('\n👤 Creating auth users...')
  const authIdMap: Record<string, string> = {} // email -> auth_id

  for (const user of USERS) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.fullName },
      })
      if (error) throw error
      authIdMap[user.email] = data.user.id
      console.log(`  ✓ ${user.fullName} (${user.email}) → auth_id: ${data.user.id.slice(0, 8)}...`)
    } catch (err) {
      console.error(`  ❌ Failed to create auth user ${user.email}:`, err)
      process.exit(1)
    }
  }

  // -----------------------------------------------------------------------
  // Step 3 — Create user rows in public.users
  // -----------------------------------------------------------------------
  console.log('\n📋 Creating user rows...')
  const userIdMap: Record<string, string> = {} // email -> users.id

  for (const user of USERS) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          auth_id: authIdMap[user.email],
          email: user.email,
          full_name: user.fullName,
          avatar_url: null,
          terms_accepted_at: new Date().toISOString(),
          privacy_accepted_at: new Date().toISOString(),
          consent_version: '2.0',
          consent_source: 'seed_script',
        })
        .select('id')
        .single()

      if (error) throw error
      userIdMap[user.email] = data.id
      console.log(`  ✓ ${user.fullName} → user_id: ${data.id.slice(0, 8)}...`)
    } catch (err) {
      console.error(`  ❌ Failed to create user row for ${user.email}:`, err)
      process.exit(1)
    }
  }

  // -----------------------------------------------------------------------
  // Step 4 — Create capsules
  // -----------------------------------------------------------------------
  console.log('\n💊 Creating capsules...')
  const capsuleIdMap: Record<string, string> = {} // capsule title -> capsule id
  let capsuleIndex = 0

  for (const capsule of CAPSULES) {
    try {
      const ownerId = userIdMap[capsule.ownerEmail]
      const token = shareToken()
      const createdAt = spreadDate(capsuleIndex, CAPSULES.length)

      const { data, error } = await supabase
        .from('capsules')
        .insert({
          owner_id: ownerId,
          type: capsule.type,
          status: 'active',
          title: capsule.title,
          description: capsule.description,
          share_token: token,
          created_at: createdAt,
        })
        .select('id')
        .single()

      if (error) throw error
      capsuleIdMap[capsule.title] = data.id
      console.log(`  ✓ "${capsule.title}" (${capsule.type}) → ${data.id.slice(0, 8)}... [token: ${token}]`)
      capsuleIndex++
    } catch (err) {
      console.error(`  ❌ Failed to create capsule "${capsule.title}":`, err)
      process.exit(1)
    }
  }

  // -----------------------------------------------------------------------
  // Step 5 — Upload images and create content rows
  // -----------------------------------------------------------------------
  console.log('\n📸 Uploading images and creating content rows...')

  let imageOffset = 0
  let totalUploaded = 0

  for (const capsule of CAPSULES) {
    const capsuleId = capsuleIdMap[capsule.title]
    const ownerId = userIdMap[capsule.ownerEmail]
    const capsuleImages = allImages.slice(imageOffset, imageOffset + capsule.imageCount)
    imageOffset += capsule.imageCount

    console.log(`\n  📁 "${capsule.title}" — ${capsuleImages.length} images`)

    for (let i = 0; i < capsuleImages.length; i++) {
      const filename = capsuleImages[i]
      const filePath = path.join(IMAGES_DIR, filename)

      try {
        const fileBuffer = fs.readFileSync(filePath)
        const fileSize = fs.statSync(filePath).size
        const mime = mimeFromExt(filename)
        const storagePath = `${capsuleId}/${filename}`

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('capsule-contents')
          .upload(storagePath, fileBuffer, {
            contentType: mime,
            upsert: true,
          })

        if (uploadError) throw uploadError

        // Create content row
        const capturedAt = spreadDate(i, capsuleImages.length)
        const { error: insertError } = await supabase.from('contents').insert({
          capsule_id: capsuleId,
          created_by: ownerId,
          type: 'photo',
          file_path: storagePath,
          file_name: filename,
          file_size_bytes: fileSize,
          mime_type: mime,
          title: path.parse(filename).name.replace(/[_-]/g, ' '),
          captured_at: capturedAt,
        })

        if (insertError) throw insertError
        totalUploaded++

        // Progress indicator every 10 images
        if ((i + 1) % 10 === 0 || i === capsuleImages.length - 1) {
          console.log(`     ${i + 1}/${capsuleImages.length} uploaded`)
        }
      } catch (err) {
        console.error(`  ❌ Failed to upload ${filename}:`, err)
        // Continue with next image instead of crashing
      }
    }
  }

  console.log(`\n  ✓ Total images uploaded: ${totalUploaded}`)

  // -----------------------------------------------------------------------
  // Step 6 — Add text notes
  // -----------------------------------------------------------------------
  console.log('\n📝 Adding text notes...')
  let totalNotes = 0

  for (const capsule of CAPSULES) {
    const capsuleId = capsuleIdMap[capsule.title]
    const ownerId = userIdMap[capsule.ownerEmail]

    for (let i = 0; i < capsule.notes.length; i++) {
      try {
        const capturedAt = spreadDate(i, capsule.notes.length)
        const noteText = capsule.notes[i]
        const noteSize = Buffer.byteLength(noteText, 'utf8')

        const { error } = await supabase.from('contents').insert({
          capsule_id: capsuleId,
          created_by: ownerId,
          type: 'text',
          text_content: noteText,
          title: `Nota ${i + 1}`,
          file_size_bytes: noteSize,
          mime_type: 'text/plain',
          captured_at: capturedAt,
        })

        if (error) throw error
        totalNotes++
      } catch (err) {
        console.error(`  ❌ Failed to add note to "${capsule.title}":`, err)
      }
    }
  }

  console.log(`  ✓ ${totalNotes} text notes added`)

  // -----------------------------------------------------------------------
  // Step 6.5 — Persist storage_used_bytes on capsules
  // -----------------------------------------------------------------------
  console.log('\n🧮 Recalculating capsule storage usage...')
  try {
    const capsuleIds = Object.values(capsuleIdMap)
    const { data: allContents, error: contentError } = await supabase
      .from('contents')
      .select('capsule_id, file_size_bytes, text_content')
      .in('capsule_id', capsuleIds)

    if (contentError) throw contentError

    const totals: Record<string, number> = {}
    for (const capsuleId of capsuleIds) totals[capsuleId] = 0

    for (const row of allContents || []) {
      const fallbackTextBytes = row.text_content ? Buffer.byteLength(row.text_content, 'utf8') : 0
      const bytes = typeof row.file_size_bytes === 'number' && row.file_size_bytes > 0
        ? row.file_size_bytes
        : fallbackTextBytes
      totals[row.capsule_id] = (totals[row.capsule_id] || 0) + bytes
    }

    for (const [capsuleId, totalBytes] of Object.entries(totals)) {
      const { error: updateError } = await supabase
        .from('capsules')
        .update({ storage_used_bytes: totalBytes })
        .eq('id', capsuleId)
      if (updateError) throw updateError
    }

    console.log('  ✓ storage_used_bytes updated on capsules')
  } catch (err) {
    console.error('  ❌ Failed to recalculate capsule storage:', err)
  }

  // -----------------------------------------------------------------------
  // Step 7 — Add collaborator (Marge → Homer's "Momentos en Springfield")
  // -----------------------------------------------------------------------
  console.log('\n🤝 Adding collaborators...')
  try {
    const { error } = await supabase.from('collaborators').insert({
      capsule_id: capsuleIdMap['Momentos en Springfield'],
      user_id: userIdMap['marge@nuclea.test'],
      role: 'editor',
    })

    if (error) throw error
    console.log('  ✓ Marge added as editor on "Momentos en Springfield"')
  } catch (err) {
    console.error('  ❌ Failed to add collaborator:', err)
  }

  // -----------------------------------------------------------------------
  // Step 8 — Add designated person (Maggie → Homer's "Momentos en Springfield")
  // -----------------------------------------------------------------------
  console.log('\n🎯 Adding designated persons...')
  try {
    const { error } = await supabase.from('designated_persons').insert({
      capsule_id: capsuleIdMap['Momentos en Springfield'],
      user_id: userIdMap['maggie@nuclea.test'],
      full_name: 'Maggie Simpson',
      email: 'maggie@nuclea.test',
      relationship: 'Hija menor',
    })

    if (error) throw error
    console.log('  ✓ Maggie added as designated person on "Momentos en Springfield"')
  } catch (err) {
    console.error('  ❌ Failed to add designated person:', err)
  }

  // -----------------------------------------------------------------------
  // Step 9 — Create a v4 receiver capsule (Homer → Bart, status: sent)
  // -----------------------------------------------------------------------
  console.log('\n🎁 Creating v4 receiver capsule (Homer → Bart)...')
  try {
    const homerId = userIdMap['homer@nuclea.test']
    const bartId = userIdMap['bart@nuclea.test']
    const token = shareToken()
    const sentAt = new Date().toISOString()

    const { data, error } = await supabase
      .from('capsules')
      .insert({
        owner_id: homerId,
        creator_id: homerId,
        receiver_id: null,
        receiver_email: 'bart@nuclea.test',
        type: 'legacy',
        status: 'sent',
        title: 'Para mi hijo Bart',
        description: 'Todo lo que quiero que sepas cuando ya no esté.',
        share_token: token,
        sent_at: sentAt,
        video_regalo_status: 'none',
      })
      .select('id')
      .single()

    if (error) throw error
    capsuleIdMap['Para mi hijo Bart'] = data.id
    console.log(`  ✓ "Para mi hijo Bart" (sent) → ${data.id.slice(0, 8)}... [receiver_email: bart@nuclea.test]`)

    // Add a note from Homer
    await supabase.from('contents').insert({
      capsule_id: data.id,
      created_by: homerId,
      type: 'text',
      text_content: 'Bart, sé que no soy el padre perfecto, pero cada día intento ser mejor por ti.',
      title: 'Carta para Bart',
      file_size_bytes: 82,
      mime_type: 'text/plain',
      captured_at: sentAt,
    })
    console.log('  ✓ Added note from Homer')

    // Add Maggie as trust contact for this capsule
    await supabase.from('designated_persons').insert({
      capsule_id: data.id,
      user_id: userIdMap['maggie@nuclea.test'],
      full_name: 'Maggie Simpson',
      email: 'maggie@nuclea.test',
      relationship: 'Hermana',
      decision: 'pending',
    })
    console.log('  ✓ Maggie added as trust contact')
  } catch (err) {
    console.error('  ❌ Failed to create v4 receiver capsule:', err)
  }

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  console.log('\n' + '='.repeat(60))
  console.log('✅ NUCLEA seed complete!')
  console.log('='.repeat(60))
  console.log(`  👤 Users:              ${USERS.length}`)
  console.log(`  💊 Capsules:           ${CAPSULES.length}`)
  console.log(`  📸 Images uploaded:    ${totalUploaded}`)
  console.log(`  📝 Text notes:         ${totalNotes}`)
  console.log(`  🤝 Collaborators:      1 (Marge → Homer)`)
  console.log(`  🎯 Designated persons: 1 (Maggie → Homer)`)
  console.log()
  console.log('Test credentials:')
  for (const user of USERS) {
    console.log(`  ${user.fullName.padEnd(20)} ${user.email.padEnd(25)} ${user.password}`)
  }
  console.log()
}

seed().catch((err) => {
  console.error('\n💥 Seed failed:', err)
  process.exit(1)
})
