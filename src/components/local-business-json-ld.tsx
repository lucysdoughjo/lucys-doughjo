import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  getSiteUrl,
} from "@/lib/seo";

type LocalBusinessJsonLdProps = {
  contactEmail: string | null;
};

export function LocalBusinessJsonLd({ contactEmail }: LocalBusinessJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: getSiteUrl().href,
    image: absoluteUrl("/assets/icons/horizontal_logo.png"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chino",
      addressRegion: "CA",
      addressCountry: "US",
    },
    ...(contactEmail
      ? { email: contactEmail }
      : { email: "hello@lucysdoughjo.com" }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
