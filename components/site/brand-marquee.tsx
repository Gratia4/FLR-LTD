import Link from "next/link";
import { brandPortfolio } from "@/lib/brands";
import { BrandLogo } from "./brand-logo";

/** An endless, pausable strip of partner logos. Pure CSS, no JavaScript. */
export function BrandMarquee() {
  const loop = [...brandPortfolio, ...brandPortfolio];
  return (
    <div className="group relative overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <ul className="flex w-max animate-marquee items-center gap-14 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {loop.map((brand, index) => (
          <li key={`${brand.slug}-${index}`} aria-hidden={index >= brandPortfolio.length}>
            <Link
              href={`/brands/${brand.slug}`}
              tabIndex={index >= brandPortfolio.length ? -1 : undefined}
              className="block opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
            >
              <BrandLogo brand={brand} size="sm" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
