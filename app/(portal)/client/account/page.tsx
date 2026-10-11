"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, BadgeCheck, Building2, Check, Loader2, Mail, MapPin, Pencil, Phone, Plus, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorBanner, PageHeader, Panel } from "@/components/portal/portal-ui";
import { api, errorMessage } from "@/lib/api";
import type { CreditPosition } from "@/lib/client-types";
import { date, humanise, money } from "@/lib/format";
import { cn } from "@/lib/utils";

type Account = {
  id: string; name: string; type: string; registration_number: string; tin: string; vat_registration_number: string | null;
  pharmacy_licence_number: string | null; operating_licence_number: string | null; street_address: string; district: string;
  country: string; whatsapp: string | null; status: string; approved_at: string; credit_limit_rwf: number | string;
  payment_terms_days: number; credit_hold: boolean; price_tier: string | null; discount_percent: number | string | null;
  contact: { fullName: string; email: string; phone: string; jobTitle: string; preferredLanguage: string };
  credit: CreditPosition;
};

type Address = { id: string; label: string; recipient_name: string; phone: string; street_address: string; district: string; country: string; is_default: boolean; created_at: string };

function FormField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-semibold text-forest-900">{label}</Label>
      {children}
    </div>
  );
}

export default function ClientAccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [removing, setRemoving] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState("en");
  const [makeDefaultNew, setMakeDefaultNew] = useState(false);

  const load = useCallback(() => {
    setError("");
    return Promise.all([api.get<{ data: Account }>("/api/v1/account"), api.get<{ data: Address[] }>("/api/v1/account/addresses")])
      .then(([profile, delivery]) => {
        setAccount(profile.data);
        setAddresses(delivery.data);
        setLanguage(profile.data.contact.preferredLanguage || "en");
      })
      .catch((cause) => setError(errorMessage(cause, "Your account could not be loaded.")));
  }, []);
  useEffect(() => void load(), [load]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await api.patch("/api/v1/account", { fullName: form.get("fullName"), jobTitle: form.get("jobTitle"), phone: form.get("phone"), preferredLanguage: language, whatsapp: form.get("whatsapp") });
      toast.success("Your contact details were updated");
      setEditing(false);
      void load();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function addAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await api.post("/api/v1/account/addresses", {
        label: form.get("label"), recipientName: form.get("recipientName"), phone: form.get("phone"), streetAddress: form.get("streetAddress"),
        district: form.get("district"), country: form.get("country"), isDefault: makeDefaultNew,
      });
      toast.success("Delivery address added");
      setAddingAddress(false);
      setMakeDefaultNew(false);
      void load();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function makeDefault(address: Address) {
    try {
      await api.patch(`/api/v1/account/addresses/${address.id}`, { isDefault: true });
      toast.success(`${address.label} is now your default delivery address`);
      void load();
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  }

  async function removeAddress() {
    if (!removing) return;
    try {
      await api.delete(`/api/v1/account/addresses/${removing.id}`);
      toast.success("Delivery address removed");
      void load();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setRemoving(null);
    }
  }

  if (!account && !error) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-16 w-80 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const details: Array<[string, React.ReactNode]> = account
    ? [
        ["Registration number", account.registration_number],
        ["TIN", account.tin],
        ["VAT registration", account.vat_registration_number || "Not provided"],
        ["Operating licence", account.operating_licence_number || "Not provided"],
        ["Pharmacy licence", account.pharmacy_licence_number || "Not provided"],
        ["Approved since", date(account.approved_at, "long")],
        ["Registered address", `${account.street_address}, ${account.district}, ${account.country}`],
      ]
    : [];

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Settings"
        title="Business account"
        description="Contact preferences, delivery locations and your approved wholesale terms."
        actions={account && <Button variant="outline" onClick={() => setEditing(true)}><Pencil /> Edit contact details</Button>}
      />

      {error && <ErrorBanner message={error} onRetry={() => void load()} />}

      {account && (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-6">
            <Panel>
              <div className="flex flex-wrap items-center gap-4 p-5">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100"><Building2 className="size-5.5" /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-bold text-forest-900">{account.name}</h2>
                  <p className="text-sm text-sage-500">{humanise(account.type)} · TIN {account.tin}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                  <BadgeCheck className="size-3.5" /> Verified partner
                </span>
              </div>
              <dl className="grid border-t border-sage-100 sm:grid-cols-2">
                {details.map(([label, value], index) => (
                  <div key={label} className={cn("border-b border-sage-100 px-5 py-3.5", index % 2 === 0 && "sm:border-r", index === details.length - 1 && "sm:col-span-2 sm:border-r-0 border-b-0")}>
                    <dt className="text-xs text-sage-500">{label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-forest-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>

            <Panel eyebrow="Shipping" title="Delivery addresses" action={<Button variant="outline" size="sm" onClick={() => setAddingAddress(true)}><Plus /> Add address</Button>}>
              {addresses.length ? (
                <ul className="grid gap-3 p-5 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <li key={address.id} className={cn("flex flex-col rounded-xl border p-4", address.is_default ? "border-brand-300 bg-brand-50/50" : "border-sage-200")}>
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 size-4.5 shrink-0 text-brand-600" />
                        <div className="min-w-0 flex-1 text-sm">
                          <p className="flex items-center gap-2 font-semibold text-forest-900">
                            {address.label}
                            {address.is_default && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">Default</span>}
                          </p>
                          <p className="mt-1 text-sage-600">{address.recipient_name} · {address.phone}</p>
                          <p className="text-sage-600">{address.street_address}, {address.district}, {address.country}</p>
                        </div>
                      </div>
                      {!address.is_default && (
                        <div className="mt-3 flex gap-2 border-t border-sage-100 pt-3">
                          <Button size="sm" variant="ghost" onClick={() => makeDefault(address)}><Check /> Make default</Button>
                          <Button size="sm" variant="ghost" className="text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => setRemoving(address)}><Trash2 /> Remove</Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={<MapPin />} title="No saved delivery address" text="Add an address to make checkout and delivery planning easier." action={<Button variant="outline" onClick={() => setAddingAddress(true)}><Plus /> Add address</Button>} />
              )}
            </Panel>
          </div>

          <aside className="grid gap-6">
            <section className="relative isolate overflow-hidden rounded-2xl bg-forest-900 p-6 text-white shadow-soft">
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(300px_200px_at_100%_0%,rgb(249_168_37/0.25),transparent_70%)]" />
              <p className="text-xs font-bold tracking-[0.14em] text-gold-300 uppercase">Commercial terms</p>
              <h2 className="mt-1 font-display text-lg font-bold">{account.price_tier || "Standard"} pricing</h2>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold text-gold-400">{Number(account.discount_percent || 0)}%</span>
                <span className="text-sm text-forest-100/75">contract discount</span>
              </p>
              <dl className="mt-5 grid gap-2.5 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-forest-100/70">Credit limit</dt><dd className="font-semibold tabular-nums">{money(account.credit_limit_rwf)}</dd></div>
                <div className="flex justify-between"><dt className="text-forest-100/70">Available credit</dt><dd className="font-semibold tabular-nums">{money(account.credit.availableRwf)}</dd></div>
                <div className="flex justify-between"><dt className="text-forest-100/70">Payment terms</dt><dd className="font-semibold">{account.payment_terms_days ? `${account.payment_terms_days} days` : "Prepayment"}</dd></div>
              </dl>
              {account.credit_hold && (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-100 ring-1 ring-red-300/30">
                  <AlertTriangle className="size-4" /> Account is on credit hold
                </p>
              )}
            </section>

            <Panel eyebrow="Primary contact" title={account.contact.fullName} bodyClassName="grid gap-2.5 p-5 text-sm">
              <p className="flex items-center gap-2.5 text-sage-600"><UserRound className="size-4 text-sage-400" /> {account.contact.jobTitle}</p>
              <p className="flex items-center gap-2.5 text-sage-600"><Mail className="size-4 text-sage-400" /> {account.contact.email}</p>
              <p className="flex items-center gap-2.5 text-sage-600"><Phone className="size-4 text-sage-400" /> {account.contact.phone}</p>
            </Panel>
          </aside>
        </div>
      )}

      {/* ---------------------------- edit contact --------------------------- */}
      <Sheet open={editing} onOpenChange={setEditing}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-sage-100 px-6 py-5">
            <SheetTitle className="font-display text-lg font-bold text-forest-900">Edit contact details</SheetTitle>
            <SheetDescription>To change registered company details or your sign-in email, contact your FLR account manager.</SheetDescription>
          </SheetHeader>
          {account && (
            <form onSubmit={saveProfile} className="flex flex-1 flex-col">
              <div className="grid flex-1 content-start gap-4 overflow-y-auto px-6 py-6">
                <FormField id="fullName" label="Full name"><Input id="fullName" name="fullName" defaultValue={account.contact.fullName} required className="h-10" /></FormField>
                <FormField id="jobTitle" label="Job title"><Input id="jobTitle" name="jobTitle" defaultValue={account.contact.jobTitle} required className="h-10" /></FormField>
                <FormField id="phone" label="Phone"><Input id="phone" name="phone" type="tel" defaultValue={account.contact.phone} required className="h-10" /></FormField>
                <FormField id="whatsapp" label="WhatsApp (optional)"><Input id="whatsapp" name="whatsapp" type="tel" defaultValue={account.whatsapp ?? ""} className="h-10" /></FormField>
                <FormField id="language" label="Preferred language">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="h-10 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="rw">Kinyarwanda</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <SheetFooter className="flex-row justify-end border-t border-sage-100 bg-sage-50/70 px-6 py-4">
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />} Save changes</Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* ---------------------------- add address ---------------------------- */}
      <Sheet open={addingAddress} onOpenChange={setAddingAddress}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-sage-100 px-6 py-5">
            <SheetTitle className="font-display text-lg font-bold text-forest-900">Add delivery address</SheetTitle>
            <SheetDescription>Where should FLR deliver orders for this location?</SheetDescription>
          </SheetHeader>
          {account && (
            <form onSubmit={addAddress} className="flex flex-1 flex-col">
              <div className="grid flex-1 content-start gap-4 overflow-y-auto px-6 py-6">
                <FormField id="label" label="Address label"><Input id="label" name="label" placeholder="e.g. Main pharmacy" required className="h-10" /></FormField>
                <FormField id="recipientName" label="Recipient name"><Input id="recipientName" name="recipientName" defaultValue={account.contact.fullName} required className="h-10" /></FormField>
                <FormField id="addressPhone" label="Phone"><Input id="addressPhone" name="phone" type="tel" defaultValue={account.contact.phone} required className="h-10" /></FormField>
                <FormField id="streetAddress" label="Street address"><Input id="streetAddress" name="streetAddress" required className="h-10" /></FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField id="district" label="District"><Input id="district" name="district" defaultValue={account.district} required className="h-10" /></FormField>
                  <FormField id="country" label="Country"><Input id="country" name="country" defaultValue="Rwanda" required className="h-10" /></FormField>
                </div>
                <div className="flex items-center gap-2.5">
                  <Checkbox id="isDefault" checked={makeDefaultNew} onCheckedChange={(checked) => setMakeDefaultNew(checked === true)} />
                  <Label htmlFor="isDefault" className="text-sm font-medium text-sage-700">Use as my default delivery address</Label>
                </div>
              </div>
              <SheetFooter className="flex-row justify-end border-t border-sage-100 bg-sage-50/70 px-6 py-4">
                <Button type="button" variant="outline" onClick={() => setAddingAddress(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />} Add address</Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* --------------------------- remove address -------------------------- */}
      <AlertDialog open={Boolean(removing)} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove “{removing?.label}”?</AlertDialogTitle>
            <AlertDialogDescription>This delivery address will no longer be available at checkout.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep address</AlertDialogCancel>
            <AlertDialogAction onClick={removeAddress} className="bg-destructive text-white hover:bg-destructive/90">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
