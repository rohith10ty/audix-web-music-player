import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputDir = path.resolve("scratch/kling_pngs");
const outputDir = path.resolve("public/listener-frames");

// 360px is already much larger than the size the man is
// actually displayed at in the loader.
// This gives excellent Retina/high-DPI clarity while saving a lot of space.
const TARGET_WIDTH = 360;

fs.mkdirSync(outputDir, { recursive: true });

const files = fs
  .readdirSync(inputDir)
  .filter((file) => /\.png$/i.test(file))
  .sort((a, b) => {
    const aNumber = Number(a.match(/\d+/)?.[0] ?? 0);
    const bNumber = Number(b.match(/\d+/)?.[0] ?? 0);

    return aNumber - bNumber;
  });

if (files.length === 0) {
  console.error("❌ No PNG files found inside:");
  console.error(inputDir);
  process.exit(1);
}

const bytesToMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

let originalSize = 0;
let compressedSize = 0;

console.log(`\nFound ${files.length} PNG frames.`);
console.log("Starting WebP conversion...\n");

for (const file of files) {
  const inputPath = path.join(inputDir, file);

  const frameNumber = Number(file.match(/\d+/)?.[0] ?? 0);

  const outputName = `frame_${String(frameNumber).padStart(3, "0")}.webp`;

  const outputPath = path.join(outputDir, outputName);

  const stat = fs.statSync(inputPath);
  originalSize += stat.size;

  const result = await sharp(inputPath)
    .ensureAlpha()

    // IMPORTANT:
    // Resize the entire transparent canvas.
    // Do NOT use trim(), otherwise the character position
    // could change slightly from frame to frame.
    .resize({
      width: TARGET_WIDTH,
      fit: "inside",
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })

    // Keep transparency + high quality.
    .webp({
      quality: 92,
      alphaQuality: 100,
      effort: 6,
      smartSubsample: true,
    })

    .toFile(outputPath);

  compressedSize += result.size;

  console.log(
    `✓ ${file}  →  ${outputName}  (${Math.round(result.size / 1024)} KB)`,
  );
}

console.log("\n---------------------------------------");
console.log(`Frames: ${files.length}`);
console.log(`Original PNG size: ${bytesToMB(originalSize)} MB`);
console.log(`Compressed WebP size: ${bytesToMB(compressedSize)} MB`);
console.log(
  `Saved: ${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`,
);
console.log("---------------------------------------\n");

console.log("✅ Finished!");
console.log(`WebP frames are inside:\n${outputDir}\n`);
