import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

/** Stand-in imagery by category for products without a photo yet. */
const FALLBACKS: Record<string, string> = {
  "Mother & Baby": "/products/web/mustela-cleansing-gel.png",
  "Skin Care": "/products/web/cleansing-gel.png",
  "Personal Care": "/products/web/body-lotion.png",
  Vitamins: "/products/web/vitamin-c.png",
  Supplements: "/products/web/omega-3.png",
  Hygiene: "/products/web/hand-gel.png",
  "Medical Supplies": "/products/web/nitrile-gloves.png",
};

export const productImageSrc = (imageUrls: string[] | null | undefined, category?: string | null) =>
  imageUrls?.find(Boolean) ?? (category ? FALLBACKS[category] : undefined) ?? "/products/web/body-lotion.png";

/**
 * Product photo on a soft tile. Images come from the admin catalogue and may
 * live on an external CDN, so a plain <img> is used rather than next/image.
 */
export function ProductImage({
  imageUrls,
  category,
  alt,
  className,
  fallbackIcon,
}: {
  imageUrls: string[] | null | undefined;
  category?: string | null;
  alt: string;
  className?: string;
  /** Show a package icon instead of stand-in imagery when there is no photo. */
  fallbackIcon?: boolean;
}) {
  const hasPhoto = Boolean(imageUrls?.find(Boolean));
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_60%,#fff_0%,var(--color-sage-100)_80%)] ring-1 ring-sage-200/70", className)}>
      {!hasPhoto && fallbackIcon ? (
        <Package className="size-1/3 text-sage-400" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={productImageSrc(imageUrls, category)} alt={alt} loading="lazy" className="size-[86%] object-contain mix-blend-multiply" />
      )}
    </span>
  );
}
