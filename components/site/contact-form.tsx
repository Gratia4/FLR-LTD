"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** Enquiries go to this inbox until the backend has a contact endpoint. */
export const ENQUIRY_EMAIL = "support@flr.rw";

const businessTypes = ["Pharmacy", "Clinic / hospital", "Beauty retailer", "Supermarket", "Wholesale buyer", "Other"] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  company: z.string().trim().min(2, "Enter your business name."),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number."),
  businessType: z.enum(businessTypes, { error: "Choose your business type." }),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(2000),
});

type Enquiry = z.infer<typeof schema>;

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-semibold text-forest-900">{label}</Label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p id={`${id}-error`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm text-destructive">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Enquiry>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", company: "", email: "", phone: "", message: "" },
  });

  const onSubmit = (enquiry: Enquiry) => {
    const body = [
      `Name: ${enquiry.name}`,
      `Company: ${enquiry.company}`,
      `Business type: ${enquiry.businessType}`,
      `Email: ${enquiry.email}`,
      `Phone: ${enquiry.phone}`,
      "",
      enquiry.message,
    ].join("\n");
    window.location.href = `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(`Partner enquiry — ${enquiry.company}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const invalid = (field: keyof Enquiry) => ({ "aria-invalid": errors[field] ? true : undefined, "aria-describedby": errors[field] ? `${field}-error` : undefined });

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center rounded-3xl border border-brand-200 bg-brand-50 p-10 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-brand-600 text-white"><CheckCircle2 className="size-7" /></span>
        <h3 className="mt-5 font-display text-xl font-bold text-forest-900">Your email is ready to send</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-sage-600">
          We opened your email app with the enquiry filled in. If nothing opened, write to <a className="font-semibold text-brand-700 underline" href={`mailto:${ENQUIRY_EMAIL}`}>{ENQUIRY_EMAIL}</a>.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => { reset(); setSent(false); }}>Write another enquiry</Button>
      </motion.div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5 rounded-3xl border border-sage-200/80 bg-white p-6 shadow-soft sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" placeholder="Your name" className="h-10" {...register("name")} {...invalid("name")} />
        </Field>
        <Field id="company" label="Company" error={errors.company?.message}>
          <Input id="company" autoComplete="organization" placeholder="Business name" className="h-10" {...register("company")} {...invalid("company")} />
        </Field>
        <Field id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="name@company.com" className="h-10" {...register("email")} {...invalid("email")} />
        </Field>
        <Field id="phone" label="Phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" placeholder="+250" className="h-10" {...register("phone")} {...invalid("phone")} />
        </Field>
      </div>
      <Field id="businessType" label="Business type" error={errors.businessType?.message}>
        <Controller
          control={control}
          name="businessType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="businessType" className="h-10 w-full" onBlur={field.onBlur} {...invalid("businessType")}>
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
      <Field id="message" label="Message" error={errors.message?.message}>
        <Textarea id="message" rows={5} placeholder="How can FLR help your business?" {...register("message")} {...invalid("message")} />
      </Field>
      <Button type="submit" size="xl" disabled={isSubmitting} className="w-full sm:w-auto sm:justify-self-start">
        <Send /> Send enquiry
      </Button>
    </form>
  );
}
