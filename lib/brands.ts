export type Brand = {
  name: string;
  slug: string;
  origin: string;
  category: string;
  tier: string;
  logo: string;
  wordmark?: boolean;
};

export const brandPortfolio: Brand[] = [
  { name: "Bioderma", slug: "bioderma", origin: "France", category: "Dermocosmetics", tier: "Tier 1", logo: "/brands/bioderma.svg", wordmark: true },
  { name: "Mustela", slug: "mustela", origin: "France", category: "Baby & Maternity", tier: "Tier 1", logo: "/brands/mustela.svg", wordmark: true },
  { name: "Uriage Eau Thermale", slug: "uriage", origin: "France", category: "Thermal Skincare", tier: "Tier 1", logo: "/brands/uriage.png" },
  { name: "SVR Laboratoire", slug: "svr", origin: "France", category: "Dermocosmetics", tier: "Tier 1", logo: "/brands/svr.png" },
  { name: "La Roche-Posay", slug: "la-roche-posay", origin: "France", category: "Dermatology", tier: "Tier 1", logo: "/brands/la-roche-posay.svg", wordmark: true },
  { name: "Eucerin", slug: "eucerin", origin: "Germany", category: "Medical Skincare", tier: "Tier 1", logo: "/brands/eucerin.svg", wordmark: true },
  { name: "Topicrem", slug: "topicrem", origin: "France", category: "Dermocosmetics", tier: "Featured", logo: "/brands/topicrem.png" },
  { name: "Puressentiel", slug: "puressentiel", origin: "France", category: "Aromatherapy & OTC", tier: "Featured", logo: "/brands/puressentiel-logo.png" },
  { name: "Château Rouge", slug: "chateau-rouge", origin: "France", category: "Melanin-rich Skincare", tier: "Featured", logo: "/brands/chateau-rouge.png" },
  { name: "MKL Green Nature", slug: "mkl-green-nature", origin: "France", category: "Natural Skincare", tier: "Featured", logo: "/brands/mkl-green-nature.png" },
  { name: "Neutrogena", slug: "neutrogena", origin: "USA / France", category: "Clinical Skincare", tier: "Featured", logo: "/brands/neutrogena.svg", wordmark: true },
  { name: "CeraVe", slug: "cerave", origin: "USA", category: "Dermatologist Skincare", tier: "Featured", logo: "/brands/cerave.png" },
  { name: "Cetaphil", slug: "cetaphil", origin: "USA", category: "Gentle Skincare", tier: "Featured", logo: "/brands/cetaphil.png" },
  { name: "Zwitsal", slug: "zwitsal", origin: "Netherlands", category: "Baby Care", tier: "Featured", logo: "/brands/zwitsal.png" },
  { name: "The Ordinary", slug: "the-ordinary", origin: "Canada", category: "Ingredient Skincare", tier: "Featured", logo: "/brands/the-ordinary.png" },
  { name: "Garnier", slug: "garnier", origin: "France", category: "Mass Premium", tier: "Standard", logo: "/brands/garnier.png" },
  { name: "Horizane Santé", slug: "horizane-sante", origin: "France", category: "Health & Nutraceuticals", tier: "Standard", logo: "/brands/horizane-sante.png" },
  { name: "Evoluderm", slug: "evoluderm", origin: "France", category: "Natural Body Care", tier: "Standard", logo: "/brands/evoluderm.png" },
  { name: "Byphasse", slug: "byphasse", origin: "France", category: "Accessible Skincare", tier: "Standard", logo: "/brands/byphasse.png" },
];
