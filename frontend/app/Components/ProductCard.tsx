"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import { useEffect, useState } from "react";

type ProductCardProps = {
  product: {
    id: number;
    title: string;
    description: string;
    price: number;
    category?: string;
    stock_quantity?: number;
    badge?: string;
    accent: string;
    icon: string;
    image: string;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdded, setIsAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isLowStock = product.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity < 5;

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
    <article
      className="product-card"
      role="button"
      tabIndex={0}
      onClick={() => setIsOpen(true)}
      onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && setIsOpen(true)}
      aria-label={`View details for ${product.title}`}
    >
      <div className={`product-visual ${product.accent}`}>
        <Image className="product-image" src={product.image} alt={product.title} fill sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw" />
        <span className="quick-view">Quick view ↗</span>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className="wishlist" aria-label={`Save ${product.title}`} onClick={(event) => event.stopPropagation()}>♡</button>
      </div>
      <div className="product-info">
        <div className="product-title-row"><h3>{product.title}</h3><span className="rating">★ 4.8</span></div>
        <p>{product.description}</p>
        <div className="product-bottom"><div><strong>${product.price.toFixed(2)}</strong>{isLowStock && <small>Only {product.stock_quantity} left</small>}</div><button className="add-button" aria-label={`Add ${product.title} to cart`} onClick={(event) => { event.stopPropagation(); addToCart({ id: product.id, title: product.title, price: product.price }); setIsAdded(true); window.setTimeout(() => setIsAdded(false), 1400); }}>{isAdded ? "Added" : "Add"} <span>{isAdded ? "✓" : "+"}</span></button></div>
      </div>
    </article>
    {isOpen && (
      <div className="quick-view-backdrop" role="presentation" onClick={() => setIsOpen(false)}>
        <div className="quick-view-modal" role="dialog" aria-modal="true" aria-label={product.title} onClick={(event) => event.stopPropagation()}>
          <button className="quick-view-close" aria-label="Close product details" onClick={() => setIsOpen(false)}>×</button>
          <div className="quick-view-image"><Image src={product.image} alt={product.title} fill sizes="(max-width: 700px) 90vw, 380px" /></div>
          <div className="quick-view-copy"><span className="eyebrow">{product.category ?? "CURATED PICK"}</span><h2>{product.title}</h2><p>{product.description}</p><strong>${product.price.toFixed(2)}</strong><button className="modal-add" onClick={() => { addToCart({ id: product.id, title: product.title, price: product.price }); setIsOpen(false); }}>Add to bag <span>↗</span></button></div>
        </div>
      </div>
    )}
    </>
  );
}
