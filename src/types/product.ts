export type ProductCategory = 
  | 'All'
  | 'Topwear' 
  | 'Bottomwear' 
  | 'Footwear' 
  | 'Watches' 
  | 'Bags' 
  | 'Accessories' 
  | 'Outerwear';

export type Gender = 'All' | 'Men' | 'Women' | 'Unisex';

export interface DominantColor {
  hex: string;
  rgb: [number, number, number];
  percentage: number;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subCategory: string;
  gender: Gender;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  colors: string[];
  colorName: string;
  description: string;
  features: string[];
  vector: number[]; // 128-dimensional visual embedding vector
  dominantColor: DominantColor;
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
}

export interface VisualQuery {
  imageUrl: string;
  fileName?: string;
  vector: number[];
  dominantPalette: DominantColor[];
  averageBrightness: number;
  edgeDensity: number;
  aspectRatio: number;
  extractedCategoryHint?: string;
  detectedCategory?: ProductCategory;
  detectedConfidence?: number;
  detectedLabel?: string;
  strictCategoryFilter?: boolean;
}

export interface RecommendationMatch {
  product: Product;
  similarity: number; // 0.0 - 1.0
  matchPercentage: number; // 0 - 100
  colorMatchScore: number;
  textureMatchScore: number;
  categoryMatchScore: number;
  matchReasons: string[];
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}
