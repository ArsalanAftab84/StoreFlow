"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "../data/products";

const categoryIcons: Record<string, string> = { All: "✦", Tech: "⌁", Audio: "◉", Workspace: "▦", Home: "⌂", Lifestyle: "◇" };
const categories = ["All", "Tech", "Audio", "Workspace", "Home", "Lifestyle"];

export default function CatalogSection({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const visible = useMemo(() => products.filter((product) => activeCategory === "All" || product.category === activeCategory).filter((product) => `${product.title} ${product.description}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : a.id - b.id), [activeCategory, products, search, sort]);

  return <section className="collection-section" id="collection">
    <div className="section-heading"><div><p className="eyebrow">FIND YOUR NEXT FAVORITE</p><h2>Shop the collection</h2></div><div className="catalog-controls"><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." aria-label="Search products" /></label><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div></div>
    <div className="category-row">{categories.map((category) => <button key={category} className={activeCategory === category ? "category-pill active" : "category-pill"} onClick={() => setActiveCategory(category)}><span>{categoryIcons[category]}</span>{category}</button>)}</div>
    <div className="product-grid">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    {!visible.length && <div className="empty-state"><span>⌕</span><h3>No treasures found</h3><p>Try another search or browse all categories.</p><button onClick={() => { setSearch(""); setActiveCategory("All"); }}>Clear filters</button></div>}
  </section>;
}
