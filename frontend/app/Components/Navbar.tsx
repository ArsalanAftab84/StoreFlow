"use client";

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';

const themeListeners = new Set<() => void>();
const getTheme = () => typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark';
const subscribeToTheme = (listener: () => void) => {
    themeListeners.add(listener);
    return () => themeListeners.delete(listener);
};
const setTheme = (dark: boolean) => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    window.localStorage.setItem('good-stuff-theme', dark ? 'dark' : 'light');
    themeListeners.forEach((listener) => listener());
};

export default function Navbar() {
    const { openCart, items } = useCartStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);
    const isDarkMode = useSyncExternalStore(subscribeToTheme, getTheme, () => false);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (Math.abs(currentScrollY - lastScrollY) < 5) return;

            if (currentScrollY < 20 || currentScrollY < lastScrollY) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setMobileOpen(false);
            }
            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Calculate total items (accounting for quantities)
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className={`reference-nav ${isVisible ? 'nav-visible' : 'nav-hidden'}`}>
            <div className={`reference-nav-inner ${isVisible ? 'nav-interactive' : 'nav-inert'}`}>
                    <div className="reference-mobile-left">
                        <button
                            className="mobile-menu-button"
                            onClick={() => setMobileOpen((open) => !open)}
                            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                            aria-expanded={mobileOpen}
                        >
                            <span className={mobileOpen ? "menu-glyph is-open" : "menu-glyph"}>{mobileOpen ? "×" : "☰"}</span>
                        </button>
                    </div>
                    <Link href="/" className="reference-logo" aria-label="Good Stuff home">
                        <span>Storeflow</span>
                    </Link>
                    <div className="reference-links">
                        <a href="#collection">Shop</a>
                        <a href="#collection">New arrivals</a>
                        <a href="#collection">Categories</a>
                        <a href="#collection">Our story</a>
                    </div>
                    <div className="reference-actions">
                    <button
                        className="theme-button"
                        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        aria-pressed={isDarkMode}
                        onClick={() => setTheme(!isDarkMode)}
                    >
                        {isMounted ? (isDarkMode ? "☀" : "☾") : "◐"}
                    </button>
                    <button
                        onClick={openCart}
                        className="connect-button"
                    >
                        Cart <span className="bag-icon">◌</span>
                        {isMounted && itemCount > 0 && (
                            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                {itemCount}
                            </span>
                        )}
                    </button>
                    </div>
            </div>
            <div className={`mobile-nav-menu ${mobileOpen ? 'mobile-nav-open' : 'mobile-nav-closed'}`}>
                    <a href="#collection" onClick={() => setMobileOpen(false)}>Shop</a>
                    <a href="#collection" onClick={() => setMobileOpen(false)}>New arrivals</a>
                    <a href="#collection" onClick={() => setMobileOpen(false)}>Categories</a>
                    <a href="#collection" onClick={() => setMobileOpen(false)}>Our story</a>
                </div>
        </nav>
    );
}