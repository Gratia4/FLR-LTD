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
  MagnifyingGlass,
  Minus,
  Package,
  Plus,
  ShoppingCartSimple,
  SignIn,
  Sparkle,
  Truck,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  sku: string;
  pack: string;
  price: number;
  oldPrice?: number;
  stock: "In stock" | "Low stock";
  tone: string;
  initials: string;
  image: string;
  badge?: string;
};

const products: Product[] = [
  { id: 1, name: "Daily Care Body Lotion", brand: "DERMALUX", category: "Personal Care", sku: "FLR-10482", pack: "12 × 400 ml", price: 86.4, oldPrice: 96, stock: "In stock", tone: "peach", initials: "DL", image: "/products/body-lotion.png", badge: "10% off" },
  { id: 2, name: "Vitamin C 1000 mg", brand: "VITAWELL", category: "Vitamins", sku: "FLR-21557", pack: "24 × 30 tablets", price: 124.8, stock: "In stock", tone: "orange", initials: "C+", image: "/products/vitamin-c.png", badge: "Bestseller" },
  { id: 3, name: "Gentle Cleansing Gel", brand: "PURESKIN", category: "Skin Care", sku: "FLR-38614", pack: "12 × 250 ml", price: 72, stock: "In stock", tone: "mint", initials: "PS", image: "/products/cleansing-gel.png" },
  { id: 4, name: "Disposable Nitrile Gloves", brand: "MEDIGUARD", category: "Medical Supplies", sku: "FLR-41205", pack: "10 × 100 pieces", price: 59.5, stock: "Low stock", tone: "blue", initials: "MG", image: "/products/nitrile-gloves.png" },
  { id: 5, name: "Nourishing Cleansing Gel with Cold Cream", brand: "MUSTELA", category: "Mother & Baby", sku: "FLR-52031", pack: "12 × 300 ml", price: 48.6, stock: "In stock", tone: "lilac", initials: "MU", image: "/products/mustela-cleansing-gel.png", badge: "New" },
  { id: 6, name: "Omega 3 Fish Oil", brand: "NUTRILIFE", category: "Supplements", sku: "FLR-60844", pack: "12 × 60 capsules", price: 108, stock: "In stock", tone: "aqua", initials: "Ω3", image: "/products/omega-3.png" },
  { id: 7, name: "Antiseptic Hand Gel", brand: "SAFEHANDS", category: "Hygiene", sku: "FLR-71933", pack: "24 × 100 ml", price: 43.2, oldPrice: 48, stock: "In stock", tone: "green", initials: "SH", image: "/products/hand-gel.png", badge: "10% off" },
  { id: 8, name: "Digital Thermometer", brand: "MEDITECH", category: "Medical Supplies", sku: "FLR-82719", pack: "20 units", price: 78, stock: "In stock", tone: "pink", initials: "MT", image: "/products/thermometer.png" },
];

const categories = ["All products", "Personal Care", "Vitamins", "Skin Care", "Medical Supplies", "Mother & Baby", "Supplements", "Hygiene"];

export function Storefront() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All products");
  const [cart, setCart] = useState<Record<number, number>>({ 2: 1 });
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === "All products" || product.category === category;
    const needle = query.toLowerCase();
    const matchesQuery = product.name.toLowerCase().includes(needle) || product.brand.toLowerCase().includes(needle) || product.sku.toLowerCase().includes(needle);
    return matchesCategory && matchesQuery;
  }), [category, query]);

  const cartItems = products.filter((product) => cart[product.id]);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = cartItems.reduce((sum, product) => sum + product.price * cart[product.id], 0);

  function updateCart(id: number, amount: number) {
    setCart((current) => {
      const quantity = Math.max(0, (current[id] || 0) + amount);
      const next = { ...current, [id]: quantity };
      if (!quantity) delete next[id];
      return next;
    });
  }

  return (
    <div className="site-shell">
      <div className="announcement">
        <span><Truck size={15} weight="bold" /> Free delivery on orders over $500</span>
        <span className="announcement-right"><Headset size={15} weight="bold" /> Need help? <strong>Contact your account manager</strong></span>
      </div>

      <header>
        <div className="header-main container">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu"><List size={25} /></button>
          <a className="brand" href="#"><span className="brand-mark">F</span><span><b>FLR</b><small>WHOLESALE</small></span></a>
          <label className="search">
            <MagnifyingGlass size={20} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product, brand or SKU..." />
          </label>
          <button className="header-action account"><UserCircle size={25} /><span><small>Welcome back</small><b>Sign in / Register</b></span></button>
          <button className="header-action cart-button" onClick={() => setCartOpen(true)}><ShoppingCartSimple size={26} /><span><small>{cartCount} {cartCount === 1 ? "case" : "cases"}</small><b>${cartTotal.toFixed(2)}</b></span>{cartCount > 0 && <em>{cartCount}</em>}</button>
        </div>
        <nav className={menuOpen ? "open" : ""}>
          <div className="container nav-inner">
            <button className="all-products" onClick={() => setCategory("All products")}><List size={18} /> All products <CaretDown size={14} /></button>
            <a href="#categories">Categories</a><a href="#new">New arrivals</a><a href="#offers">Special offers</a><a href="#brands">Brands</a><a href="#orders">Quick order</a>
            <a className="nav-account" href="#account"><SignIn size={17} /> Account portal</a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero hero-with-photo container">
          <Image className="hero-background" src="/hero/mustela-family-hero.png" alt="Smiling African family enjoying Mustela baby skincare" fill priority sizes="(max-width: 1220px) 100vw, 1180px" />
          <div className="hero-copy">
            <span className="eyebrow"><Sparkle size={15} weight="fill" /> Built for wholesale</span>
            <h1>Everything your business needs, <i>all in one place.</i></h1>
            <p>Trusted products, dependable supply, and pricing tailored to your business.</p>
            <div className="hero-actions"><a className="primary-button" href="#products">Shop products <ArrowRight size={18} /></a><a className="secondary-button" href="#account">Open a trade account</a></div>
            <div className="hero-proof"><span><CheckCircle weight="fill" /> Verified products</span><span><CheckCircle weight="fill" /> Trade pricing</span><span><CheckCircle weight="fill" /> Reliable delivery</span></div>
          </div>
        </section>

        <section className="benefits">
          <div className="container benefit-grid">
            <div><span className="benefit-icon"><BoxArrowDown /></span><p><b>Bulk pricing</b><small>Better value at every tier</small></p></div>
            <div><span className="benefit-icon"><Package /></span><p><b>5,000+ products</b><small>One reliable supplier</small></p></div>
            <div><span className="benefit-icon"><Truck /></span><p><b>Fast fulfilment</b><small>From warehouse to your door</small></p></div>
            <div><span className="benefit-icon"><Clock /></span><p><b>Order anytime</b><small>Your portal is always open</small></p></div>
          </div>
        </section>

        <section className="catalog container" id="products">
          <div className="section-heading"><div><span className="kicker">Wholesale catalogue</span><h2>Popular products</h2><p>Trade favourites, ready for your next order.</p></div><a href="#all">View full catalogue <ArrowRight /></a></div>
          <div className="category-row" id="categories">
            {categories.map((item) => <button className={item === category ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className="product-grid">
            {visibleProducts.map((product) => {
              const quantity = cart[product.id] || 0;
              return <article className="product-card" key={product.id}>
                <div className={`product-image ${product.tone}`}>
                  {product.badge && <span className={`badge ${product.badge === "Bestseller" ? "dark" : ""}`}>{product.badge}</span>}
                  <button className="heart" aria-label="Add to favourites"><Heart /></button>
                  <Image className="product-photo" src={product.image} alt={product.name} width={320} height={320} sizes="(max-width: 620px) 46vw, (max-width: 900px) 45vw, 270px" />
                </div>
                <div className="product-info">
                  <small className="brand-name">{product.brand}</small><h3>{product.name}</h3>
                  <p className="sku">SKU {product.sku}</p>
                  <div className="pack"><Package size={16} /> Case: {product.pack}</div>
                  <div className="stock"><i className={product.stock === "Low stock" ? "low" : ""} /> {product.stock}</div>
                  <div className="price-row"><div>{product.oldPrice && <del>${product.oldPrice.toFixed(2)}</del>}<strong>${product.price.toFixed(2)}</strong><small>per case</small></div></div>
                  {quantity ? <div className="quantity-control"><button onClick={() => updateCart(product.id, -1)}><Minus /></button><span>{quantity} case{quantity > 1 ? "s" : ""}</span><button onClick={() => updateCart(product.id, 1)}><Plus /></button></div> : <button className="add-button" onClick={() => updateCart(product.id, 1)}><ShoppingCartSimple /> Add case</button>}
                </div>
              </article>;
            })}
          </div>
          {!visibleProducts.length && <div className="empty-state"><MagnifyingGlass size={32} /><h3>No products found</h3><p>Try another search or category.</p></div>}
        </section>

        <section className="brand-feature container" id="brands">
          <div className="brand-feature-copy"><span className="kicker">Featured brand</span><h2>Mustela baby care</h2><p>Explore gentle skin, bath, and body care for babies and children—all available through your FLR wholesale account.</p><button onClick={() => { setCategory("Mother & Baby"); document.querySelector("#products")?.scrollIntoView(); }}>Explore the range <ArrowRight /></button></div>
          <div className="brand-feature-image"><Image src="/products/mustela-baby-range.png" alt="Mustela baby care product range" width={500} height={500} sizes="(max-width: 700px) 90vw, 500px" /></div>
        </section>

        <section className="trade-banner container" id="account"><div><span className="kicker">Become an FLR partner</span><h2>Ready to grow your business?</h2><p>Apply for a wholesale account to unlock trade pricing, flexible ordering, and dedicated support.</p></div><a className="light-button" href="#apply">Apply for an account <ArrowRight /></a></section>
      </main>

      <footer><div className="container"><a className="brand inverse" href="#"><span className="brand-mark">F</span><span><b>FLR</b><small>WHOLESALE</small></span></a><p>Reliable supply. Better business.</p><span>© 2026 FLR Ltd. All rights reserved.</span></div></footer>

      {cartOpen && <><button className="drawer-backdrop" onClick={() => setCartOpen(false)} aria-label="Close cart" /><aside className="cart-drawer"><div className="drawer-heading"><div><span className="kicker">Your order</span><h2>Wholesale cart</h2></div><button className="icon-button" onClick={() => setCartOpen(false)}><X /></button></div>{cartItems.length ? <><div className="cart-items">{cartItems.map((product) => <div className="cart-item" key={product.id}><div className={`cart-thumb ${product.tone}`}><Image src={product.image} alt="" width={54} height={54} /></div><div><b>{product.name}</b><small>{product.pack}</small><div className="mini-quantity"><button onClick={() => updateCart(product.id, -1)}><Minus /></button><span>{cart[product.id]}</span><button onClick={() => updateCart(product.id, 1)}><Plus /></button></div></div><strong>${(product.price * cart[product.id]).toFixed(2)}</strong></div>)}</div><div className="cart-summary"><span>Subtotal <b>${cartTotal.toFixed(2)}</b></span><small>Delivery and taxes are calculated after sign in.</small><button className="primary-button">Continue order <ArrowRight /></button><button className="text-button">Request a quotation</button></div></> : <div className="empty-cart"><ShoppingCartSimple size={40} /><h3>Your cart is empty</h3><p>Add full cases from the catalogue to begin.</p></div>}</aside></>}
    </div>
  );
}
