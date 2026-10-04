import { DominantColor, Product, RecommendationMatch, VisualQuery } from '../types/product';

// Color name mapping utility for accurate fashion palette labeling
const FASHION_COLOR_NAMES: Array<{ name: string; rgb: [number, number, number] }> = [
  { name: 'Pure White', rgb: [255, 255, 255] },
  { name: 'Off White / Ivory', rgb: [248, 245, 240] },
  { name: 'Oatmeal / Ecru', rgb: [225, 218, 205] },
  { name: 'Heather Grey', rgb: [180, 185, 190] },
  { name: 'Charcoal Grey', rgb: [65, 70, 75] },
  { name: 'Pitch Black', rgb: [20, 20, 22] },
  { name: 'Deep Navy Blue', rgb: [20, 35, 60] },
  { name: 'Washed Denim Blue', rgb: [70, 110, 160] },
  { name: 'Sky Blue', rgb: [140, 185, 225] },
  { name: 'Forest / Pine Green', rgb: [35, 75, 50] },
  { name: 'Muted Olive Green', rgb: [95, 105, 70] },
  { name: 'Sage Green', rgb: [160, 180, 160] },
  { name: 'Warm Camel / Tan', rgb: [195, 145, 95] },
  { name: 'Dark Chocolate / Mocha', rgb: [65, 45, 35] },
  { name: 'Burgundy / Oxblood', rgb: [110, 30, 45] },
  { name: 'Crimson Red', rgb: [190, 40, 45] },
  { name: 'Soft Coral / Rose', rgb: [225, 140, 140] },
  { name: 'Mustard Gold', rgb: [215, 165, 50] },
  { name: 'Khaki Stone', rgb: [185, 175, 150] },
  { name: 'Silver / Metallic', rgb: [190, 195, 200] },
];

export function getNearestColorName(r: number, g: number, b: number): string {
  let minDistance = Infinity;
  let closestName = 'Custom Tone';

  for (const item of FASHION_COLOR_NAMES) {
    const dr = r - item.rgb[0];
    const dg = g - item.rgb[1];
    const db = b - item.rgb[2];
    const distance = Math.sqrt(dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114);
    if (distance < minDistance) {
      minDistance = distance;
      closestName = item.name;
    }
  }

  return closestName;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Extracts a normalized 128-dimensional visual feature embedding vector
 * and rich visual metadata directly in-browser using HTML5 Canvas.
 */
export async function extractImageFeatures(imageSource: string | File | HTMLImageElement): Promise<VisualQuery> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const query = processImageElement(img);
        resolve(query);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => {
      reject(new Error('Failed to load image for visual feature extraction: ' + String(e)));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    } else if (imageSource instanceof HTMLImageElement) {
      if (imageSource.complete) {
        resolve(processImageElement(imageSource));
      } else {
        img.src = imageSource.src;
      }
    }
  });
}

function processImageElement(img: HTMLImageElement): VisualQuery {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  const sampleSize = 64;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

  const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const data = imgData.data;
  const totalPixels = sampleSize * sampleSize;

  // 1. Color Histogram (64 bins: 4x4x4 RGB quantization)
  const colorHistogram = new Float32Array(64);
  let totalBrightness = 0;
  let totalSaturation = 0;

  // Pixel bucket mapping for dominant colors
  const colorBins: { [binKey: string]: { r: number; g: number; b: number; count: number } } = {};

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const rBin = Math.min(3, Math.floor(r / 64));
    const gBin = Math.min(3, Math.floor(g / 64));
    const bBin = Math.min(3, Math.floor(b / 64));
    const binIndex = rBin * 16 + gBin * 4 + bBin;
    colorHistogram[binIndex] += 1;

    // Perceptual brightness
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    totalBrightness += brightness;

    // Saturation
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    totalSaturation += sat;

    // Quantize into 8x8x8 for clustering dominant colors
    const qr = Math.floor(r / 32) * 32 + 16;
    const qg = Math.floor(g / 32) * 32 + 16;
    const qb = Math.floor(b / 32) * 32 + 16;
    const key = `${qr}_${qg}_${qb}`;
    if (!colorBins[key]) {
      colorBins[key] = { r: 0, g: 0, b: 0, count: 0 };
    }
    colorBins[key].r += r;
    colorBins[key].g += g;
    colorBins[key].b += b;
    colorBins[key].count += 1;
  }

  // Normalize histogram
  for (let i = 0; i < 64; i++) {
    colorHistogram[i] /= totalPixels;
  }

  // 2. Spatial Grid Edge and Luminance Density (4x4 grid = 16 cells x 2 = 32 dimensions)
  const spatialFeatures = new Float32Array(32);
  const cellSize = sampleSize / 4; // 16 pixels per cell

  for (let gy = 0; gy < 4; gy++) {
    for (let gx = 0; gx < 4; gx++) {
      let cellLumaSum = 0;
      let cellEdgeSum = 0;
      let cellPixels = 0;

      for (let y = gy * cellSize; y < (gy + 1) * cellSize; y++) {
        for (let x = gx * cellSize; x < (gx + 1) * cellSize; x++) {
          const idx = (y * sampleSize + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          cellLumaSum += luma;

          // Simple horizontal and vertical gradient (Sobel edge approximation)
          if (x > 0 && y > 0 && x < sampleSize - 1 && y < sampleSize - 1) {
            const rightIdx = (y * sampleSize + (x + 1)) * 4;
            const bottomIdx = ((y + 1) * sampleSize + x) * 4;
            const dx = Math.abs(data[rightIdx] - r);
            const dy = Math.abs(data[bottomIdx] - g);
            cellEdgeSum += (dx + dy) / 2;
          }
          cellPixels++;
        }
      }

      const cellIndex = gy * 4 + gx;
      spatialFeatures[cellIndex * 2] = cellLumaSum / (cellPixels * 255);
      spatialFeatures[cellIndex * 2 + 1] = Math.min(1.0, cellEdgeSum / (cellPixels * 128));
    }
  }

  // 3. Dominant Color Extraction
  const sortedClusters = Object.values(colorBins)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const dominantPalette: DominantColor[] = sortedClusters.map((cluster) => {
    const avgR = Math.round(cluster.r / cluster.count);
    const avgG = Math.round(cluster.g / cluster.count);
    const avgB = Math.round(cluster.b / cluster.count);
    const percentage = Math.round((cluster.count / totalPixels) * 100);
    return {
      hex: rgbToHex(avgR, avgG, avgB),
      rgb: [avgR, avgG, avgB],
      percentage,
      name: getNearestColorName(avgR, avgG, avgB),
    };
  });

  // 4. Centroid features (16 dimensions)
  const centroidFeatures = new Float32Array(16);
  for (let k = 0; k < 4; k++) {
    if (dominantPalette[k]) {
      const c = dominantPalette[k];
      centroidFeatures[k * 4 + 0] = c.rgb[0] / 255;
      centroidFeatures[k * 4 + 1] = c.rgb[1] / 255;
      centroidFeatures[k * 4 + 2] = c.rgb[2] / 255;
      centroidFeatures[k * 4 + 3] = c.percentage / 100;
    }
  }

  // 5. Global Statistics (16 dimensions)
  const globalStats = new Float32Array(16);
  const avgBright = totalBrightness / totalPixels;
  const avgSat = totalSaturation / totalPixels;
  const aspectRatio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.0;

  let totalEdgeActivity = 0;
  for (let i = 1; i < 32; i += 2) {
    totalEdgeActivity += spatialFeatures[i];
  }
  const edgeDensity = totalEdgeActivity / 16;

  globalStats[0] = avgBright;
  globalStats[1] = avgSat;
  globalStats[2] = Math.min(2.0, aspectRatio) / 2.0;
  globalStats[3] = edgeDensity;
  globalStats[4] = dominantPalette[0] ? dominantPalette[0].rgb[0] / 255 : 0.5;
  globalStats[5] = dominantPalette[0] ? dominantPalette[0].rgb[1] / 255 : 0.5;
  globalStats[6] = dominantPalette[0] ? dominantPalette[0].rgb[2] / 255 : 0.5;
  globalStats[7] = dominantPalette[1] ? dominantPalette[1].rgb[0] / 255 : 0.5;
  globalStats[8] = dominantPalette[1] ? dominantPalette[1].rgb[1] / 255 : 0.5;
  globalStats[9] = dominantPalette[1] ? dominantPalette[1].rgb[2] / 255 : 0.5;
  globalStats[10] = dominantPalette.length > 0 ? dominantPalette[0].percentage / 100 : 0;
  globalStats[11] = dominantPalette.length > 1 ? dominantPalette[1].percentage / 100 : 0;
  globalStats[12] = dominantPalette.length > 2 ? dominantPalette[2].percentage / 100 : 0;
  globalStats[13] = (colorHistogram[0] + colorHistogram[1] + colorHistogram[16]) * 2; // Dark density
  globalStats[14] = (colorHistogram[63] + colorHistogram[62] + colorHistogram[47]) * 2; // Bright density
  globalStats[15] = Math.abs(avgBright - 0.5) * 2;

  // Combine into 128-dimensional embedding vector
  // 64 (color hist) + 32 (spatial) + 16 (centroids) + 16 (global stats) = 128
  const combined = new Float32Array(128);
  combined.set(colorHistogram, 0);
  combined.set(spatialFeatures, 64);
  combined.set(centroidFeatures, 96);
  combined.set(globalStats, 112);

  // Normalize vector to L2 unit length
  let normSq = 0;
  for (let i = 0; i < 128; i++) {
    normSq += combined[i] * combined[i];
  }
  const norm = Math.sqrt(normSq) || 1.0;
  const normalizedVector: number[] = new Array(128);
  for (let i = 0; i < 128; i++) {
    normalizedVector[i] = Number((combined[i] / norm).toFixed(6));
  }

  return {
    imageUrl: img.src,
    vector: normalizedVector,
    dominantPalette,
    averageBrightness: Number(avgBright.toFixed(2)),
    edgeDensity: Number(edgeDensity.toFixed(2)),
    aspectRatio: Number(aspectRatio.toFixed(2)),
    extractedCategoryHint: inferCategoryHint(dominantPalette, aspectRatio, edgeDensity),
  };
}

function inferCategoryHint(palette: DominantColor[], aspectRatio: number, edgeDensity: number): string | undefined {
  if (aspectRatio > 0.85 && aspectRatio < 1.15 && edgeDensity > 0.45) {
    return 'Footwear or Watch';
  }
  if (aspectRatio < 0.75) {
    return 'Apparel / Full Silhouette';
  }
  return undefined;
}

/**
 * Computes Cosine Similarity between two 128-dim vectors.
 * Returns value between 0.0 and 1.0.
 */
export function computeCosineSimilarity(v1: number[], v2: number[]): number {
  if (!v1 || !v2 || v1.length !== v2.length) return 0;
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    norm1 += v1[i] * v1[i];
    norm2 += v2[i] * v2[i];
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Calculates color harmony score (0 to 1) based on RGB Euclidean distance.
 */
export function calculateColorSimilarity(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const dr = (rgb1[0] - rgb2[0]) / 255;
  const dg = (rgb1[1] - rgb2[1]) / 255;
  const db = (rgb1[2] - rgb2[2]) / 255;
  const dist = Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
  return Math.max(0, 1 - dist);
}

/**
 * High-performance multi-objective product recommendation engine.
 * Ranks catalog items by hybrid visual similarity, color affinity, and texture match.
 */
export function recommendProducts(
  query: VisualQuery,
  catalog: Product[],
  options: {
    topK?: number;
    category?: string;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
  } = {}
): RecommendationMatch[] {
  const { topK = 16, category, gender, minPrice, maxPrice, searchQuery } = options;

  const queryPrimaryColor = query.dominantPalette[0]?.rgb || [128, 128, 128];

  const results: RecommendationMatch[] = [];

  for (const product of catalog) {
    // Category filter
    if (category && category !== 'All' && product.category !== category) {
      continue;
    }

    // Gender filter
    if (gender && gender !== 'All' && product.gender !== gender && product.gender !== 'Unisex') {
      continue;
    }

    // Price filter
    if (minPrice !== undefined && product.price < minPrice) continue;
    if (maxPrice !== undefined && product.price > maxPrice) continue;

    // Search query filter (textual keyword matching)
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.colorName.toLowerCase().includes(q) ||
        product.subCategory.toLowerCase().includes(q) ||
        product.features.some((f) => f.toLowerCase().includes(q));

      if (!matchesSearch) continue;
    }

    // 1. Vector Cosine Similarity (Deep visual embedding)
    const cosineSim = computeCosineSimilarity(query.vector, product.vector);

    // 2. Color Similarity (Dominant palette alignment)
    const colorSim = calculateColorSimilarity(queryPrimaryColor, product.dominantColor.rgb);

    // 3. Texture / Edge Density Alignment (Slice 64-96 of vector)
    let textureDist = 0;
    for (let k = 64; k < 96; k++) {
      const diff = query.vector[k] - product.vector[k];
      textureDist += diff * diff;
    }
    const textureSim = Math.max(0, 1 - Math.sqrt(textureDist));

    // Hybrid combined score: 55% embedding, 30% color harmony, 15% texture silhouette
    const rawScore = 0.55 * cosineSim + 0.30 * colorSim + 0.15 * textureSim;

    // Calibrate to realistic human-facing match percentage: 70% - 99%
    const calibratedPercentage = Math.min(99, Math.max(68, Math.round(rawScore * 100)));

    // Generate descriptive match reasons
    const matchReasons: string[] = [];
    if (colorSim > 0.85) {
      matchReasons.push(`${Math.round(colorSim * 100)}% Color Tone Harmony (${product.colorName})`);
    } else if (colorSim > 0.70) {
      matchReasons.push(`Complementary Palette (${product.colorName})`);
    }

    if (textureSim > 0.80) {
      matchReasons.push('Matching Minimalist Silhouette');
    } else {
      matchReasons.push('Harmonious Proportions');
    }

    if (cosineSim > 0.88) {
      matchReasons.push('High-Confidence Visual Embedding Match');
    } else if (cosineSim > 0.75) {
      matchReasons.push('Visual Style Alignment');
    }

    results.push({
      product,
      similarity: rawScore,
      matchPercentage: calibratedPercentage,
      colorMatchScore: Math.round(colorSim * 100),
      textureMatchScore: Math.round(textureSim * 100),
      categoryMatchScore: Math.round(cosineSim * 100),
      matchReasons,
    });
  }

  // Sort descending by similarity score
  results.sort((a, b) => b.similarity - a.similarity);

  return results.slice(0, topK);
}
