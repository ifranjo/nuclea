/**
 * Resize selected photos for polaroid display in P2 onboarding.
 * Crops to square center, resizes to 250px, quality 82 JPEG.
 */
import sharp from 'sharp'
import { resolve, basename } from 'path'
import { mkdirSync } from 'fs'

const SRC_DIR = resolve('../../nuclea_for memories_prock_images')
const OUT_DIR = resolve('./public/images/polaroids')
const SIZE = 250
const QUALITY = 82

// Selected 8 photos — emotional variety: dinner, terrace, beach, heritage, friends, adventure, family, relaxed
const PHOTOS = [
  { file: 'DSC00235.JPG', out: 'dinner.jpg' },       // Couple at outdoor dinner
  { file: 'DPP_4810.JPG', out: 'terrace.jpg' },       // Man at seaside terrace, Lanzarote
  { file: 'DPP_4813.JPG', out: 'beach.jpg' },         // Beach with ocean and mountains
  { file: 'DSC00238.JPG', out: 'group.jpg' },          // Group at stone building
  { file: 'DPP_4819.JPG', out: 'friends.jpg' },       // Group of 4 in street
  { file: 'DSC01302.JPG', out: 'cathedral.jpg' },     // Family at Spanish cathedral
  { file: 'DSC01325.JPG', out: 'adventure.jpg' },     // Family in rock gorge
  { file: 'DPP_4827.JPG', out: 'terrace2.jpg' },      // Two women at terrace with ocean
]

mkdirSync(OUT_DIR, { recursive: true })

for (const { file, out } of PHOTOS) {
  const src = resolve(SRC_DIR, file)
  const dst = resolve(OUT_DIR, out)

  try {
    const meta = await sharp(src).metadata()
    const minDim = Math.min(meta.width, meta.height)

    await sharp(src)
      .rotate() // auto-rotate from EXIF
      .extract({
        left: Math.floor((meta.width - minDim) / 2),
        top: Math.floor((meta.height - minDim) / 2),
        width: minDim,
        height: minDim,
      })
      .resize(SIZE, SIZE)
      .jpeg({ quality: QUALITY })
      .toFile(dst)

    console.log(`OK  ${file} → ${out} (${SIZE}x${SIZE})`)
  } catch (err) {
    console.error(`ERR ${file}: ${err.message}`)
  }
}

console.log('\nDone. 8 polaroids in public/images/polaroids/')
