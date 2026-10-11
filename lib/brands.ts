export type BrandGroup = "dermocosmetics" | "baby" | "wellness";

export type Brand = {
  name: string;
  slug: string;
  origin: string;
  category: string;
  /** The portfolio area the brand is filed under on the public site. */
  group: BrandGroup;
  tier: string;
  logo: string;
  wordmark?: boolean;
};

export const brandGroups: Array<{ id: BrandGroup; label: string; description: string }> = [
  { id: "dermocosmetics", label: "Dermocosmetics & skincare", description: "Dermatologist-developed skincare for pharmacies and beauty retail." },
  { id: "baby", label: "Baby & maternity", description: "Gentle care for babies, children and expectant mothers." },
  { id: "wellness", label: "Wellness, OTC & pharmacy", description: "Everyday health, aromatherapy and over-the-counter essentials." },
];

export const brandPortfolio: Brand[] = [
  { name: "Bioderma", slug: "bioderma", origin: "France", category: "Dermocosmetics", group: "dermocosmetics", tier: "Tier 1", logo: "/brands/bioderma.svg", wordmark: true },
  { name: "Mustela", slug: "mustela", origin: "France", category: "Baby & Maternity", group: "baby", tier: "Tier 1", logo: "/brands/mustela.svg", wordmark: true },
  { name: "Uriage Eau Thermale", slug: "uriage", origin: "France", category: "Thermal Skincare", group: "dermocosmetics", tier: "Tier 1", logo: "/brands/uriage.png" },
  { name: "SVR Laboratoire", slug: "svr", origin: "France", category: "Dermocosmetics", group: "dermocosmetics", tier: "Tier 1", logo: "/brands/svr.png" },
  { name: "La Roche-Posay", slug: "la-roche-posay", origin: "France", category: "Dermatology", group: "dermocosmetics", tier: "Tier 1", logo: "/brands/la-roche-posay.svg", wordmark: true },
  { name: "Eucerin", slug: "eucerin", origin: "Germany", category: "Medical Skincare", group: "dermocosmetics", tier: "Tier 1", logo: "/brands/eucerin.svg", wordmark: true },
  { name: "Topicrem", slug: "topicrem", origin: "France", category: "Dermocosmetics", group: "dermocosmetics", tier: "Featured", logo: "/brands/topicrem.png" },
  { name: "Puressentiel", slug: "puressentiel", origin: "France", category: "Aromatherapy & OTC", group: "wellness", tier: "Featured", logo: "/brands/puressentiel-logo.png" },
  { name: "Château Rouge", slug: "chateau-rouge", origin: "France", category: "Melanin-rich Skincare", group: "dermocosmetics", tier: "Featured", logo: "/brands/chateau-rouge.png" },
  { name: "MKL Green Nature", slug: "mkl-green-nature", origin: "France", category: "Natural Skincare", group: "dermocosmetics", tier: "Featured", logo: "/brands/mkl-green-nature.png" },
  { name: "Neutrogena", slug: "neutrogena", origin: "USA / France", category: "Clinical Skincare", group: "wellness", tier: "Featured", logo: "/brands/neutrogena.svg", wordmark: true },
  { name: "CeraVe", slug: "cerave", origin: "USA", category: "Dermatologist Skincare", group: "dermocosmetics", tier: "Featured", logo: "/brands/cerave.png" },
  { name: "Cetaphil", slug: "cetaphil", origin: "USA", category: "Gentle Skincare", group: "dermocosmetics", tier: "Featured", logo: "/brands/cetaphil.png" },
  { name: "Zwitsal", slug: "zwitsal", origin: "Netherlands", category: "Baby Care", group: "baby", tier: "Featured", logo: "/brands/zwitsal.png" },
  { name: "The Ordinary", slug: "the-ordinary", origin: "Canada", category: "Ingredient Skincare", group: "dermocosmetics", tier: "Featured", logo: "/brands/the-ordinary.png" },
  { name: "Garnier", slug: "garnier", origin: "France", category: "Mass Premium", group: "wellness", tier: "Standard", logo: "/brands/garnier.png" },
  { name: "Horizane Santé", slug: "horizane-sante", origin: "France", category: "Health & Nutraceuticals", group: "wellness", tier: "Standard", logo: "/brands/horizane-sante.png" },
  { name: "Evoluderm", slug: "evoluderm", origin: "France", category: "Natural Body Care", group: "dermocosmetics", tier: "Standard", logo: "/brands/evoluderm.png" },
  { name: "Byphasse", slug: "byphasse", origin: "France", category: "Accessible Skincare", group: "baby", tier: "Standard", logo: "/brands/byphasse.png" },
];
