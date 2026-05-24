import sharp from 'sharp';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../public/images/services/icons');

const files = (await readdir(iconsDir)).filter((f) => f.endsWith('.svg'));

for (const file of files) {
  const svg = await readFile(join(iconsDir, file), 'utf8');
  const out = join(iconsDir, file.replace('.svg', '.png'));
  await sharp(Buffer.from(svg)).resize(96, 96).png().toFile(out);
  console.log('Wrote', out);
}
