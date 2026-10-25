"use client";

import { useEffect, useState } from "react";
import AIChatWidget from "./Components/AIChatWidget";
import CatalogSection from "./Components/CatalogSection";
import HeroSection from "./Components/HeroSection";
import ValueStrip from "./Components/ValueStrip";
import { featuredProducts, loadProducts, type Product } from "./data/products";

export default function Storefront() {
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  useEffect(() => { loadProducts().then(setApiProducts); }, []);

  const products = apiProducts.length
    ? [...apiProducts, ...featuredProducts.filter((fallback) => !apiProducts.some((product) => product.id === fallback.id))]
    : featuredProducts;

  return <main className="storefront">
    <HeroSection products={featuredProducts} onExplore={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })} />
    <ValueStrip />
    <CatalogSection products={products} />
    <AIChatWidget />
  </main>;
}
