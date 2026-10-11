import Link from "next/link";
import { Clock3, Mail, MapPin, UserPlus } from "lucide-react";
import { ContactForm, ENQUIRY_EMAIL } from "@/components/site/contact-form";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Container, SectionHeading } from "@/components/site/section";

export const metadata = { title: "Contact" };

const details = [
  { icon: Mail, label: "Email", value: ENQUIRY_EMAIL, href: `mailto:${ENQUIRY_EMAIL}` },
  { icon: MapPin, label: "Service region", value: "Kigali · Rwanda & East Africa" },
  { icon: Clock3, label: "Partner verification", value: "Within 24–48 business hours" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let’s build a reliable supply partnership"
        description="Introduce your business and tell us what you need. Our commercial team will get back to you."
        translation="Présentez votre entreprise et votre demande — notre équipe vous répondra."
        crumbs={[{ href: "/contact", label: "Contact" }]}
        image={{ src: "/images/flr-partner-support.webp", alt: "Illustration of a commercial advisor and healthcare business owner in conversation" }}
      />

      <section className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <Reveal>
            <SectionHeading eyebrow="Partner enquiries" title="How can we help?" description="Office address and phone details will be published after management confirmation." />
            <ul className="mt-10 grid gap-3">
              {details.map((detail) => (
                <li key={detail.label} className="flex items-center gap-4 rounded-2xl border border-sage-200/80 bg-white p-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><detail.icon className="size-5" /></span>
                  <span>
                    <span className="block text-xs font-medium text-sage-500">{detail.label}</span>
                    {detail.href ? (
                      <a href={detail.href} className="font-semibold text-forest-900 hover:text-brand-700">{detail.value}</a>
                    ) : (
                      <span className="font-semibold text-forest-900">{detail.value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/register" className="group mt-6 flex items-center gap-4 rounded-2xl bg-forest-900 p-5 text-white transition hover:bg-forest-800">
              <span className="grid size-11 place-items-center rounded-xl bg-gold-500 text-forest-950"><UserPlus className="size-5" /></span>
              <span className="flex-1">
                <b className="block font-semibold">Ready to order?</b>
                <span className="text-sm text-forest-100/75">Register your business for wholesale access.</span>
              </span>
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
