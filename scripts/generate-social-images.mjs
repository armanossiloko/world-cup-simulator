import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const ogSvg = await readFile(join(publicDir, 'og-image.svg'));

await sharp(ogSvg)
  .resize(1200, 630)
  .png()
  .toFile(join(publicDir, 'og-image.png'));

await sharp(join(publicDir, 'favicon.svg'))
  .resize(180, 180)
  .png()
  .toFile(join(publicDir, 'apple-touch-icon.png'));

console.log('Generated public/og-image.png and public/apple-touch-icon.png');
