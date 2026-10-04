export interface SampleQuery {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  expectedColor: string;
}

export const SAMPLE_QUERIES: SampleQuery[] = [
  {
    id: 'sample-navy-shirt',
    title: 'Navy Oxford Shirt',
    category: 'Topwear',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
    expectedColor: 'Deep Navy Blue',
  },
  {
    id: 'sample-white-sneaker',
    title: 'Minimalist White Sneaker',
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
    expectedColor: 'Pure White',
  },
  {
    id: 'sample-denim-jacket',
    title: 'Washed Denim Jacket',
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
    expectedColor: 'Denim Blue',
  },
  {
    id: 'sample-silver-watch',
    title: 'Steel Mesh Watch',
    category: 'Watches',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    expectedColor: 'Silver / Metallic',
  },
  {
    id: 'sample-black-backpack',
    title: 'Matte Leather Bag',
    category: 'Bags',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
    expectedColor: 'Pitch Black',
  },
  {
    id: 'sample-camel-coat',
    title: 'Virgin Wool Trench',
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80',
    expectedColor: 'Camel / Tan',
  },
  {
    id: 'sample-sunglasses',
    title: 'Tortoiseshell Eyewear',
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80',
    expectedColor: 'Warm Amber',
  },
  {
    id: 'sample-white-tee',
    title: 'Heavyweight Tee',
    category: 'Topwear',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    expectedColor: 'Pure White',
  }
];
