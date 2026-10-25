"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "../data/products";

export default function HeroSection({ products, onExplore }: { products: Product[]; onExplore: () => void }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = products.slice(0, 4);
  const product = slides[activeSlide];
  const move = (step: number) => setActiveSlide((activeSlide + step + slides.length) % slides.length);

  return <section className="hero-shell">
    <div className="hero-copy">
      <div className="drop-meta"><span>GOOD STUFF // LIVE</span><span>IN STOCK · SHIPS 24H</span></div>
      <p className="eyebrow">THE CURATED EVERYDAY</p>
      <h1>Better things for <em>your</em> everyday.</h1>
      <p className="hero-description">Thoughtful finds, beautifully designed. Discover objects that bring a little more ease and joy to the way you live.</p>
      <div className="hero-actions"><a className="primary-button" href="#collection">Shop the collection <span>↗</span></a><button className="hero-secondary-button" onClick={onExplore}>Explore lifestyle <span>→</span></button></div>
      <div className="hero-drop-footer"><div><small>FEATURED FROM</small><strong>${product.price.toFixed(2)}</strong></div></div>
    </div>
    <div className="hero-showcase" aria-label="Featured products">
      <div className="showcase-glow" />
      <div className="showcase-card showcase-card-back"><ImagePreview src={slides[(activeSlide + 1) % slides.length].image} alt="" /></div>
      <div className="showcase-card showcase-card-main"><ImagePreview src={product.image} alt={product.title} /><div className="showcase-label"><span>FEATURED DROP</span><strong>{product.title}</strong><small>${product.price.toFixed(2)}</small></div></div>
      <div className="showcase-controls"><button aria-label="Previous featured product" onClick={() => move(-1)}>←</button><div>{slides.map((item, index) => <button key={item.id} aria-label={`Show ${item.title}`} className={index === activeSlide ? "active" : ""} onClick={() => setActiveSlide(index)} />)}</div><button aria-label="Next featured product" onClick={() => move(1)}>→</button></div>
      <span className="showcase-orbit orbit-one" /><span className="showcase-orbit orbit-two" />
    </div>
  </section>;
}

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill sizes="(max-width: 900px) 90vw, 430px" />;
}
