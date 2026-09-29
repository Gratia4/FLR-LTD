"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  CircleNotch,
  Info,
  Warning,
  WarningCircle,
  X,
  type Icon,
} from "@phosphor-icons/react";
import { humanise, type Tone } from "@/lib/format";

/* ------------------------------- status pill ------------------------------ */

export function StatusPill({ tone, children, dot = true }: { tone: Tone; children: ReactNode; dot?: boolean }) {
  return <span className={`pill pill-${tone} ${dot ? "pill-dot" : ""}`}>{children}</span>;
}

export const StatusLabel = ({ tone, status }: { tone: Tone; status: string }) => (
  <StatusPill tone={tone}>{humanise(status)}</StatusPill>
);

/* --------------------------------- metric --------------------------------- */

export function Metric({
  icon: IconComponent,
  label,
  value,
  note,
  accent = "green",
  trend,
}: {
  icon: Icon;
  label: string;
  value: ReactNode;
  note?: ReactNode;
  accent?: "green" | "gold" | "blue" | "danger" | "violet";
  trend?: { direction: "up" | "down"; label: string };
}) {
  return (
    <article className={`metric accent-${accent}`}>
      <div className="metric-top">
        <small>{label}</small>
        <span className="metric-icon">
          <IconComponent weight="duotone" />
        </span>
      </div>
      <strong>{value}</strong>
      {(note || trend) && (
        <em className="metric-note">
          {trend && (
            <span className={`metric-trend ${trend.direction}`}>
              {trend.direction === "up" ? <ArrowUpRight weight="bold" /> : <ArrowDownRight weight="bold" />}
              {trend.label}
            </span>
          )}
          {note && <span>{note}</span>}
        </em>
      )}
    </article>
  );
}

/* ------------------------------- empty state ------------------------------ */

export function EmptyState({
  icon: IconComponent,
  title,
  message,
  action,
}: {
  icon: Icon;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <IconComponent weight="duotone" />
      </span>
      <b>{title}</b>
      <span>{message}</span>
      {action}
    </div>
  );
}

/* -------------------------------- skeleton -------------------------------- */

export const SkeletonRows = ({ rows = 6 }: { rows?: number }) => (
  <div className="skeleton-stack" aria-busy="true" aria-label="Loading">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="skeleton skeleton-row" />
    ))}
  </div>
);

export const Spinner = ({ size = 20 }: { size?: number }) => <CircleNotch className="spin" size={size} weight="bold" />;

/* --------------------------------- banner --------------------------------- */

const BANNER_ICONS = { error: WarningCircle, warn: Warning, ok: CheckCircle, info: Info } as const;

export function Banner({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: keyof typeof BANNER_ICONS;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const IconComponent = BANNER_ICONS[tone];
  return (
    <div className={`banner banner-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <IconComponent weight="fill" />
      <div className="u-grow">
        {title && <b>{title}</b>}
        {children}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------- sheet --------------------------------- */

export function Sheet({
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  // Escape closes, and the page behind must not scroll while the sheet is open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className={`sheet ${wide ? "sheet-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="sheet-head">
          <div className="u-grow">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="btn btn-secondary btn-icon sheet-close" onClick={onClose} aria-label="Close panel">
            <X />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
        {footer && <footer className="sheet-foot">{footer}</footer>}
      </aside>
    </div>
  );
}

export const DetailGrid = ({ children }: { children: ReactNode }) => <div className="detail-grid">{children}</div>;

export const Detail = ({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) => (
  <div className={wide ? "span-2" : undefined}>
    <small>{label}</small>
    <b>{children ?? "—"}</b>
  </div>
);

export const SectionLabel = ({ children }: { children: ReactNode }) => <div className="section-label">{children}</div>;

/* --------------------------------- charts --------------------------------- */

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** Rounds the data maximum up to a clean axis top with `steps` even ticks. */
function niceScale(max: number, steps = 4) {
  if (max <= 0) return { top: steps, ticks: Array.from({ length: steps + 1 }, (_, index) => index) };
  const raw = max / steps;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= raw) ?? raw;
  return { top: step * steps, ticks: Array.from({ length: steps + 1 }, (_, index) => index * step) };
}

/**
 * Column chart for one series. Earlier periods sit one step lighter so the
 * current (last) period reads at a glance; every column has a hover tooltip.
 */
export function Bars({
  data,
  height = 200,
  format,
  highlight = "last",
}: {
  data: Array<{ label: string; value: number }>;
  height?: number;
  format?: (value: number) => string;
  highlight?: "last" | "none";
}) {
  const { top, ticks } = niceScale(Math.max(...data.map((entry) => entry.value), 0));
  const show = format ?? ((value: number) => value.toLocaleString("en"));
  return (
    <div className={`chart ${data.length > 8 ? "is-dense" : ""}`} style={{ ["--chart-h" as string]: `${height}px` }} role="img" aria-label={data.map((entry) => `${entry.label}: ${show(entry.value)}`).join(", ")}>
      <div className="chart-axis" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick} style={{ bottom: `${(tick / top) * 100}%` }}>{compactNumber.format(tick)}</span>
        ))}
      </div>
      <div className="chart-plot">
        {ticks.map((tick) => (
          <i key={tick} className={`chart-grid ${tick === 0 ? "is-base" : ""}`} style={{ bottom: `${(tick / top) * 100}%` }} />
        ))}
        <div className="chart-cols">
          {data.map((entry, index) => (
            <div className="chart-col" key={`${entry.label}-${index}`}>
              <span
                className={`chart-bar ${highlight === "last" && index === data.length - 1 ? "is-current" : ""}`}
                style={{ height: `${entry.value > 0 ? Math.max(1.5, (entry.value / top) * 100) : 0}%`, ["--i" as string]: index }}
              />
              <span className="chart-tip"><small>{entry.label}</small><b>{show(entry.value)}</b></span>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-labels" aria-hidden="true">
        {data.map((entry, index) => <span key={`${entry.label}-${index}`}>{entry.label}</span>)}
      </div>
    </div>
  );
}

/** Line + soft area for change over time, with a crosshair tooltip on hover. */
export function TrendChart({
  data,
  height = 220,
  format,
}: {
  data: Array<{ label: string; value: number }>;
  height?: number;
  format?: (value: number) => string;
}) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const show = format ?? ((value: number) => value.toLocaleString("en"));
  const { top, ticks } = niceScale(Math.max(...data.map((entry) => entry.value), 0));

  if (data.length < 2) return <Bars data={data} height={height} format={format} />;

  const x = (index: number) => (index / (data.length - 1)) * 100;
  const y = (value: number) => 100 - (value / top) * 100;
  const line = data.map((entry, index) => `${index ? "L" : "M"}${x(index)},${y(entry.value)}`).join(" ");
  const area = `${line} L100,100 L0,100 Z`;
  const point = hover === null ? null : data[hover];

  return (
    <div className="chart" style={{ ["--chart-h" as string]: `${height}px` }}>
      <div className="chart-axis" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick} style={{ bottom: `${(tick / top) * 100}%` }}>{compactNumber.format(tick)}</span>
        ))}
      </div>
      <div
        className="chart-plot trend"
        onMouseMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
          setHover(Math.round(ratio * (data.length - 1)));
        }}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Trend from ${data[0].label} to ${data[data.length - 1].label}, latest ${show(data[data.length - 1].value)}`}
      >
        {ticks.map((tick) => (
          <i key={tick} className={`chart-grid ${tick === 0 ? "is-base" : ""}`} style={{ bottom: `${(tick / top) * 100}%` }} />
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }} className="trend-draw">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--green)" stopOpacity=".16" />
              <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} className="trend-line" />
        </svg>
        {point && hover !== null && (
          <>
            <span className="trend-cross" style={{ left: `${x(hover)}%` }} />
            <span className="trend-dot" style={{ left: `${x(hover)}%`, top: `${y(point.value)}%` }} />
            <span
              className="chart-tip"
              style={{
                left: `${x(hover)}%`,
                transform: `translate(${x(hover) < 12 ? "0" : x(hover) > 88 ? "-100%" : "-50%"}, -100%)`,
              }}
            >
              <small>{point.label}</small>
              <b>{show(point.value)}</b>
            </span>
          </>
        )}
      </div>
      <div className="chart-labels trend-axis-x" aria-hidden="true">
        <span>{data[0].label}</span>
        <span>{data[Math.floor((data.length - 1) / 2)].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}

export const Meter = ({ value, max, tone }: { value: number; max: number; tone?: "warn" | "danger" }) => (
  <div className={`meter ${tone ? `is-${tone}` : ""}`}>
    <i style={{ width: `${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%` }} />
  </div>
);

/* ---------------------------------- toast --------------------------------- */

type Toast = { id: number; message: string; tone: "ok" | "error" };
type ToastApi = { success: (message: string) => void; error: (message: string) => void };

const ToastContext = createContext<ToastApi>({ success: () => {}, error: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Toast["tone"]) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), tone === "error" ? 7000 : 4000);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ success: (message) => push(message, "ok"), error: (message) => push(message, "error") }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.tone === "ok" ? "is-ok" : "is-error"}`}>
            {toast.tone === "ok" ? <CheckCircle weight="fill" /> : <WarningCircle weight="fill" />}
            <span className="u-grow">{toast.message}</span>
            <button onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Dismiss">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
