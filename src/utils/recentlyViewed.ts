// src/utils/recentlyViewed.ts

const MAX_RECENT = 10;
const LS_KEY = "recently_viewed";

export type RecentProduct = {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category: "ring" | "gemstone";
  viewedAt: string;
};

export function addRecentlyViewed(product: Omit<RecentProduct, "viewedAt">) {
  const recent = getRecentlyViewed();
  
  // Remove if already exists
  const filtered = recent.filter((p) => p.id !== product.id);
  
  // Add to front
  const updated = [
    { ...product, viewedAt: new Date().toISOString() },
    ...filtered,
  ].slice(0, MAX_RECENT);
  
  localStorage.setItem(LS_KEY, JSON.stringify(updated));
}

export function getRecentlyViewed(): RecentProduct[] {
  try {
    const data = localStorage.getItem(LS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearRecentlyViewed() {
  localStorage.removeItem(LS_KEY);
}

