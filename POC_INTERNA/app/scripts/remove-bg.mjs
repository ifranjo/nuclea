import sharp from 'sharp';

const input = 'C:/Users/Kaos/scripts/nuclea/POC_INTERNA/app/public/images/capsule-closed.png';
const output = 'C:/Users/Kaos/scripts/nuclea/POC_INTERNA/app/public/images/capsule-closed-nobg.png';

// Read image, extract raw pixel data
const image = sharp(input);
const { width, height, channels } = await image.metadata();

const raw = await image.ensureAlpha().raw().toBuffer();

// Process pixels: make near-white pixels transparent
const threshold = 235; // pixels above this in all RGB channels → transparent
for (let i = 0; i < raw.length; i += 4) {
  const r = raw[i], g = raw[i + 1], b = raw[i + 2];
  if (r > threshold && g > threshold && b > threshold) {
    raw[i + 3] = 0; // set alpha to 0
  }
}

await sharp(raw, { raw: { width, height, channels: 4 } })
  .png()
  .toFile(output);

console.log(`Done: ${output}`);
console.log(`Size: ${width}x${height}`);
