# Product-search-Recommendation-System

> **VisionCart AI** — A modern, minimalist visual product discovery and recommendation engine powered by 100% client-side 128-dimensional image feature embeddings and cosine similarity. Built with React, TypeScript, Vite, and Tailwind CSS. Zero backend required — ready for instant deployment on Vercel.

---

## ✦ Key Highlights

- **Zero Backend Required (100% Client-Side)**: Visual feature extraction, color quantization, and cosine similarity calculations run entirely inside the user's browser using HTML5 Canvas.
- **Vercel Edge Ready**: Pure frontend static SPA architecture. Connect your repository to Vercel and it deploys with zero build configuration.
- **Refined Minimalist White UI**: Designed with a Scandinavian / high-end fashion house aesthetic (pure white surfaces, subtle hairline borders, crisp typography, and zero cheesy AI gradients).
- **Multi-Modal Visual Search**:
  - **Drag & Drop / File Upload**: Supports JPG, PNG, WEBP files up to 10MB.
  - **Live Camera Snap**: Snap a live picture directly using your webcam or phone camera.
  - **Image URL Direct Input**: Paste any web image URL to instantly extract its features.
  - **1-Click Quick-Try Presets**: 8 curated sample items (Sneakers, Denim Jacket, Navy Shirt, Steel Watch, etc.) for instant testing.
  - **"Find Similar" on Any Product**: Click the visual search lens on any catalog product to immediately find similar pieces.
- **Visual Match Transparency**:
  - Displays query thumbnail alongside extracted dominant color palette swatches with percentages.
  - Granular breakdown of Match % (Color Harmony score, Silhouette/Texture alignment, and Overall Visual Similarity).
- **E-Commerce Features**:
  - Filter by Audience (Men, Women, Unisex) and Category (Topwear, Footwear, Outerwear, Watches, Bags, Accessories).
  - Sort by Visual Match, Rating, or Price (Low to High / High to Low).
  - Interactive Slide-Over Shopping Bag with free shipping progress meter.
  - Slide-Over Wishlist / Saved Items drawer.
  - Product Quick View Modal with specifications and size selector.

---

## ⚡ Technical Architecture

### 1. In-Browser 128D Feature Extraction
When an image is provided:
1. It is rendered onto an offscreen HTML5 `CanvasRenderingContext2D` with normalization.
2. **Color Histogram (64 dimensions)**: Quantized $4 \times 4 \times 4$ RGB color space capturing distribution across hue and tone.
3. **Spatial Grid Edge Moments (32 dimensions)**: Evaluates $4 \times 4$ spatial grid cells using Sobel gradient approximations to capture silhouette geometry and texture density.
4. **Dominant Color Centroids (16 dimensions)**: Extracts top clustered color centroids and percentage dominance.
5. **Global Statistics (16 dimensions)**: Aspect ratio, saturation, luminance, and contrast spread.
6. The combined vector is $L_2$-normalized:
   $$\hat{\mathbf{v}} = \frac{\mathbf{v}}{\|\mathbf{v}\|_2}$$

### 2. Multi-Objective Recommendation Ranking
$$\text{Similarity}(\mathbf{q}, \mathbf{p}) = 0.55 \cdot \text{CosineSim}(\mathbf{q}_v, \mathbf{p}_v) + 0.30 \cdot \text{ColorSim}(\mathbf{c}_q, \mathbf{c}_p) + 0.15 \cdot \text{TextureSim}(\mathbf{t}_q, \mathbf{t}_p)$$

Where:
$$\text{CosineSim}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\|_2 \|\mathbf{B}\|_2}$$

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (tested on Node v22)
- npm 9+

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/consoledotlognishant/Product-search-Recommendation-System.git
cd Product-search-Recommendation-System

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` to test the visual search and recommendation engine.

### Production Build

```bash
npm run build
```
The optimized bundle will be generated in `dist/`.

---

## ☁️ Deployment on Vercel

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the `Product-search-Recommendation-System` repository.
4. Vercel automatically detects the Vite framework and builds the project without requiring any custom environment variables or backend configuration!

---

## 📁 Repository Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/         # Clean UI components
│   │   ├── Navbar.tsx              # Sticky header with search, visual trigger & badges
│   │   ├── VisualSearchModal.tsx   # Modal for upload, webcam, URL & sample presets
│   │   ├── VisualSearchBanner.tsx  # Active query inspector & palette swatches
│   │   ├── FilterBar.tsx           # Category, audience and sort controls
│   │   ├── ProductCard.tsx         # Product card with match badge and quick actions
│   │   ├── ProductModal.tsx        # Quick view with similarity breakdown & size picker
│   │   ├── CartDrawer.tsx          # Slide-out shopping bag
│   │   ├── WishlistDrawer.tsx      # Slide-out saved items
│   │   └── Footer.tsx              # Architectural specs & credits
│   ├── data/
│   │   ├── products.ts             # Curated fashion catalog with precomputed 128D vectors
│   │   └── samples.ts              # One-click sample queries for instant testing
│   ├── types/
│   │   └── product.ts              # TypeScript interfaces for products and embeddings
│   ├── utils/
│   │   └── visualSearch.ts         # HTML5 Canvas feature extractor & similarity ranking
│   ├── App.tsx                     # Core application orchestrator
│   ├── main.tsx                    # React DOM entry
│   └── index.css                   # Tailwind CSS v4 styling
├── python-prototype/       # Legacy Python scripts (ResNet50 / Streamlit prototype)
├── vercel.json             # Vercel SPA routing configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📜 License
MIT License. Created by [Nishant](https://github.com/consoledotlognishant).
