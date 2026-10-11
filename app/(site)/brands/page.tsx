import { SubPage } from "@/components/sub-page";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LockKey } from "@phosphor-icons/react/dist/ssr";
import { brandPortfolio } from "@/lib/brands";

export default function BrandsPage(){return <SubPage eyebrow="Brand catalogue" title="Our Brand Portfolio" intro="Notre Portefeuille de Marques"><section className="brands-content container"><div className="access-notice"><LockKey/><div><b>Wholesale pricing is protected</b><p>Approved clients can sign in to view RWF prices, MOQ, case sizes, stock and ordering controls.</p></div><Link href="/login">Client Login</Link></div><div className="brand-filters"><button className="active">All</button><button>Dermocosmetics</button><button>Baby & Maternity</button><button>Wellness & OTC</button><button>Skincare</button></div><div className="portfolio-grid">{brandPortfolio.map((brand)=><article key={brand.slug}><span>{brand.tier}</span><div className={brand.wordmark ? "portfolio-logo wordmark" : "portfolio-logo"}><Image src={brand.logo} alt={`${brand.name} logo`} width={155} height={65}/></div><small>{brand.origin}</small><h2>{brand.name}</h2><p>{brand.category}</p><Link href={`/brands/${brand.slug}`}>View Brand <ArrowRight/></Link></article>)}</div></section></SubPage>}
