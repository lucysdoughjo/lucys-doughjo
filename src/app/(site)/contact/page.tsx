import { ContactForm } from "@/components/contact-form";
import { FaqList } from "@/components/faq-list";
import { SectionHeading } from "@/components/section-heading";
import { getFaqItems, getSiteContactSettings } from "@/sanity/fetch";

export const metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const [faqItems, contact] = await Promise.all([
    getFaqItems(),
    getSiteContactSettings(),
  ]);

  const emailEnabled = Boolean(process.env.RESEND_API_KEY?.trim());

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <section id="faq" className="scroll-mt-28">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions & answers"
          description="How weekly preorder, pickup, and delivery work at Lucy's Doughjo."
        />
        <div className="mt-10">
          <FaqList items={faqItems} />
        </div>
      </section>

      <section className="mt-16 border-t border-espresso/10 pt-16">
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch"
          description="Questions about an order, allergens, or markets? Send a message — we'll get back to you as soon as we can."
        />
        <ContactForm
          emailEnabled={emailEnabled}
          contactEmail={contact.contactEmail}
          instagramUrl={contact.instagramUrl}
        />
      </section>
    </div>
  );
}
