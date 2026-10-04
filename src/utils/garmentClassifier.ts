import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { ProductCategory } from '../types/product';

let mobilenetModelPromise: Promise<mobilenet.MobileNet> | null = null;

// Cache model initialization
export async function getMobileNetModel(): Promise<mobilenet.MobileNet> {
  if (!mobilenetModelPromise) {
    mobilenetModelPromise = (async () => {
      // Initialize tfjs backend
      await tf.ready();
      return await mobilenet.load({
        version: 2,
        alpha: 1.0,
      });
    })();
  }
  return mobilenetModelPromise;
}

export interface GarmentClassificationResult {
  category: ProductCategory;
  confidence: number;
  rawLabel: string;
  detectedType: string;
  matchReasons: string[];
}

/**
 * Intelligent mapping from ImageNet class descriptions to fashion categories.
 */
function mapClassToFashionCategory(label: string): { category: ProductCategory; type: string } | null {
  const l = label.toLowerCase();

  // 1. TOPWEAR (Shirts, T-shirts, Sweaters, Polos, Cardigans)
  if (
    l.includes('jersey') ||
    l.includes('t-shirt') ||
    l.includes('tee shirt') ||
    l.includes('sweatshirt') ||
    l.includes('cardigan') ||
    l.includes('polo') ||
    l.includes('shirt') ||
    l.includes('sweater') ||
    l.includes('turtleneck') ||
    l.includes('tank top') ||
    l.includes('blouse') ||
    l.includes('sleeveless')
  ) {
    return { category: 'Topwear', type: 'Shirt / Topwear' };
  }

  // 2. BOTTOMWEAR (Jeans, Trousers, Pants, Denim, Shorts)
  if (
    l.includes('jean') ||
    l.includes('blue jean') ||
    l.includes('denim') ||
    l.includes('trouser') ||
    l.includes('pant') ||
    l.includes('sweatpant') ||
    l.includes('slacks') ||
    l.includes('chinos') ||
    l.includes('shorts') ||
    l.includes('trunks') ||
    l.includes('legging')
  ) {
    return { category: 'Bottomwear', type: 'Pants / Bottomwear' };
  }

  // 3. FOOTWEAR (Shoes, Sneakers, Boots, Loafers, Sandals)
  if (
    l.includes('running shoe') ||
    l.includes('sneaker') ||
    l.includes('tennis shoe') ||
    l.includes('shoe') ||
    l.includes('loafer') ||
    l.includes('boot') ||
    l.includes('sandal') ||
    l.includes('clog') ||
    l.includes('moccasin') ||
    l.includes('oxford') ||
    l.includes('cleat')
  ) {
    return { category: 'Footwear', type: 'Shoes / Footwear' };
  }

  // 4. WATCHES (Wristwatch, Digital watch, Chronograph)
  if (
    l.includes('watch') ||
    l.includes('digital watch') ||
    l.includes('analog clock') ||
    l.includes('stopwatch') ||
    l.includes('wristwatch') ||
    l.includes('chronograph')
  ) {
    return { category: 'Watches', type: 'Watch / Timepiece' };
  }

  // 5. OUTERWEAR (Jackets, Coats, Blazers, Trench)
  if (
    l.includes('trench coat') ||
    l.includes('coat') ||
    l.includes('overcoat') ||
    l.includes('jacket') ||
    l.includes('windbreaker') ||
    l.includes('fur coat') ||
    l.includes('cloak') ||
    l.includes('parka') ||
    l.includes('blazer') ||
    l.includes('suit')
  ) {
    return { category: 'Outerwear', type: 'Jacket / Outerwear' };
  }

  // 6. BAGS (Backpack, Tote, Handbag, Purse)
  if (
    l.includes('backpack') ||
    l.includes('back pack') ||
    l.includes('knapsack') ||
    l.includes('rucksack') ||
    l.includes('handbag') ||
    l.includes('purse') ||
    l.includes('mailbag') ||
    l.includes('tote') ||
    l.includes('wallet')
  ) {
    return { category: 'Bags', type: 'Bag / Backpack' };
  }

  // 7. ACCESSORIES (Sunglasses, Scarves, Hats, Belts)
  if (
    l.includes('sunglass') ||
    l.includes('dark glasses') ||
    l.includes('shades') ||
    l.includes('spectacles') ||
    l.includes('scarf') ||
    l.includes('necktie') ||
    l.includes('tie') ||
    l.includes('bow tie') ||
    l.includes('cap') ||
    l.includes('hat') ||
    l.includes('beret') ||
    l.includes('belt')
  ) {
    return { category: 'Accessories', type: 'Accessory' };
  }

  return null;
}

/**
 * Classifies an image into fashion garment categories using MobileNet AI model + geometric & metadata heuristics.
 */
export async function classifyGarment(
  imageElement: HTMLImageElement,
  fileName?: string
): Promise<GarmentClassificationResult> {
  const reasons: string[] = [];

  // 1. File name / query hints check first
  if (fileName) {
    const fn = fileName.toLowerCase();
    if (fn.includes('shirt') || fn.includes('tshirt') || fn.includes('tee') || fn.includes('polo') || fn.includes('hoodie')) {
      return {
        category: 'Topwear',
        confidence: 0.98,
        rawLabel: 'shirt / topwear pattern',
        detectedType: 'Shirt (Topwear)',
        matchReasons: ['Filename identified as Topwear / Shirt', 'Filtered strictly to shirts'],
      };
    }
    if (fn.includes('pant') || fn.includes('jean') || fn.includes('trouser') || fn.includes('denim') || fn.includes('chinos') || fn.includes('bottom')) {
      return {
        category: 'Bottomwear',
        confidence: 0.98,
        rawLabel: 'pant / denim trousers',
        detectedType: 'Pants (Bottomwear)',
        matchReasons: ['Filename identified as Pants / Denim', 'Filtered strictly to pants'],
      };
    }
    if (fn.includes('shoe') || fn.includes('sneaker') || fn.includes('boot') || fn.includes('footwear')) {
      return {
        category: 'Footwear',
        confidence: 0.98,
        rawLabel: 'footwear / sneaker',
        detectedType: 'Footwear (Shoes)',
        matchReasons: ['Filename identified as Footwear', 'Filtered strictly to shoes'],
      };
    }
    if (fn.includes('watch') || fn.includes('chronograph')) {
      return {
        category: 'Watches',
        confidence: 0.98,
        rawLabel: 'watch / chronograph',
        detectedType: 'Watch',
        matchReasons: ['Filename identified as Watch', 'Filtered strictly to watches'],
      };
    }
  }

  // 2. MobileNet Neural Network Classification
  try {
    const model = await getMobileNetModel();
    const predictions = await model.classify(imageElement, 5);

    for (const pred of predictions) {
      const mapped = mapClassToFashionCategory(pred.className);
      if (mapped) {
        return {
          category: mapped.category,
          confidence: Math.round(pred.probability * 100) / 100,
          rawLabel: pred.className,
          detectedType: mapped.type,
          matchReasons: [
            `MobileNet AI detected: "${pred.className}" (${Math.round(pred.probability * 100)}% confidence)`,
            `Strictly filtering catalog to ${mapped.category}`,
          ],
        };
      }
    }
  } catch (err) {
    console.warn('MobileNet classification error, using geometric/aspect ratio heuristics:', err);
  }

  // 3. Fallback: Aspect Ratio & Spatial Silhouette Heuristics
  const width = imageElement.naturalWidth || imageElement.width || 100;
  const height = imageElement.naturalHeight || imageElement.height || 100;
  const aspect = height / width;

  if (aspect >= 1.35) {
    // Very tall vertical aspect ratio is characteristic of pants / trousers
    return {
      category: 'Bottomwear',
      confidence: 0.85,
      rawLabel: 'vertical silhouette pattern',
      detectedType: 'Pants (Bottomwear)',
      matchReasons: ['Vertical geometric silhouette detected as Bottomwear', 'Strictly showing pants'],
    };
  } else if (aspect <= 0.8) {
    // Horizontal aspect ratio is characteristic of footwear / sneakers
    return {
      category: 'Footwear',
      confidence: 0.82,
      rawLabel: 'horizontal footwear silhouette',
      detectedType: 'Shoes (Footwear)',
      matchReasons: ['Horizontal profile detected as Footwear', 'Strictly showing shoes'],
    };
  } else if (Math.abs(aspect - 1.0) < 0.15) {
    // Square profile: could be watch or folded topwear
    return {
      category: 'Topwear',
      confidence: 0.80,
      rawLabel: 'torso / topwear frame',
      detectedType: 'Shirt (Topwear)',
      matchReasons: ['Garment profile classified as Topwear', 'Strictly showing shirts'],
    };
  }

  // Default to Topwear if undecided
  return {
    category: 'Topwear',
    confidence: 0.75,
    rawLabel: 'apparel pattern',
    detectedType: 'Shirt (Topwear)',
    matchReasons: ['Classified as Topwear', 'Showing topwear shirts'],
  };
}
