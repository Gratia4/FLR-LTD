"use client";

import {
  ArrowRight,
  BoxArrowDown,
  CaretDown,
  CheckCircle,
  Clock,
  Headset,
  Heart,
  List,
  LockKey,
  MagnifyingGlass,
  Minus,
  Package,
  Plus,
  ShoppingCartSimple,
  SignOut,
  Sparkle,
  Truck,
  UserCircle,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { money } from "@/lib/format";
import { usePortalSession } from "@/lib/use-session";
import { useToast } from "@/components/ui";

type Product = {
  id: string;
  name: string;
  brand_name: string;
  category: string | null;
  sku: string;
  size: string | null;
  image_urls: string[] | null;
  list_price_rwf: number | string;
  your_price_rwf: number | string;
  stock_status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER";
  stock_quantity: number;
  minimum_order_quantity: number;
  case_size: number;
};

type CartItem = {
  productId: string;
  sku: string;
  name: string;
  brandName: string;
  size: string | null;
  imageUrls: string[] | null;
  quantity: number;
  caseSize: number;
  minimumOrderQuantity: number;
  stockStatus: Product["stock_status"];
  stockQuantity: number;
  unitPriceRwf: number;
  lineTotalRwf: number;
};

type Cart = {
  items: CartItem[];
  totals: {
    subtotalRwf: number;
    vatRwf: number;
    discountRwf: number;
    deliveryFeeRwf: number;
    totalRwf: number;
  };
  tier?: { name: string; discountPercent: number };
  issues: Array<{ productId: string; message: string; available: number }>;
};

type CatalogueResponse = {
  data: Product[];
  tier: { name: string; discountPercent: number };
  total: number;
};

const emptyCart: Cart = {
  items: [],
  totals: { subtotalRwf: 0, vatRwf: 0, discountRwf: 0, deliveryFeeRwf: 0, totalRwf: 0 },
  issues: [],
};

const tones = ["peach", "orange", "mint", "blue", "lilac", "aqua", "green", "pink"];
const fallbackImages: Record<string, string> = {
  "Mother & Baby": "/products/mustela-cleansing-gel.png",
  "Skin Care": "/products/cleansing-gel.png",
  "Personal Care": "/products/body-lotion.png",
  Vitamins: "/products/vitamin-c.png",
  Supplements: "/products/omega-3.png",
  Hygiene: "/products/hand-gel.png",
  "Medical Supplies": "/products/nitrile-gloves.png",
};

function productImage(product: Pick<Product, "image_urls" | "category">) {
  return product.image_urls?.find(Boolean) ?? fallbackImages[product.category ?? ""] ?? "/products/body-lotion.png";
}

function cartImage(item: CartItem) {
  return item.imageUrls?.find(Boolean) ?? "/products/body-lotion.png";
}

function caseStep(product: Pick<Product, "case_size">) {
  return Math.max(1, product.case_size);
}

function minimumOrder(product: Pick<Product, "case_size" | "minimum_order_quantity">) {
  const step = caseStep(product);
  return Math.ceil(Math.max(1, product.minimum_order_quantity) / step) * step;
}

function lowerQuantity(product: Pick<Product, "case_size" | "minimum_order_quantity">, quantity: number) {
  const next = quantity - caseStep(product);
  return next < minimumOrder(product) ? 0 : next;
}

function stockLabel(product: Pick<Product, "stock_status" | "stock_quantity">) {
  if (product.stock_status === "PRE_ORDER") return "Available to pre-order";
  if (product.stock_status === "OUT_OF_STOCK") return "Out of stock";
  if (product.stock_status === "LOW_STOCK") return `Low stock · ${product.stock_quantity} left`;
  return "In stock";
}

export function Storefront() {
  const { user, loading: checkingSession, logout } = usePortalSession();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [tier, setTier] = useState<CatalogueResponse["tier"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All products");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([
      api.get<CatalogueResponse>("/api/v1/catalog/wholesale/products", { query: { limit: 100 } }),
      api.get<{ data: Cart }>("/api/v1/cart"),
    ])
      .then(([catalogue, basket]) => {
        if (!active) return;
        setProducts(catalogue.data);
        setTier(catalogue.tier);
        setCart(basket.data);
      })
      .catch((cause) => active && setError(errorMessage(cause, "The wholesale catalogue could not be loaded.")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user]);

  const categories = useMemo(
    () => ["All products", ...Array.from(new Set(products.map((product) => product.category).filter((item): item is string => !!item))).sort()],
    [products],
  );

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === "All products" || product.category === category;
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || `${product.name} ${product.brand_name} ${product.sku}`.toLowerCase().includes(needle);
    return matchesCategory && matchesQuery;
  }), [category, products, query]);

  const quantities = useMemo(
    () => Object.fromEntries(cart.items.map((item) => [item.productId, item.quantity])),
    [cart.items],
  );
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  async function setQuantity(productId: string, quantity: number) {
    setUpdating(productId);
    try {
      const result = await api.put<{ data: Cart }>("/api/v1/cart/items", { productId, quantity: Math.max(0, quantity) });
      setCart((current) => ({ ...result.data, tier: result.data.tier ?? current.tier }));
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setUpdating(null);
    }
  }

  async function checkout() {
    if (!cart.items.length || cart.issues.length) return;
    setCheckingOut(true);
    try {
      const order = await api.post<{ reference: string }>("/api/v1/orders", {});
      setCart(emptyCart);
      setCartOpen(false);
      toast.success(`Order ${order.reference} was submitted successfully.`);
    } catch (cause) {
      toast.error(errorMessage(cause, "Your order could not be submitted."));
    } finally {
      setCheckingOut(false);
    }
  }

  if (checkingSession || (user && loading)) {
    return <main className="portal-loading"><LockKey size={28}/><p>Loading your secure wholesale catalogue…</p></main>;
  }
  if (!user) return <main className="portal-loading"><LockKey size={28}/><p>Redirecting to secure login…</p></main>;

  return (
    <div className="site-shell">
      <div className="announcement">
        <span><Truck size={15} weight="bold" /> Reliable delivery across Rwanda</span>
        <span className="announcement-right"><Headset size={15} weight="bold" /> Need help? <strong>Contact your account manager</strong></span>
      </div>

      <header>
        <div className="header-main container">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu"><List size={25} /></button>
          <Link className="brand" href="/"><span className="brand-mark">F</span><span><b>FLR</b><small>WHOLESALE</small></span></Link>
          <label className="search">
            <MagnifyingGlass size={20} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product, brand or SKU..." />
          </label>
          <button className="header-action account" onClick={logout} title="Sign out"><UserCircle size={25} /><span><small>{tier ? `${tier.name} trade pricing` : "Approved partner"}</small><b>{user.businessName ?? user.fullName}</b></span><SignOut size={16}/></button>
          <button className="header-action cart-button" onClick={() => setCartOpen(true)}><ShoppingCartSimple size={26} /><span><small>{cartCount} {cartCount === 1 ? "unit" : "units"}</small><b>{money(cart.totals.totalRwf)}</b></span>{cartCount > 0 && <em>{cartCount}</em>}</button>
        </div>
        <nav className={menuOpen ? "open" : ""}>
          <div className="container nav-inner">
            <button className="all-products" onClick={() => setCategory("All products")}><List size={18} /> All products <CaretDown size={14} /></button>
            <a href="#categories">Categories</a><a href="#products">Catalogue</a><a href="#brands">Featured brand</a>
            <button className="nav-account" onClick={logout}><SignOut size={17} /> Sign out</button>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero hero-with-photo container">
          <Image className="hero-background" src="/hero/mustela-family-hero.png" alt="Smiling African family enjoying Mustela baby skincare" fill priority sizes="(max-width: 1220px) 100vw, 1180px" />
          <div className="hero-copy">
            <span className="eyebrow"><Sparkle size={15} weight="fill" /> Approved wholesale access</span>
            <h1>Everything your business needs, <i>all in one place.</i></h1>
            <p>Live stock, contractual RWF pricing, and dependable pharmaceutical supply for your business.</p>
            <div className="hero-actions"><a className="primary-button" href="#products">Shop products <ArrowRight size={18} /></a><button className="secondary-button" onClick={() => setCartOpen(true)}>Review your order</button></div>
            <div className="hero-proof"><span><CheckCircle weight="fill" /> Verified products</span><span><CheckCircle weight="fill" /> Your trade pricing</span><span><CheckCircle weight="fill" /> Rwanda delivery</span></div>
          </div>
        </section>

        <section className="benefits">
          <div className="container benefit-grid">
            <div><span className="benefit-icon"><BoxArrowDown /></span><p><b>{tier?.discountPercent ? `${tier.discountPercent}% tier discount` : "Contract pricing"}</b><small>{tier?.name ?? "Pricing for your account"}</small></p></div>
            <div><span className="benefit-icon"><Package /></span><p><b>{products.length} products online</b><small>Current approved catalogue</small></p></div>
            <div><span className="benefit-icon"><Truck /></span><p><b>Reliable fulfilment</b><small>From warehouse to your door</small></p></div>
            <div><span className="benefit-icon"><Clock /></span><p><b>Order anytime</b><small>Your portal is always open</small></p></div>
          </div>
        </section>

        <section className="catalog container" id="products">
          <div className="section-heading"><div><span className="kicker">Wholesale catalogue</span><h2>Available products</h2><p>Live stock and the prices assigned to your partner account.</p></div><button className="text-button section-cart-link" onClick={() => setCartOpen(true)}>Review cart <ArrowRight /></button></div>
          <div className="category-row" id="categories">
            {categories.map((item) => <button className={item === category ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          {error && <div className="catalog-feedback is-error"><WarningCircle/><span>{error}</span><button onClick={() => window.location.reload()}>Try again</button></div>}
          {!error && <div className="product-grid">
            {visibleProducts.map((product, index) => {
              const quantity = quantities[product.id] || 0;
              const step = caseStep(product);
              const firstQuantity = minimumOrder(product);
              const unavailable = product.stock_status === "OUT_OF_STOCK";
              const listPrice = Number(product.list_price_rwf);
              const price = Number(product.your_price_rwf);
              return <article className="product-card" key={product.id}>
                <div className={`product-image ${tones[index % tones.length]}`}>
                  {price < listPrice && <span className="badge">Trade price</span>}
                  <button className="heart" aria-label="Add to favourites"><Heart /></button>
                  {/* Product images are managed in the admin catalogue and may use an approved external CDN. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="product-photo" src={productImage(product)} alt={product.name} />
                </div>
                <div className="product-info">
                  <small className="brand-name">{product.brand_name}</small><h3>{product.name}</h3>
                  <p className="sku">SKU {product.sku}{product.size ? ` · ${product.size}` : ""}</p>
                  <div className="pack"><Package size={16} /> {product.case_size > 1 ? `Case of ${product.case_size}` : `Minimum ${product.minimum_order_quantity} unit${product.minimum_order_quantity === 1 ? "" : "s"}`}</div>
                  <div className="stock"><i className={product.stock_status === "LOW_STOCK" || unavailable ? "low" : ""} /> {stockLabel(product)}</div>
                  <div className="price-row"><div>{price < listPrice && <del>{money(listPrice)}</del>}<strong>{money(price)}</strong><small>per unit</small></div></div>
                  {quantity ? <div className="quantity-control"><button disabled={updating === product.id} onClick={() => setQuantity(product.id, lowerQuantity(product, quantity))}><Minus /></button><span>{updating === product.id ? "Updating…" : `${quantity} unit${quantity === 1 ? "" : "s"}`}</span><button disabled={updating === product.id} onClick={() => setQuantity(product.id, quantity + step)}><Plus /></button></div> : <button className="add-button" disabled={unavailable || updating === product.id} onClick={() => setQuantity(product.id, firstQuantity)}><ShoppingCartSimple /> {unavailable ? "Out of stock" : updating === product.id ? "Adding…" : `Add ${firstQuantity > 1 ? firstQuantity : "to cart"}`}</button>}
                </div>
              </article>;
            })}
          </div>}
          {!error && !visibleProducts.length && <div className="empty-state"><MagnifyingGlass size={32} /><h3>No products found</h3><p>Try another search or category.</p></div>}
        </section>

        <section className="brand-feature container" id="brands">
          <div className="brand-feature-copy"><span className="kicker">Featured brand</span><h2>Mustela baby care</h2><p>Explore gentle skin, bath, and body care for babies and children—all available through your FLR wholesale account.</p><button onClick={() => { setCategory("Mother & Baby"); document.querySelector("#products")?.scrollIntoView(); }}>Explore the range <ArrowRight /></button></div>
          <div className="brand-feature-image"><Image src="/products/mustela-baby-range.png" alt="Mustela baby care product range" width={500} height={500} sizes="(max-width: 700px) 90vw, 500px" /></div>
        </section>

        <section className="trade-banner container"><div><span className="kicker">Your FLR partner account</span><h2>Need help with a large or special order?</h2><p>Your account manager can help with availability, delivery planning, cold-chain products, and quotations.</p></div><Link className="light-button" href="/contact">Contact FLR <ArrowRight /></Link></section>
      </main>

      <footer><div className="container"><Link className="brand inverse" href="/"><span className="brand-mark">F</span><span><b>FLR</b><small>WHOLESALE</small></span></Link><p>Reliable supply. Better business.</p><span>© 2026 FLR Ltd. All rights reserved.</span></div></footer>

      {cartOpen && <><button className="drawer-backdrop" onClick={() => setCartOpen(false)} aria-label="Close cart" /><aside className="cart-drawer"><div className="drawer-heading"><div><span className="kicker">Your order</span><h2>Wholesale cart</h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X /></button></div>{cart.items.length ? <><div className="cart-items">{cart.items.map((item) => { const issue = cart.issues.find((candidate) => candidate.productId === item.productId); return <div className="cart-item-wrap" key={item.productId}><div className="cart-item"><div className="cart-thumb mint">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={cartImage(item)} alt="" /></div><div><b>{item.name}</b><small>{item.size ?? item.sku} · {item.caseSize > 1 ? `case of ${item.caseSize}` : "single units"}</small><div className="mini-quantity"><button disabled={updating === item.productId} onClick={() => setQuantity(item.productId, lowerQuantity({ case_size: item.caseSize, minimum_order_quantity: item.minimumOrderQuantity }, item.quantity))}><Minus /></button><span>{item.quantity}</span><button disabled={updating === item.productId} onClick={() => setQuantity(item.productId, item.quantity + caseStep({ case_size: item.caseSize }))}><Plus /></button></div></div><strong>{money(item.lineTotalRwf)}</strong></div>{issue && <small className="cart-issue"><WarningCircle/>{issue.message}</small>}</div>; })}</div><div className="cart-summary"><span>Subtotal <b>{money(cart.totals.subtotalRwf)}</b></span>{cart.totals.discountRwf > 0 && <span className="cart-discount">Discount <b>−{money(cart.totals.discountRwf)}</b></span>}<span>VAT <b>{money(cart.totals.vatRwf)}</b></span><span className="cart-total">Order total <b>{money(cart.totals.totalRwf)}</b></span><small>Stock and account credit are validated when the order is submitted.</small><button className="primary-button" disabled={checkingOut || !!cart.issues.length} onClick={checkout}>{checkingOut ? "Submitting order…" : cart.issues.length ? "Resolve stock issues" : <>Submit order <ArrowRight /></>}</button><button className="text-button" onClick={() => setCartOpen(false)}>Continue shopping</button></div></> : <div className="empty-cart"><ShoppingCartSimple size={40} /><h3>Your cart is empty</h3><p>Add products from the catalogue to begin.</p></div>}</aside></>}
    </div>
  );
}
