export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  stock_quantity?: number;
  category_id?: number;
  category?: string;
  badge?: string;
  accent: string;
  icon: string;
  image: string;
};

const images = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85",
];

const details = [
  ["Halo Wireless Headphones", "Immersive noise-cancelling audio with all-day comfort.", 149, "Audio", "Bestseller", "violet", "◉"],
  ["Lumen Desk Lamp", "A warm, adjustable glow for focused work and slow evenings.", 68, "Workspace", "New in", "amber", "◒"],
  ["Terra Carryall Tote", "Recycled canvas, considered pockets, ready for every day.", 54, "Lifestyle", "Staff pick", "sage", "◇"],
  ["Orbit Smart Watch", "Your health, messages and movement in one elegant place.", 219, "Tech", "Trending", "sky", "◌"],
  ["Cloud Knit Throw", "Soft textured cotton made for cozy corners and quiet mornings.", 86, "Home", undefined, "rose", "✦"],
  ["Cove Ceramic Set", "Hand-finished stoneware to make everyday rituals feel special.", 74, "Home", undefined, "terracotta", "◍"],
  ["Pulse Portable Speaker", "Room-filling sound in a compact, weather-ready design.", 95, "Audio", undefined, "indigo", "◉"],
  ["Form Everyday Backpack", "Streamlined storage for commutes, weekends and everywhere between.", 128, "Lifestyle", undefined, "teal", "△"],
  ["Moss Glass Bottle", "Double-wall insulation keeps your drink perfectly refreshing.", 32, "Lifestyle", undefined, "green", "♢"],
  ["Focus Mechanical Keyboard", "Tactile keys and a satisfying rhythm for your best ideas.", 139, "Workspace", undefined, "plum", "▦"],
  ["Arc Charging Dock", "A beautiful home for your devices, cables and daily reset.", 49, "Tech", undefined, "blue", "⌁"],
  ["Sol Linen Cushion", "Easy texture and sun-washed color for an instant refresh.", 42, "Home", undefined, "coral", "✹"],
] as const;

export const featuredProducts: Product[] = details.map((item, index) => ({
  id: 101 + index, title: item[0], description: item[1], price: item[2],
  category: item[3], badge: item[4], accent: item[5], icon: item[6], image: images[index],
}));

export function decorateProduct(product: Partial<Product>, index: number): Product {
  const fallback = featuredProducts[index % featuredProducts.length];
  return { ...fallback, ...product, id: Number(product.id ?? fallback.id), price: Number(product.price ?? fallback.price),
    title: product.title ?? fallback.title, description: product.description ?? fallback.description,
    accent: product.accent ?? fallback.accent, icon: product.icon ?? fallback.icon, image: product.image ?? fallback.image };
}

export async function loadProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CATALOG_API}/products`);
    if (!response.ok) throw new Error("Catalog unavailable");
    return ((await response.json()) as Partial<Product>[]).map(decorateProduct);
  } catch {
    return [];
  }
}
