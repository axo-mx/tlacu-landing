#!/usr/bin/env node
/**
 * Image Optimization Script
 * Converts PNG images to WebP with quality optimization
 * Run: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import { readdir, stat, unlink } from 'fs/promises';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

// Configuration
const CONFIG = {
  // Max dimensions for different image types
  maxDimensions: {
    screenshots: { width: 1200, height: 1800 },
    logos: { width: 400, height: 400 },
    default: { width: 1920, height: 1080 }
  },
  // WebP quality (0-100)
  quality: 82,
  // Also keep original PNG? (set to false to delete)
  keepOriginal: false
};

async function getImageFiles(dir) {
  const files = [];

  async function scan(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile() && /\.(png|jpg|jpeg)$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  await scan(dir);
  return files;
}

function getMaxDimensions(filePath) {
  if (filePath.includes('screenshots')) return CONFIG.maxDimensions.screenshots;
  if (filePath.includes('logos')) return CONFIG.maxDimensions.logos;
  return CONFIG.maxDimensions.default;
}

async function optimizeImage(inputPath) {
  const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const fileName = basename(inputPath);
  const maxDim = getMaxDimensions(inputPath);

  try {
    const inputStats = await stat(inputPath);
    const inputSize = inputStats.size;

    // Get original dimensions
    const metadata = await sharp(inputPath).metadata();

    // Resize if needed, maintaining aspect ratio
    let pipeline = sharp(inputPath);

    if (metadata.width > maxDim.width || metadata.height > maxDim.height) {
      pipeline = pipeline.resize(maxDim.width, maxDim.height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to WebP
    await pipeline
      .webp({ quality: CONFIG.quality })
      .toFile(outputPath);

    const outputStats = await stat(outputPath);
    const outputSize = outputStats.size;
    const savings = ((inputSize - outputSize) / inputSize * 100).toFixed(1);

    console.log(`✅ ${fileName}`);
    console.log(`   ${(inputSize / 1024).toFixed(0)}KB → ${(outputSize / 1024).toFixed(0)}KB (${savings}% smaller)`);

    // Delete original if configured
    if (!CONFIG.keepOriginal) {
      await unlink(inputPath);
      console.log(`   🗑️  Deleted original PNG`);
    }

    return { input: inputSize, output: outputSize };
  } catch (error) {
    console.error(`❌ Error processing ${fileName}:`, error.message);
    return { input: 0, output: 0 };
  }
}

async function main() {
  console.log('🖼️  Image Optimization Script\n');
  console.log(`📁 Scanning: ${PUBLIC_DIR}/images\n`);

  const imagesDir = join(PUBLIC_DIR, 'images');
  const files = await getImageFiles(imagesDir);

  if (files.length === 0) {
    console.log('No PNG/JPG images found to optimize.');
    return;
  }

  console.log(`Found ${files.length} images to optimize:\n`);

  let totalInput = 0;
  let totalOutput = 0;

  for (const file of files) {
    const result = await optimizeImage(file);
    totalInput += result.input;
    totalOutput += result.output;
  }

  console.log('\n📊 Summary:');
  console.log(`   Total before: ${(totalInput / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Total after:  ${(totalOutput / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Saved: ${((totalInput - totalOutput) / 1024 / 1024).toFixed(2)}MB (${((totalInput - totalOutput) / totalInput * 100).toFixed(1)}%)`);
}

main().catch(console.error);
