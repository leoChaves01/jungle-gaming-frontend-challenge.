import sharp from 'sharp';
// Encoding/resizing only: the character artwork is preserved in assets/originals.
for (const id of ['emerald', 'sage', 'ivory', 'golden']) {
  await sharp(`assets/originals/${id}.png`)
    .resize(640, 640)
    .webp({ quality: 83 })
    .toFile(`public/art/${id}.webp`);
  await sharp(`assets/originals/${id}.png`)
    .resize(320, 320)
    .webp({ quality: 80 })
    .toFile(`public/art/${id}-small.webp`);
}
