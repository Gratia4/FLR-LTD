"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  Buildings,
  CaretRight,
  ChartLineUp,
  ClipboardText,
  FileText,
  FolderOpen,
  Headset,
  Key,
  List,
  MagnifyingGlass,
  Megaphone,
  Package,
  Plus,
  Receipt,
  ShieldCheck,
  SignOut,
  SquaresFour,
  Stack,
  Storefront,
  UsersThree,
  Wallet,
  X,
  type Icon,
} from "@phosphor-icons/react";
import type { AuthUser } from "@/lib/session";
import { humanise, initials } from "@/lib/format";
import { Spinner } from "./ui";

type NavItem = { key: string; href: string; label: string; icon: Icon; area?: string; badge?: number };

const GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Workspace",
    items: [
      { key: "overview", href: "/admin/overview", label: "Overview", icon: SquaresFour },
      { key: "applications", href: "/admin", label: "Applications", icon: UsersThree, area: "registrations" },
      { key: "clients", href: "/admin/clients", label: "Client accounts", icon: Buildings, area: "clients" },
      { key: "orders", href: "/admin/orders", label: "Orders", icon: Storefront, area: "fulfilment" },
    ],
  },
  {
    label: "Catalogue & stock",
    items: [
      { key: "catalogue", href: "/admin/catalogue", label: "Product catalogue", icon: Package, area: "inventory" },
      { key: "new-product", href: "/admin/catalogue/new", label: "Add new product", icon: FileText, area: "catalogue" },
      { key: "inventory", href: "/admin/inventory", label: "Batches & expiry", icon: Stack, area: "inventory" },
    ],
  },
  {
    label: "Finance",
    items: [
      { key: "invoices", href: "/admin/invoices", label: "Invoices", icon: Receipt, area: "finance" },
      { key: "payments", href: "/admin/payments", label: "Payments", icon: Wallet, area: "finance" },
      { key: "returns", href: "/admin/returns", label: "Returns & credits", icon: ClipboardText, area: "fulfilment" },
    ],
  },
  {
    label: "Compliance & insight",
    items: [
      { key: "documents", href: "/admin/documents", label: "Documents", icon: FolderOpen, area: "registrations" },
      { key: "analytics", href: "/admin/analytics", label: "Analytics", icon: ChartLineUp, area: "analytics" },
      { key: "staff", href: "/admin/staff", label: "Staff & access", icon: ShieldCheck, area: "staff" },
      { key: "communications", href: "/admin/communications", label: "Communications", icon: Megaphone, area: "communications" },
    ],
  },
];

/** Shortcuts offered in the command palette alongside plain navigation. */
const ACTIONS: Array<{ label: string; hint: string; href: string; icon: Icon; area?: string }> = [
  { label: "Add a product", hint: "Catalogue", href: "/admin/catalogue/new", icon: Plus, area: "catalogue" },
  { label: "Review pending applications", hint: "Applications", href: "/admin", icon: UsersThree, area: "registrations" },
  { label: "Receive a stock batch", hint: "Inventory", href: "/admin/inventory", icon: Stack, area: "inventory" },
  { label: "Record a payment", hint: "Finance", href: "/admin/payments", icon: Wallet, area: "finance" },
  { label: "Invite a staff member", hint: "Staff", href: "/admin/staff", icon: ShieldCheck, area: "staff" },
  { label: "Change my password", hint: "Account", href: "/account/password", icon: Key },
];

export function ConsoleShell({
  user,
  active,
  onLogout,
  can,
  badges = {},
  children,
}: {
  user: AuthUser | null;
  active: string;
  onLogout: () => void;
  can: (area: string) => boolean;
  badges?: Record<string, number>;
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ⌘K / Ctrl+K opens the palette from anywhere in the console.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Hide whatever this role cannot call, so the nav never leads to a 403.
  const groups = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.area || can(item.area)),
      })).filter((group) => group.items.length),
    [can],
  );

  if (!user) {
    return (
      <main className="page-loading">
        <span className="mountain" aria-hidden="true"><i /><i /><i /></span>
        <Spinner size={22} />
        <p>Verifying staff access…</p>
      </main>
    );
  }

  const currentGroup = groups.find((group) => group.items.some((item) => item.key === active));
  const current = currentGroup?.items.find((item) => item.key === active);

  return (
    <div className={`console ${navOpen ? "nav-open" : ""}`}>
      <button className="console-shade" onClick={() => setNavOpen(false)} aria-label="Close navigation" />

      <aside className="console-sidebar">
        <div className="console-brand">
          <span className="mountain" aria-hidden="true"><i /><i /><i /></span>
          <span>
            <b>FLR Ltd.</b>
            <small>Management Console</small>
          </span>
          <button onClick={() => setNavOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <button className="console-search-mini" onClick={() => { setNavOpen(false); setPaletteOpen(true); }}>
          <MagnifyingGlass />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>

        <nav className="console-nav">
          {groups.map((group) => (
            <section key={group.label}>
              <small>{group.label}</small>
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const badge = badges[item.key];
                const isActive = active === item.key;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={isActive ? "active" : ""}
                    onClick={() => setNavOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <IconComponent weight={isActive ? "fill" : "regular"} />
                    <span>{item.label}</span>
                    {badge ? <em>{badge > 99 ? "99+" : badge}</em> : null}
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>

        <a className="console-support" href="mailto:support@flr.rw">
          <Headset weight="duotone" />
          <span>
            <b>Need assistance?</b>
            <small>support@flr.rw</small>
          </span>
          <ArrowRight />
        </a>

        <div className="console-user">
          <span className="console-avatar">{initials(user.fullName)}</span>
          <span>
            <b>{user.fullName}</b>
            <small>{humanise(user.role)}</small>
          </span>
          <button onClick={onLogout} aria-label="Sign out" title="Sign out"><SignOut /></button>
        </div>
      </aside>

      <div className="console-main">
        <header className="console-header">
          <button className="btn btn-secondary btn-icon console-menu" onClick={() => setNavOpen(true)} aria-label="Open navigation">
            <List />
          </button>
          <nav className="console-crumb" aria-label="Breadcrumb">
            <Link href="/admin/overview">Console</Link>
            {currentGroup && current?.key !== "overview" && <><CaretRight /><span>{currentGroup.label}</span></>}
            <CaretRight />
            <b>{current?.label ?? "Overview"}</b>
          </nav>

          <button className="console-search" onClick={() => setPaletteOpen(true)}>
            <MagnifyingGlass />
            <span>Search or jump to…</span>
            <kbd>⌘K</kbd>
          </button>

          <div className="console-profile">
            {can("communications") && (
              <Link href="/admin/communications" className="console-icon-button notification-button" aria-label="Communications and delivery log">
                <Bell />
                <i />
              </Link>
            )}
            <div className="profile-menu">
              <button className="profile-trigger" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-haspopup="menu">
                <span className="console-avatar">{initials(user.fullName)}</span>
                <span className="profile-trigger-id">
                  <b>{user.fullName}</b>
                  <small>{humanise(user.role)}</small>
                </span>
              </button>
              {menuOpen && (
                <>
                  <button className="menu-dismiss" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
                  <div className="menu-pop" role="menu">
                    <div className="menu-pop-head">
                      <b>{user.fullName}</b>
                      <small>{user.email}</small>
                    </div>
                    <Link role="menuitem" href="/account/password" onClick={() => setMenuOpen(false)}><Key /> Change password</Link>
                    <a role="menuitem" href="mailto:support@flr.rw"><Headset /> Contact support</a>
                    <button role="menuitem" className="is-danger" onClick={onLogout}><SignOut /> Sign out</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="console-content" key={active}>{children}</main>
      </div>

      {paletteOpen && <CommandPalette groups={groups} can={can} onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}

/* ---------------------------- command palette ----------------------------- */

type PaletteEntry = { id: string; label: string; hint: string; href: string; icon: Icon };

function CommandPalette({
  groups,
  can,
  onClose,
}: {
  groups: Array<{ label: string; items: NavItem[] }>;
  can: (area: string) => boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => {
    const match = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
    const pages: PaletteEntry[] = groups.flatMap((group) =>
      group.items.map((item) => ({ id: `page-${item.key}`, label: item.label, hint: group.label, href: item.href, icon: item.icon })),
    );
    const actions: PaletteEntry[] = ACTIONS.filter((action) => !action.area || can(action.area)).map((action) => ({
      id: `action-${action.label}`,
      label: action.label,
      hint: action.hint,
      href: action.href,
      icon: action.icon,
    }));
    return [
      { title: "Quick actions", entries: actions.filter((entry) => match(`${entry.label} ${entry.hint}`)) },
      { title: "Pages", entries: pages.filter((entry) => match(`${entry.label} ${entry.hint}`)) },
    ].filter((section) => section.entries.length);
  }, [groups, can, query]);

  const flat = sections.flatMap((section) => section.entries);

  const go = useCallback(
    (entry: PaletteEntry | undefined) => {
      if (!entry) return;
      onClose();
      router.push(entry.href);
    },
    [onClose, router],
  );

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  function onKeyDown(event: ReactKeyboardEvent) {
    if (event.key === "Escape") onClose();
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((index) => Math.min(flat.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(flat[cursor]);
    }
  }

  let index = -1;
  return (
    <div className="palette-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search the console" onKeyDown={onKeyDown}>
        <label className="palette-input">
          <MagnifyingGlass />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages and actions…" aria-label="Search pages and actions" />
          <kbd>Esc</kbd>
        </label>
        <div className="palette-list" ref={listRef}>
          {sections.length ? (
            sections.map((section) => (
              <section key={section.title}>
                <small>{section.title}</small>
                {section.entries.map((entry) => {
                  index += 1;
                  const IconComponent = entry.icon;
                  const position = index;
                  return (
                    <button
                      key={entry.id}
                      data-index={position}
                      className={position === cursor ? "is-active" : ""}
                      onMouseMove={() => setCursor(position)}
                      onClick={() => go(entry)}
                    >
                      <span className="palette-icon"><IconComponent weight="duotone" /></span>
                      <b>{entry.label}</b>
                      <small>{entry.hint}</small>
                      <ArrowRight className="palette-go" />
                    </button>
                  );
                })}
              </section>
            ))
          ) : (
            <p className="palette-empty">No pages or actions match “{query}”.</p>
          )}
        </div>
        <footer className="palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </footer>
      </div>
    </div>
  );
}
