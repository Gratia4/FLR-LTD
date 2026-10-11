"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER";

export type CartItem = {
  productId: string;
  sku: string;
  name: string;
  brandName: string;
  size: string | null;
  imageUrls: string[] | null;
  quantity: number;
  caseSize: number;
  minimumOrderQuantity: number;
  stockStatus: StockStatus;
  stockQuantity: number;
  unitPriceRwf: number;
  lineTotalRwf: number;
};

export type Cart = {
  items: CartItem[];
  totals: { subtotalRwf: number; vatRwf: number; discountRwf: number; deliveryFeeRwf: number; totalRwf: number };
  tier?: { name: string; discountPercent: number };
  issues: Array<{ productId: string; message: string; available: number }>;
};

export const emptyCart: Cart = {
  items: [],
  totals: { subtotalRwf: 0, vatRwf: 0, discountRwf: 0, deliveryFeeRwf: 0, totalRwf: 0 },
  issues: [],
};

/* ------------------------- case-size quantity rules ------------------------ */

type PackRules = { case_size: number; minimum_order_quantity: number };
export const caseStep = (product: Pick<PackRules, "case_size">) => Math.max(1, product.case_size);
/** The smallest orderable quantity: the MOQ rounded up to whole cases. */
export const minimumOrder = (product: PackRules) => Math.ceil(Math.max(1, product.minimum_order_quantity) / caseStep(product)) * caseStep(product);
/** One case less, or zero once that would drop below the minimum. */
export const lowerQuantity = (product: PackRules, quantity: number) => {
  const next = quantity - caseStep(product);
  return next < minimumOrder(product) ? 0 : next;
};

/* --------------------------------- context -------------------------------- */

type CartApi = {
  cart: Cart;
  loading: boolean;
  /** Product id currently being updated, if any. */
  updating: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  reload: () => Promise<void>;
  checkout: () => Promise<string | null>;
  checkingOut: boolean;
  count: number;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const reload = useCallback(async () => {
    try {
      const result = await api.get<{ data: Cart }>("/api/v1/cart");
      setCart(result.data);
    } catch (cause) {
      toast.error(errorMessage(cause, "Your cart could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void reload();
  }, [enabled, reload]);

  const setQuantity = useCallback(async (productId: string, quantity: number) => {
    setUpdating(productId);
    try {
      const result = await api.put<{ data: Cart }>("/api/v1/cart/items", { productId, quantity: Math.max(0, quantity) });
      setCart((current) => ({ ...result.data, tier: result.data.tier ?? current.tier }));
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setUpdating(null);
    }
  }, []);

  const checkout = useCallback(async () => {
    if (!cart.items.length || cart.issues.length) return null;
    setCheckingOut(true);
    try {
      const order = await api.post<{ reference: string }>("/api/v1/orders", {});
      setCart(emptyCart);
      return order.reference;
    } catch (cause) {
      toast.error(errorMessage(cause, "Your order could not be submitted."));
      return null;
    } finally {
      setCheckingOut(false);
    }
  }, [cart.items.length, cart.issues.length]);

  const value = useMemo<CartApi>(
    () => ({
      cart,
      loading,
      updating,
      open,
      setOpen,
      setQuantity,
      reload,
      checkout,
      checkingOut,
      count: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [cart, loading, updating, open, setQuantity, reload, checkout, checkingOut],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}
