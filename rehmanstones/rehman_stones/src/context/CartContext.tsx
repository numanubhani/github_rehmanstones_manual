import { createContext, useContext, useEffect, useMemo, useState } from "react";
// NEW
import toast from "react-hot-toast";

export type CartItem = {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category: "ring" | "gemstone";
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: CartItem["id"]) => void;
  setQty: (id: CartItem["id"], qty: number) => void;
  clear: () => void;
  totalQty: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);
const LS_KEY = "cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const api: CartContextType = useMemo(() => {
    const addItem: CartContextType["addItem"] = (item, qty = 1) => {
      setItems((prev) => {
        const i = prev.findIndex((p) => p.id === item.id);
        if (i >= 0) {
          const copy = [...prev];
          copy[i] = { ...copy[i], qty: copy[i].qty + qty };
          return copy;
        }
        return [...prev, { ...item, qty }];
      });

      // Toast confirmation
      toast.success(`${item.name} added to cart${qty > 1 ? ` ×${qty}` : ""}`);
    };

    const removeItem = (id: CartItem["id"]) =>
      setItems((prev) => prev.filter((p) => p.id !== id));

    const setQty = (id: CartItem["id"], qty: number) =>
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p))
      );

    const clear = () => setItems([]);

    const totalQty = items.reduce((s, p) => s + p.qty, 0);
    const totalPrice = items.reduce((s, p) => s + p.qty * p.price, 0);

    return { items, addItem, removeItem, setQty, clear, totalQty, totalPrice };
  }, [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
