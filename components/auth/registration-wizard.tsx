"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileText,
  Hospital,
  Loader2,
  LockKeyhole,
  MapPin,
  Package,
  PencilLine,
  ShoppingBasket,
  Sparkles,
  Store,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, ApiRequestError } from "@/lib/api";
import {
  BUSINESS_TYPES,
  COUNTRIES,
  DOCUMENTS,
  DRAFT_FIELDS,
  LANGUAGES,
  REGISTRATION_STEPS,
  RWANDA_DISTRICTS,
  emptyRegistration,
  toFormData,
  validateFields,
  type Registration,
} from "@/lib/registration";
import { cn } from "@/lib/utils";
import { Field, fieldProps } from "./field";
import { FileDrop, fileSizeLabel } from "./file-drop";
import { PasswordChecklist, PasswordInput } from "./password-input";

type RegistrationResponse = { reference: string; status: string; message: string };

const DRAFT_KEY = "flr:registration-draft";
const TYPE_ICONS = { PHARMACY: Store, CLINIC_HOSPITAL: Hospital, BEAUTY_RETAILER: Sparkles, SUPERMARKET: ShoppingBasket, WHOLESALE_BUYER: Package, OTHER: Building2 } as const;
const STEP_ICONS = [Building2, MapPin, FileText, LockKeyhole, ClipboardCheck];
/** Fields whose validity depends on another field's value. */
const DEPENDENTS: Record<string, Array<keyof Registration>> = { businessType: ["pharmacyLicenceNumber"], password: ["confirmPassword"] };

const readDraft = (): Partial<Registration> => {
  try {
    return JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) ?? "{}");
  } catch {
    return {};
  }
};
const writeDraft = (value: Registration) => {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(Object.fromEntries(DRAFT_FIELDS.map((field) => [field, value[field]]))));
  } catch {
    /* Storage can be unavailable (private mode); the form still works without a draft. */
  }
};
const clearDraft = () => {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
};

export function RegistrationWizard() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState<RegistrationResponse | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const form = useForm<Registration>({ defaultValues: emptyRegistration });
  const { register, control, getValues, setError, clearErrors, watch, reset, formState: { errors, isSubmitting } } = form;

  // Restore a saved draft (text fields only) and keep it updated as the visitor types.
  useEffect(() => {
    const draft = readDraft();
    if (Object.keys(draft).length) reset({ ...emptyRegistration, ...draft });
    const subscription = watch((value) => writeDraft(value as Registration));
    return () => subscription.unsubscribe();
  }, [reset, watch]);

  // Once a field has been flagged, re-check it (and fields that depend on it) as it changes.
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (!name) return;
      const related = [name, ...(DEPENDENTS[name] ?? [])] as Array<keyof Registration>;
      const flagged = related.filter((field) => form.formState.errors[field]);
      if (!flagged.length) return;
      const issues = validateFields(value as Registration, flagged);
      for (const field of flagged) {
        const message = issues[field];
        if (message) setError(field as FieldPath<Registration>, { message });
        else clearErrors(field as FieldPath<Registration>);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setError, clearErrors, form]);

  const applyIssues = useCallback(
    (fields: Array<keyof Registration>) => {
      const issues = validateFields(getValues(), fields);
      clearErrors(fields as FieldPath<Registration>[]);
      const entries = Object.entries(issues) as Array<[keyof Registration, string]>;
      for (const [field, message] of entries) setError(field as FieldPath<Registration>, { message });
      if (entries[0]) document.getElementById(String(entries[0][0]))?.focus({ preventScroll: false });
      return entries.length === 0;
    },
    [getValues, setError, clearErrors],
  );

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setServerError("");
    requestAnimationFrame(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const next = () => {
    if (applyIssues(REGISTRATION_STEPS[step].fields)) goTo(step + 1);
  };

  const submit = async () => {
    // Re-check every step; jump to the first one that still needs attention.
    for (let index = 0; index < REGISTRATION_STEPS.length - 1; index += 1) {
      if (!applyIssues(REGISTRATION_STEPS[index].fields)) {
        goTo(index);
        return;
      }
    }
    setServerError("");
    try {
      const response = await apiRequest<RegistrationResponse>("/api/v1/registrations", { method: "POST", body: toFormData(getValues()) });
      clearDraft();
      setResult(response);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      setServerError(cause instanceof ApiRequestError ? cause.message : "Registration failed. Please try again.");
    }
  };

  if (result) return <RegistrationSuccess result={result} />;

  const values = watch();
  const current = REGISTRATION_STEPS[step];
  const isLast = step === REGISTRATION_STEPS.length - 1;

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
      {/* ------------------------------ stepper ------------------------------ */}
      <aside className="rounded-3xl border border-sage-200/80 bg-white p-4 shadow-soft lg:sticky lg:top-24 lg:self-start">
        <div className="lg:hidden">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-forest-900">{current.title}</span>
            <span className="text-sage-500">Step {step + 1} of {REGISTRATION_STEPS.length}</span>
          </div>
          <Progress value={((step + 1) / REGISTRATION_STEPS.length) * 100} className="mt-3 h-1.5 bg-sage-200 [&>*]:bg-brand-600" />
        </div>

        <ol className="hidden gap-1 lg:grid">
          {REGISTRATION_STEPS.map((item, index) => {
            const Icon = STEP_ICONS[index];
            const state = index < step ? "done" : index === step ? "current" : "upcoming";
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => index < step && goTo(index)}
                  disabled={index > step}
                  aria-current={state === "current" ? "step" : undefined}
                  className={cn(
                    "group relative flex w-full items-start gap-4 rounded-2xl p-3 text-left transition-colors",
                    state === "current" && "bg-brand-50/70 ring-1 ring-brand-100",
                    state === "done" && "cursor-pointer hover:bg-sage-50",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg transition-colors",
                      state === "current" && "bg-brand-600 text-white shadow-md shadow-brand-600/30",
                      state === "done" && "bg-brand-100 text-brand-700",
                      state === "upcoming" && "bg-sage-100 text-sage-400",
                    )}
                  >
                    {state === "done" ? <Check className="size-4.5" /> : <Icon className="size-4.5" />}
                  </span>
                  <span className="pt-0.5">
                    <span className={cn("block text-sm font-semibold", state === "upcoming" ? "text-sage-500" : "text-forest-900")}>{item.title}</span>
                    <span className="mt-0.5 block text-xs text-sage-500">{item.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 hidden rounded-2xl border border-gold-200 bg-gold-50 p-5 lg:block">
          <p className="text-sm font-semibold text-forest-900">Have these ready</p>
          <ul className="mt-3 grid gap-2 text-xs text-sage-700">
            {DOCUMENTS.filter((document) => document.required).map((document) => (
              <li key={document.field} className="flex items-start gap-2"><CheckCircle2 className="mt-px size-3.5 shrink-0 text-gold-600" /> {document.label}</li>
            ))}
          </ul>
          <p className="mt-4 border-t border-gold-200 pt-3 text-xs text-sage-600">Applications are reviewed within 24–48 business hours.</p>
        </div>
      </aside>

      {/* -------------------------------- card -------------------------------- */}
      <div ref={cardRef} className="scroll-mt-24 overflow-hidden rounded-3xl border border-sage-200/80 bg-white shadow-soft">
        <div className="border-b border-sage-100 px-6 py-5 sm:px-8">
          <p className="text-xs font-bold tracking-[0.16em] text-brand-600 uppercase">Step {step + 1} of {REGISTRATION_STEPS.length}</p>
          <h2 className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-forest-900 sm:text-2xl">{current.title}</h2>
          <p className="mt-1 text-sm text-sage-600">{current.description}</p>
        </div>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (isLast) void submit();
            else next();
          }}
        >
          <div className="relative px-6 py-6 sm:px-8">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="grid gap-5"
              >
                {current.id === "business" && (
                  <>
                    <fieldset className="grid gap-3">
                      <legend className="mb-3 text-sm font-semibold text-forest-900">Business type<span className="text-brand-600" aria-hidden="true">*</span></legend>
                      <Controller
                        control={control}
                        name="businessType"
                        render={({ field }) => (
                          <div role="radiogroup" aria-label="Business type" id="businessType" tabIndex={-1} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {BUSINESS_TYPES.map((type) => {
                              const Icon = TYPE_ICONS[type.value];
                              const selected = field.value === type.value;
                              return (
                                <button
                                  key={type.value}
                                  type="button"
                                  role="radio"
                                  aria-checked={selected}
                                  onClick={() => field.onChange(type.value)}
                                  className={cn(
                                    "relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                                    selected ? "border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-500" : "border-sage-200 hover:border-brand-300 hover:bg-sage-50",
                                  )}
                                >
                                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg transition-colors", selected ? "bg-brand-600 text-white" : "bg-sage-100 text-sage-600")}>
                                    <Icon className="size-4.5" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-forest-900">{type.label}</span>
                                    <span className="block truncate text-xs text-sage-500">{type.hint}</span>
                                  </span>
                                  {selected && <CheckCircle2 className="absolute top-2.5 right-2.5 size-4 text-brand-600" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      />
                      {errors.businessType && <p className="text-sm text-destructive">{errors.businessType.message}</p>}
                    </fieldset>

                    <Field id="businessName" label="Registered business name" required error={errors.businessName?.message} className="sm:col-span-2">
                      <Input className="h-10" autoComplete="organization" placeholder="e.g. Pharmacie Conseil Kigali Ltd" {...register("businessName")} {...fieldProps("businessName", errors.businessName?.message)} />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="registrationNumber" label="RDB registration number" required error={errors.registrationNumber?.message}>
                        <Input className="h-10" {...register("registrationNumber")} {...fieldProps("registrationNumber", errors.registrationNumber?.message)} />
                      </Field>
                      <Field id="tin" label="TIN number" required hint="Exactly 9 digits, as issued by RRA." error={errors.tin?.message}>
                        <Input className="h-10 tabular-nums" inputMode="numeric" maxLength={9} placeholder="123456789" {...register("tin")} {...fieldProps("tin", errors.tin?.message, true)} />
                      </Field>
                      <Field id="operatingLicenceNumber" label="Operating licence number" required error={errors.operatingLicenceNumber?.message}>
                        <Input className="h-10" {...register("operatingLicenceNumber")} {...fieldProps("operatingLicenceNumber", errors.operatingLicenceNumber?.message)} />
                      </Field>
                      <Field
                        id="pharmacyLicenceNumber"
                        label="Pharmacy licence number"
                        required={values.businessType === "PHARMACY"}
                        hint={values.businessType === "PHARMACY" ? "Required for pharmacies." : "Only needed for pharmacies."}
                        error={errors.pharmacyLicenceNumber?.message}
                      >
                        <Input className="h-10" {...register("pharmacyLicenceNumber")} {...fieldProps("pharmacyLicenceNumber", errors.pharmacyLicenceNumber?.message, true)} />
                      </Field>
                      <Field id="vatRegistrationNumber" label="VAT registration number" hint="Optional." error={errors.vatRegistrationNumber?.message}>
                        <Input className="h-10" {...register("vatRegistrationNumber")} {...fieldProps("vatRegistrationNumber", errors.vatRegistrationNumber?.message, true)} />
                      </Field>
                    </div>
                  </>
                )}

                {current.id === "contact" && (
                  <>
                    <SectionTitle icon={<MapPin />} title="Business location" />
                    <Field id="streetAddress" label="Street address" required error={errors.streetAddress?.message}>
                      <Input className="h-10" autoComplete="street-address" placeholder="e.g. KG 11 Ave, Kimihurura" {...register("streetAddress")} {...fieldProps("streetAddress", errors.streetAddress?.message)} />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="country" label="Country" required error={errors.country?.message}>
                        <Controller
                          control={control}
                          name="country"
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue("district", "");
                              }}
                            >
                              <SelectTrigger id="country" className="h-10 w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>{COUNTRIES.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}</SelectContent>
                            </Select>
                          )}
                        />
                      </Field>
                      <Field id="district" label={values.country === "Rwanda" ? "District" : "District / region"} required error={errors.district?.message}>
                        {values.country === "Rwanda" ? (
                          <Controller
                            control={control}
                            name="district"
                            render={({ field }) => (
                              <Select value={field.value || undefined} onValueChange={field.onChange}>
                                <SelectTrigger id="district" className="h-10 w-full" aria-invalid={errors.district ? true : undefined}>
                                  <SelectValue placeholder="Select a district" />
                                </SelectTrigger>
                                <SelectContent className="max-h-80">
                                  {RWANDA_DISTRICTS.map((group) => (
                                    <SelectGroup key={group.province}>
                                      <SelectLabel>{group.province}</SelectLabel>
                                      {group.districts.map((district) => <SelectItem key={district} value={district}>{district}</SelectItem>)}
                                    </SelectGroup>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        ) : (
                          <Input className="h-10" {...register("district")} {...fieldProps("district", errors.district?.message)} />
                        )}
                      </Field>
                    </div>

                    <SectionTitle icon={<UserRound />} title="Primary contact" />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="fullName" label="Full name" required error={errors.fullName?.message}>
                        <Input className="h-10" autoComplete="name" {...register("fullName")} {...fieldProps("fullName", errors.fullName?.message)} />
                      </Field>
                      <Field id="jobTitle" label="Job title / role" required error={errors.jobTitle?.message}>
                        <Input className="h-10" autoComplete="organization-title" placeholder="e.g. Pharmacist in charge" {...register("jobTitle")} {...fieldProps("jobTitle", errors.jobTitle?.message)} />
                      </Field>
                      <Field id="email" label="Business email" required hint="You’ll sign in with this address." error={errors.email?.message}>
                        <Input className="h-10" type="email" autoComplete="email" placeholder="name@company.com" {...register("email")} {...fieldProps("email", errors.email?.message, true)} />
                      </Field>
                      <Field id="professionalLicenceNumber" label="Professional licence number" hint="For pharmacists, if applicable." error={errors.professionalLicenceNumber?.message}>
                        <Input className="h-10" {...register("professionalLicenceNumber")} {...fieldProps("professionalLicenceNumber", errors.professionalLicenceNumber?.message, true)} />
                      </Field>
                      <Field id="phone" label="Phone number" required error={errors.phone?.message}>
                        <Input className="h-10" type="tel" autoComplete="tel" placeholder="+250 7xx xxx xxx" {...register("phone")} {...fieldProps("phone", errors.phone?.message)} />
                      </Field>
                      <Field id="whatsapp" label="WhatsApp number" hint="Optional." error={errors.whatsapp?.message}>
                        <Input className="h-10" type="tel" placeholder="+250" {...register("whatsapp")} {...fieldProps("whatsapp", errors.whatsapp?.message, true)} />
                      </Field>
                    </div>
                    <Controller
                      control={control}
                      name="preferredLanguage"
                      render={({ field }) => (
                        <fieldset className="grid gap-2">
                          <legend className="mb-2 text-sm font-semibold text-forest-900">Preferred language</legend>
                          <div role="radiogroup" aria-label="Preferred language" className="inline-flex w-fit flex-wrap gap-1 rounded-xl bg-sage-100 p-1">
                            {LANGUAGES.map((language) => (
                              <button
                                key={language.value}
                                type="button"
                                role="radio"
                                aria-checked={field.value === language.value}
                                onClick={() => field.onChange(language.value)}
                                className={cn(
                                  "cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                                  field.value === language.value ? "bg-white text-forest-900 shadow-sm" : "text-sage-600 hover:text-forest-900",
                                )}
                              >
                                {language.label}
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      )}
                    />
                  </>
                )}

                {current.id === "documents" && (
                  <>
                    <p className="-mt-2 rounded-2xl bg-sage-50 p-4 text-sm leading-relaxed text-sage-700">
                      Upload clear scans or photos. Each file can be a PDF, JPG or PNG up to 10 MB. Documents are stored securely and only reviewed by FLR compliance staff.
                    </p>
                    <div className="grid gap-5 md:grid-cols-2">
                      {DOCUMENTS.map((document) => (
                        <Controller
                          key={document.field}
                          control={control}
                          name={document.field}
                          render={({ field }) => (
                            <FileDrop
                              id={document.field}
                              label={document.label}
                              description={document.field === "pharmacyLicence" && values.businessType === "PHARMACY" ? "Recommended for your pharmacy application" : document.description}
                              required={document.required}
                              file={field.value}
                              error={errors[document.field]?.message}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}

                {current.id === "security" && (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="password" label="Password" required error={errors.password?.message}>
                        <PasswordInput autoComplete="new-password" {...register("password")} {...fieldProps("password", errors.password?.message)} />
                      </Field>
                      <Field id="confirmPassword" label="Confirm password" required error={errors.confirmPassword?.message}>
                        <PasswordInput autoComplete="new-password" {...register("confirmPassword")} {...fieldProps("confirmPassword", errors.confirmPassword?.message)} />
                      </Field>
                    </div>
                    <PasswordChecklist value={values.password} />

                    <SectionTitle icon={<ClipboardCheck />} title="Agreements" />
                    <div className="grid gap-3">
                      {([
                        ["acceptTerms", "I accept the FLR Ltd. wholesale Terms & Conditions."],
                        ["acceptPrivacy", "I accept the Privacy Policy and data processing terms."],
                        ["acceptWholesaleAgreement", "I understand that wholesale pricing is confidential."],
                      ] as const).map(([name, text]) => (
                        <Controller
                          key={name}
                          control={control}
                          name={name}
                          render={({ field }) => (
                            <div>
                              <label
                                htmlFor={name}
                                className={cn(
                                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                                  field.value ? "border-brand-200 bg-brand-50/60" : "border-sage-200 hover:bg-sage-50",
                                  errors[name] && "border-destructive/40 bg-destructive/5",
                                )}
                              >
                                <Checkbox id={name} checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} className="mt-0.5" aria-invalid={errors[name] ? true : undefined} />
                                <span className="text-sm leading-relaxed text-forest-900">{text}<span className="text-brand-600" aria-hidden="true">*</span></span>
                              </label>
                              {errors[name] && <p className="mt-1.5 text-sm text-destructive">{errors[name]?.message}</p>}
                            </div>
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}

                {current.id === "review" && <Review values={values} onEdit={goTo} />}
              </motion.div>
            </AnimatePresence>

            {serverError && (
              <Alert variant="destructive" className="mt-6 animate-in fade-in slide-in-from-top-1 border-destructive/30 bg-destructive/5">
                <AlertCircle />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-sage-100 bg-sage-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            {step > 0 ? (
              <Button type="button" variant="outline" size="lg" onClick={() => goTo(step - 1)} disabled={isSubmitting}>
                <ArrowLeft /> Back
              </Button>
            ) : (
              <p className="text-sm text-sage-500">Fields marked <span className="text-brand-600">*</span> are required.</p>
            )}
            <Button type="submit" size="xl" disabled={isSubmitting} className="sm:min-w-52">
              {isLast ? (
                isSubmitting ? <><Loader2 className="animate-spin" /> Submitting securely…</> : <>Submit application <CheckCircle2 /></>
              ) : (
                <>Continue <ArrowRight /></>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700 [&_svg]:size-4">{icon}</span>
      <h3 className="font-semibold text-forest-900">{title}</h3>
      <span className="h-px flex-1 bg-sage-200" />
    </div>
  );
}

function Review({ values, onEdit }: { values: Registration; onEdit: (step: number) => void }) {
  const type = BUSINESS_TYPES.find((entry) => entry.value === values.businessType)?.label ?? "—";
  const language = LANGUAGES.find((entry) => entry.value === values.preferredLanguage)?.label;
  const groups: Array<{ step: number; title: string; rows: Array<[string, string | undefined]> }> = [
    {
      step: 0,
      title: "Business profile",
      rows: [
        ["Business type", type],
        ["Business name", values.businessName],
        ["RDB registration", values.registrationNumber],
        ["TIN", values.tin],
        ["Operating licence", values.operatingLicenceNumber],
        ["Pharmacy licence", values.pharmacyLicenceNumber || "—"],
        ["VAT registration", values.vatRegistrationNumber || "—"],
      ],
    },
    {
      step: 1,
      title: "Location & contact",
      rows: [
        ["Address", [values.streetAddress, values.district, values.country].filter(Boolean).join(", ")],
        ["Contact", `${values.fullName} · ${values.jobTitle}`],
        ["Email", values.email],
        ["Phone", [values.phone, values.whatsapp && `WhatsApp ${values.whatsapp}`].filter(Boolean).join(" · ")],
        ["Language", language],
      ],
    },
  ];

  return (
    <div className="grid gap-5">
      {groups.map((group) => (
        <section key={group.title} className="rounded-2xl border border-sage-200">
          <header className="flex items-center justify-between border-b border-sage-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-forest-900">{group.title}</h3>
            <button type="button" onClick={() => onEdit(group.step)} className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
              <PencilLine className="size-3.5" /> Edit
            </button>
          </header>
          <dl className="grid gap-x-6 gap-y-3 p-5 sm:grid-cols-2">
            {group.rows.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs text-sage-500">{label}</dt>
                <dd className="mt-0.5 truncate text-sm font-medium text-forest-900">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <section className="rounded-2xl border border-sage-200">
        <header className="flex items-center justify-between border-b border-sage-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-forest-900">Documents</h3>
          <button type="button" onClick={() => onEdit(2)} className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
            <PencilLine className="size-3.5" /> Edit
          </button>
        </header>
        <ul className="divide-y divide-sage-100">
          {DOCUMENTS.map((document) => {
            const file = values[document.field];
            return (
              <li key={document.field} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", file ? "bg-brand-50 text-brand-700" : "bg-sage-100 text-sage-400")}>
                  {file ? <Check className="size-4" /> : <FileText className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-forest-900">{document.label}</span>
                  <span className="block truncate text-xs text-sage-500">{file ? `${file.name} · ${fileSizeLabel(file.size)}` : "Not provided"}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <p className="text-sm leading-relaxed text-sage-600">
        By submitting, you confirm the information above is accurate. FLR’s compliance team will verify your documents and email you the outcome.
      </p>
    </div>
  );
}

function RegistrationSuccess({ result }: { result: RegistrationResponse }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard access can be blocked; the reference stays visible to copy by hand. */
    }
  };
  const steps = [
    { title: "Application received", text: "Your documents are stored securely.", done: true },
    { title: "Compliance review", text: "Usually within 24–48 business hours.", done: false },
    { title: "Account activated", text: "We’ll email you when you can sign in and order.", done: false },
  ];

  return (
    <div className="mx-auto max-w-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="overflow-hidden rounded-3xl border border-sage-200/80 bg-white text-center shadow-soft">
        <div className="relative isolate bg-forest-900 px-8 py-12 text-white">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(400px_220px_at_50%_0%,rgb(61_153_67/0.5),transparent_70%)]" />
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/40">
            <CheckCircle2 className="size-8" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">Application received</h2>
          <p className="mx-auto mt-3 max-w-md text-forest-100/80">{result.message}</p>
        </div>
        <div className="grid gap-8 p-8 sm:p-10">
          <div>
            <p className="text-sm text-sage-500">Your reference</p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-sage-200 bg-sage-50 py-2 pr-2 pl-5">
              <code className="font-display text-lg font-extrabold tracking-wide text-forest-900">{result.reference}</code>
              <Button type="button" variant="ghost" size="sm" onClick={copy} aria-label="Copy reference">
                {copied ? <><Check /> Copied</> : <><Copy /> Copy</>}
              </Button>
            </div>
            <p className="mt-3 text-sm text-sage-500">Keep this reference for any communication with the FLR team.</p>
          </div>
          <ol className="grid gap-4 text-left sm:grid-cols-3">
            {steps.map((item, index) => (
              <li key={item.title} className="rounded-2xl border border-sage-200 p-4">
                <span className={cn("grid size-8 place-items-center rounded-full text-sm font-bold", item.done ? "bg-brand-600 text-white" : "bg-sage-100 text-sage-600")}>
                  {item.done ? <Check className="size-4" /> : index + 1}
                </span>
                <p className="mt-3 text-sm font-semibold text-forest-900">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-sage-500">{item.text}</p>
              </li>
            ))}
          </ol>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="xl"><Link href="/login">Go to sign in</Link></Button>
            <Button asChild size="xl" variant="outline"><Link href="/">Back to website</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
