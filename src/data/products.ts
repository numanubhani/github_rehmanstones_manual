// src/data/products.ts

export type Product = {
  id: number | string;
  name: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: "ring" | "gemstone" | "bracelet";
  brand: string;
  rating?: number;
  ratingCount?: number;
  sku?: string;
  description?: string;
  highlights?: string[];
  specs?: Record<string, string>;

  /** ---------- Admin / Inventory helpers (optional) ---------- */
  sizes?: number[];          // rings & bracelets (11–40)
  stock?: number;            // total available units
  active?: boolean;          // toggle visibility
  createdAt?: string;        // ISO timestamp
};

/** Ring sizes 11–40 for quick reuse */
export const RING_SIZES: number[] = Array.from({ length: 30 }, (_, i) => i + 11);

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Silver Band Ring",
    price: 3500,
    oldPrice: 4500,
    images: [
      "https://images.unsplash.com/photo-1546456073-6712f79251bb?q=80&w=1200",
      "https://images.unsplash.com/photo-1518544801976-3e1ee0bc8eaf?q=80&w=1200",
      "https://images.unsplash.com/photo-1603575448937-7abdc0ed9121?q=80&w=1200",
    ],
    category: "ring",
    brand: "Rehman Stones",
    rating: 4.6,
    ratingCount: 311,
    sku: "RS-0001",
    description:
      "Classic 925 sterling silver band ring with high-polish finish. Nickel-free and hypoallergenic.",
    highlights: ["925 Sterling Silver", "Hand-polished", "Hypoallergenic"],
    specs: { Material: "Silver 925", Finish: "High Polish", Weight: "3.2g" },
    sizes: RING_SIZES,
    stock: 48,
    active: true,
    createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    name: "Celtic Knot Ring",
    price: 5200,
    oldPrice: 6900,
    images: [
      "https://images.unsplash.com/photo-1603566234499-3778f2f4f3c3?q=80&w=1200",
      "https://images.unsplash.com/photo-1617038260897-3c81e3f8c2eb?q=80&w=1200",
    ],
    category: "ring",
    brand: "Rehman Stones",
    rating: 4.8,
    ratingCount: 626,
    sku: "RS-0002",
    description:
      "Intricate Celtic knot design cast in solid 925 silver. Comfortable inner band.",
    highlights: ["Celtic motif", "Comfort fit", "Anti-tarnish coat"],
    specs: { Material: "Silver 925", Width: "4.5mm" },
    sizes: RING_SIZES,
    stock: 32,
    active: true,
    createdAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 3,
    name: "Amethyst Oval Gem",
    price: 7800,
    oldPrice: 8800,
    images: [
      "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=1200",
      "https://images.unsplash.com/photo-1603575448937-7abdc0ed9121?q=80&w=1200",
    ],
    category: "gemstone",
    brand: "Certified",
    rating: 4.7,
    ratingCount: 111,
    sku: "RS-GEM-001",
    description: "Natural amethyst oval-cut, suitable for 925 silver settings.",
    highlights: ["Natural stone", "Oval cut", "Certificate included"],
    specs: { Carat: "2.1ct", Cut: "Oval", Color: "Purple" },
    stock: 14,
    active: true,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 4,
    name: "Garnet Cushion Gem",
    price: 6500,
    images: [
      "https://images.unsplash.com/photo-1589674788336-2a25f2a1e0c0?q=80&w=1200",
    ],
    category: "gemstone",
    brand: "Certified",
    rating: 4.5,
    ratingCount: 387,
    sku: "RS-GEM-002",
    description: "Deep red garnet, cushion-cut. Ideal for everyday wear.",
    highlights: ["Durable", "Cushion cut", "Rich color"],
    specs: { Carat: "1.8ct", Cut: "Cushion", Color: "Deep Red" },
    stock: 20,
    active: true,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 5,
    name: "Signet Silver Ring",
    price: 6900,
    oldPrice: 8200,
    images: [
      "https://images.unsplash.com/photo-1617038260897-3c81e3f8c2eb?q=80&w=1200",
    ],
    category: "ring",
    brand: "Rehman Stones",
    rating: 4.6,
    ratingCount: 1227,
    sku: "RS-0005",
    description: "Bold signet ring in 925 silver. Optional engraving.",
    highlights: ["Engravable", "Solid face", "Nickel-free"],
    specs: { Face: "12mm", Weight: "6.8g" },
    sizes: RING_SIZES,
    stock: 18,
    active: true,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 6,
    name: "Turquoise Gem",
    price: 8200,
    images: [
      "https://images.unsplash.com/photo-1603575448937-7abdc0ed9121?q=80&w=1200",
    ],
    category: "gemstone",
    brand: "Certified",
    rating: 4.9,
    ratingCount: 585,
    sku: "RS-GEM-003",
    description: "Natural turquoise with classic matrix.",
    highlights: ["Stabilized", "Vibrant hue"],
    specs: { Carat: "2.3ct", Origin: "Nishapur" },
    stock: 11,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export const getProductById = (id: string | number) =>
  PRODUCTS.find((p) => String(p.id) === String(id));

export const getRelated = (p: Product) =>
  PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 5);

/** Simple helper for admin screens (optional) */
export const listProducts = () => PRODUCTS;
