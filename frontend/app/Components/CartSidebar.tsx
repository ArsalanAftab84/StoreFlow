"use client";

import { useCartStore } from '@/store/cartStore';
import { useSyncExternalStore } from 'react';

export default function CartSidebar() {
  const { isCartOpen, closeCart, items, increaseQuantity, decreaseQuantity, removeFromCart, totalPrice } = useCartStore();
  
  // Hydration check to prevent Next.js SSR mismatch with persisted state
  const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  if (!isMounted) return null;

  return (
    <>
      {/* Dark Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Sliding Sidebar */}
      <aside
        aria-label="Shopping cart"
        className={`cart-panel fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Your Bag <span className="text-sm font-normal text-gray-400">({items.reduce((sum, item) => sum + item.quantity, 0)})</span></h2>
            <button aria-label="Close shopping cart" onClick={closeCart} className="text-gray-400 hover:text-gray-700 p-2">
              ✕
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 items-center bg-gray-50 p-4 rounded-lg">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <button aria-label={`Decrease ${item.title} quantity`} onClick={() => decreaseQuantity(item.id)} className="h-6 w-6 rounded-full border text-gray-600 hover:bg-white">−</button>
                      <span className="min-w-4 text-center text-sm text-gray-600">{item.quantity}</span>
                      <button aria-label={`Increase ${item.title} quantity`} onClick={() => increaseQuantity(item.id)} className="h-6 w-6 rounded-full border text-gray-600 hover:bg-white">+</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Checkout */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">${totalPrice().toFixed(2)}</span>
            </div>
            <button 
              disabled={items.length === 0}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Checkout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}