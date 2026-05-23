import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const input =
  process.argv[2] ||
  path.join(root, '..', 'backend', 'uploads', 'pets', 'ChatGPT Image May 21, 2026, 11_05_58 AM.png');
const output = path.join(root, 'public', 'images', 'carlisle-logo.png');

/** Turn only outer black padding transparent (keep white text in the artwork). */
function keyOutBlack(data, width, height, channels) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (Math.max(r, g, b) < 48) {
        data[i + 3] = 0;
      }
    }
  }
}

const trimmed = await sharp(input).trim({ threshold: 12 }).ensureAlpha().toBuffer();

const meta = await sharp(trimmed).metadata();
const { data, info } = await sharp(trimmed)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

keyOutBlack(data, info.width, info.height, info.channels);

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile(output);

console.log(`Wrote transparent logo: ${output} (${info.width}x${info.height})`);
