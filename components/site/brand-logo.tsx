import Image from "next/image";
import type { Brand } from "@/lib/brands";
import { cn } from "@/lib/utils";

/**
 * A brand's logo, sized to sit on a white tile. Wordmark logos carry the name
 * themselves; icon-only logos get the name set beside them.
 */
export function BrandLogo({ brand, className, size = "md" }: { brand: Brand; className?: string; size?: "sm" | "md" | "lg" }) {
  const height = { sm: 28, md: 40, lg: 64 }[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={brand.logo}
        alt={`${brand.name} logo`}
        width={height * 3.2}
        height={height}
        className="w-auto object-contain"
        style={{ height, maxWidth: height * 3.6 }}
      />
      {!brand.wordmark && (
        <span className={cn("font-semibold whitespace-nowrap text-sage-700", size === "lg" ? "text-xl" : "text-sm")}>{brand.name}</span>
      )}
    </span>
  );
}
