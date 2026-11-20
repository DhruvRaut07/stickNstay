"use client";

import { useSyncExternalStore } from "react";
import { addItem, cartCount, parseCart, removeItem, setQty, type CartItem } from "./cart";

const STORAGE_KEY = "sns-cart";
const EMPTY: readonly CartItem[] = [];

const listeners = new Set<() => void>();
let memoryRaw: string | null = null; // fallback when localStorage is blocked
let cached: { raw: string | null; items: readonly CartItem[] } = { raw: null, items: EMPTY };

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryRaw;
  }
}

function getSnapshot(): readonly CartItem[] {
  const raw = readRaw();
  if (raw !== cached.raw) cached = { raw, items: parseCart(raw) };
  return cached.items;
}

const getServerSnapshot = (): readonly CartItem[] => EMPTY;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function write(items: readonly CartItem[]): void {
  const raw = items.length ? JSON.stringify(items) : null;
  memoryRaw = raw;
  try {
    if (raw) localStorage.setItem(STORAGE_KEY, raw);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage is blocked (private mode): the in-memory copy keeps the cart working this visit.
  }
  listeners.forEach((notify) => notify());
}

const subscribeNever = (): (() => void) => () => {};

/** The shared cart. State lives in localStorage so it survives reloads and syncs across tabs. */
export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // False on the server and during hydration, so pages can avoid flashing an empty cart.
  const ready = useSyncExternalStore(subscribeNever, () => true, () => false);
  return {
    ready,
    items,
    count: cartCount(items),
    add: (slug: string) => write(addItem(getSnapshot(), slug)),
    setQuantity: (slug: string, qty: number) => write(setQty(getSnapshot(), slug, qty)),
    remove: (slug: string) => write(removeItem(getSnapshot(), slug)),
    clear: () => write(EMPTY),
  };
}
