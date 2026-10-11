import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades and lifts its content in as it scrolls into view, using a CSS
 * scroll-driven animation (see `.reveal` in app.css). Content is always
 * rendered visible first: browsers without scroll timelines, visitors who
 * prefer reduced motion, and pages whose JavaScript has not loaded yet simply
 * show it in place. `delay` (seconds, as a hint) staggers siblings by shifting
 * where in the scroll range each one animates.
 */
export function Reveal({
  delay = 0,
  y = 24,
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { delay?: number; y?: number }) {
  return (
    <div
      className={cn("reveal", className)}
      style={{ "--reveal-y": `${y}px`, "--reveal-shift": `${Math.round(delay * 60)}%`, ...style } as CSSProperties}
      {...props}
    />
  );
}
