import { z } from "zod";
import { passwordSchema } from "./validation";

/** Mirrors the registration schema in backend/src/routes/registrations.ts. */

export const BUSINESS_TYPES = [
  { value: "PHARMACY", label: "Pharmacy", hint: "Licensed retail pharmacy" },
  { value: "CLINIC_HOSPITAL", label: "Clinic / hospital", hint: "Healthcare facility" },
  { value: "BEAUTY_RETAILER", label: "Beauty retailer", hint: "Cosmetics & skincare shop" },
  { value: "SUPERMARKET", label: "Supermarket", hint: "Grocery & general retail" },
  { value: "WHOLESALE_BUYER", label: "Wholesale buyer", hint: "Distributor or reseller" },
  { value: "OTHER", label: "Other", hint: "Another business type" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];

/** Rwanda's 30 districts, grouped by province. */
export const RWANDA_DISTRICTS: Array<{ province: string; districts: string[] }> = [
  { province: "City of Kigali", districts: ["Gasabo", "Kicukiro", "Nyarugenge"] },
  { province: "Eastern Province", districts: ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"] },
  { province: "Northern Province", districts: ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"] },
  { province: "Southern Province", districts: ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"] },
  { province: "Western Province", districts: ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"] },
];

export const COUNTRIES = ["Rwanda", "Burundi", "DR Congo", "Kenya", "Tanzania", "Uganda"] as const;

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "rw", label: "Kinyarwanda" },
] as const;

export const DOCUMENTS = [
  { field: "businessRegistration", label: "Business registration certificate", description: "RDB certificate · PDF, JPG or PNG", required: true },
  { field: "tinCertificate", label: "TIN certificate / RRA document", description: "Issued by the Rwanda Revenue Authority", required: true },
  { field: "operatingLicence", label: "Operating licence", description: "Current business operating licence", required: true },
  { field: "identityDocument", label: "National ID or passport", description: "Of the contact person named in this application", required: true },
  { field: "pharmacyLicence", label: "Pharmacy licence", description: "Required for pharmacies", required: false },
] as const;

export type DocumentField = (typeof DOCUMENTS)[number]["field"];

/** Mirrors backend/src/routes/registrations.ts: pharmacies must also upload their pharmacy licence. */
export const isDocumentRequired = (field: DocumentField, businessType: BusinessType | undefined) =>
  DOCUMENTS.find((document) => document.field === field)!.required || (field === "pharmacyLicence" && businessType === "PHARMACY");

const file = z.custom<File>((value) => typeof File !== "undefined" && value instanceof File, "Upload this document to continue.");
const optionalFile = file.nullable();

const text = (min: number, max: number, message: string) => z.string().trim().min(min, message).max(max, `Use at most ${max} characters.`);
const optionalText = (max: number) => z.string().trim().max(max, `Use at most ${max} characters.`);
const mustAccept = (message: string) => z.boolean().refine((value) => value, message);

const shape = {
  businessType: z.enum(BUSINESS_TYPES.map((type) => type.value) as [BusinessType, ...BusinessType[]], { error: "Choose your business type." }),
  businessName: text(2, 200, "Enter your registered business name."),
  registrationNumber: text(3, 100, "Enter your RDB registration number."),
  tin: z.string().trim().regex(/^\d{9}$/, "A Rwanda TIN has exactly 9 digits."),
  operatingLicenceNumber: text(2, 100, "Enter your operating licence number."),
  pharmacyLicenceNumber: optionalText(100),
  vatRegistrationNumber: optionalText(100),

  streetAddress: text(3, 250, "Enter the business street address."),
  country: z.enum(COUNTRIES),
  district: text(2, 100, "Choose or enter your district."),
  fullName: text(2, 150, "Enter the contact person’s full name."),
  jobTitle: text(2, 100, "Enter their job title or role."),
  professionalLicenceNumber: optionalText(100),
  email: z.email("Enter a valid business email address."),
  phone: z.string().trim().min(8, "Enter a phone number with at least 8 digits.").max(30).regex(/^\+?[0-9 ()-]+$/, "Use digits, spaces and an optional leading +."),
  whatsapp: z.string().trim().max(30).regex(/^(\+?[0-9 ()-]+)?$/, "Use digits, spaces and an optional leading +."),
  preferredLanguage: z.enum(["en", "fr", "rw"]),

  businessRegistration: optionalFile,
  tinCertificate: optionalFile,
  operatingLicence: optionalFile,
  identityDocument: optionalFile,
  pharmacyLicence: optionalFile,

  password: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm your password."),
  acceptTerms: mustAccept("Accept the wholesale Terms & Conditions to continue."),
  acceptPrivacy: mustAccept("Accept the Privacy Policy to continue."),
  acceptWholesaleAgreement: mustAccept("Confirm that wholesale pricing is confidential."),
};

export const registrationSchema = z.object(shape);
export type Registration = z.infer<typeof registrationSchema>;

export const REGISTRATION_STEPS: Array<{ id: string; title: string; description: string; fields: Array<keyof Registration> }> = [
  {
    id: "business",
    title: "Business profile",
    description: "Type, name and legal identifiers",
    fields: ["businessType", "businessName", "registrationNumber", "tin", "operatingLicenceNumber", "pharmacyLicenceNumber", "vatRegistrationNumber"],
  },
  {
    id: "contact",
    title: "Location & contact",
    description: "Address and your primary contact",
    fields: ["streetAddress", "country", "district", "fullName", "jobTitle", "professionalLicenceNumber", "email", "phone", "whatsapp", "preferredLanguage"],
  },
  { id: "documents", title: "Documents", description: "Certificates and licences", fields: DOCUMENTS.map((document) => document.field) },
  { id: "security", title: "Account security", description: "Password and agreements", fields: ["password", "confirmPassword", "acceptTerms", "acceptPrivacy", "acceptWholesaleAgreement"] },
  { id: "review", title: "Review & submit", description: "Check everything once", fields: [] },
];

type Issues = Partial<Record<keyof Registration, string>>;

/** Cross-field rules, checked on the step that owns the field. */
function crossFieldIssues(value: Registration, fields: Array<keyof Registration>): Issues {
  const issues: Issues = {};
  if (fields.includes("pharmacyLicenceNumber") && value.businessType === "PHARMACY" && !value.pharmacyLicenceNumber?.trim()) {
    issues.pharmacyLicenceNumber = "Required for pharmacies.";
  }
  for (const document of DOCUMENTS) {
    if (fields.includes(document.field) && isDocumentRequired(document.field, value.businessType) && !value[document.field]) {
      issues[document.field] = document.field === "pharmacyLicence" ? "Pharmacies must upload their pharmacy licence." : "Upload this document to continue.";
    }
  }
  if (fields.includes("confirmPassword") && value.confirmPassword && value.password !== value.confirmPassword) {
    issues.confirmPassword = "The passwords do not match.";
  }
  return issues;
}

/**
 * Validates only the given fields. Each step is checked on its own so that
 * cross-field rules run even while later steps are still empty.
 */
export function validateFields(value: Registration, fields: Array<keyof Registration>): Issues {
  const picked = Object.fromEntries(fields.map((field) => [field, shape[field]])) as Partial<typeof shape>;
  const result = z.object(picked).safeParse(value);
  const issues: Issues = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof Registration;
      issues[field] ??= issue.message;
    }
  }
  for (const [field, message] of Object.entries(crossFieldIssues(value, fields)) as Array<[keyof Registration, string]>) issues[field] ??= message;
  return issues;
}

export const emptyRegistration: Registration = {
  businessType: undefined as unknown as BusinessType,
  businessName: "",
  registrationNumber: "",
  tin: "",
  operatingLicenceNumber: "",
  pharmacyLicenceNumber: "",
  vatRegistrationNumber: "",
  streetAddress: "",
  country: "Rwanda",
  district: "",
  fullName: "",
  jobTitle: "",
  professionalLicenceNumber: "",
  email: "",
  phone: "",
  whatsapp: "",
  preferredLanguage: "en",
  businessRegistration: null,
  tinCertificate: null,
  operatingLicence: null,
  identityDocument: null,
  pharmacyLicence: null,
  password: "",
  confirmPassword: "",
  acceptTerms: false,
  acceptPrivacy: false,
  acceptWholesaleAgreement: false,
};

/** Fields safe to keep in sessionStorage between reloads: never passwords or files. */
export const DRAFT_FIELDS = [
  "businessType", "businessName", "registrationNumber", "tin", "operatingLicenceNumber", "pharmacyLicenceNumber", "vatRegistrationNumber",
  "streetAddress", "country", "district", "fullName", "jobTitle", "professionalLicenceNumber", "email", "phone", "whatsapp", "preferredLanguage",
] as const satisfies ReadonlyArray<keyof Registration>;

/** Builds the multipart body the backend expects, matching the original form's field names. */
export function toFormData(value: Registration) {
  const form = new FormData();
  const strings: Array<keyof Registration> = [...DRAFT_FIELDS, "password"];
  for (const key of strings) form.append(key, String(value[key] ?? ""));
  for (const document of DOCUMENTS) {
    const upload = value[document.field];
    if (upload) form.append(document.field, upload);
  }
  form.append("acceptTerms", "true");
  form.append("acceptPrivacy", "true");
  form.append("acceptWholesaleAgreement", "true");
  return form;
}
