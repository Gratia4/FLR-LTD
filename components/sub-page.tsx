import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { CorporateFooter, CorporateHeader } from "@/components/corporate-chrome";

export function SubPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <div className="public-site sub-page"><CorporateHeader /><main><section className="sub-hero"><div className="container"><Link href="/"><ArrowLeft /> Home</Link><span>{eyebrow}</span><h1>{title}</h1><p>{intro}</p></div></section>{children}</main><CorporateFooter /></div>;
}
