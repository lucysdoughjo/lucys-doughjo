import { Logo, type LogoVariant } from "@/components/logo";

const colors = [
  { name: "Cream", token: "cream", hex: "#F9F5EE" },
  { name: "Espresso", token: "espresso", hex: "#3B2416" },
  { name: "Terracotta", token: "terracotta", hex: "#C65A3E" },
  { name: "Sage", token: "sage", hex: "#8A987A" },
  { name: "Golden Wheat", token: "golden-wheat", hex: "#D9B368" },
  { name: "Berry Jam", token: "berry-jam", hex: "#8B2E3B" },
] as const;

const semanticColors = [
  { name: "background", mapsTo: "Cream" },
  { name: "foreground", mapsTo: "Espresso" },
  { name: "primary", mapsTo: "Terracotta" },
  { name: "secondary", mapsTo: "Sage" },
  { name: "highlight", mapsTo: "Golden Wheat" },
  { name: "accent", mapsTo: "Berry Jam" },
] as const;

const logoSuite: {
  variant: LogoVariant;
  title: string;
  usage: string;
  className: string;
}[] = [
  {
    variant: "seal",
    title: "Primary seal",
    usage: "Packaging, labels, market signage, profile images",
    className: "mx-auto h-auto w-full max-w-[220px]",
  },
  {
    variant: "horizontal",
    title: "Horizontal logo",
    usage: "Website headers, email headers, social covers",
    className: "mx-auto h-auto w-full max-w-md",
  },
  {
    variant: "wordmark",
    title: "Wordmark",
    usage: "Clean typographic option for digital and branded work",
    className: "mx-auto h-auto w-full max-w-sm",
  },
  {
    variant: "wheat",
    title: "Wheat submark",
    usage: "Favicon, small UI, graphic accents",
    className: "mx-auto h-auto w-16",
  },
];

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 font-sans">
      <header className="mb-16 border-b border-espresso/10 pb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-secondary">
          Lucy's Doughjo
        </p>
        <h1 className="mt-2 font-serif text-5xl font-semibold tracking-tight text-foreground">
          Design System
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/80">
          Brand colors, typography, logos, and messaging for the website. Use
          semantic tokens in components; official logo assets for identity.
        </p>
      </header>

      <section className="mb-20">
        <h2 className="font-serif text-3xl font-semibold text-foreground">
          Color palette
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((color) => (
            <article
              key={color.token}
              className="overflow-hidden rounded-lg border border-espresso/10 bg-white/40"
            >
              <div
                className="h-28 w-full"
                style={{ backgroundColor: color.hex }}
                aria-hidden
              />
              <div className="p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  {color.name}
                </h3>
                <p className="mt-1 font-mono text-xs text-foreground/70">
                  {color.hex}
                </p>
                <p className="mt-1 text-xs text-foreground/60">
                  bg-{color.token}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-secondary">
            Semantic aliases
          </h3>
          <ul className="mt-4 divide-y divide-espresso/10 rounded-lg border border-espresso/10">
            {semanticColors.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-foreground/60">→ {item.mapsTo}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="font-serif text-3xl font-semibold text-foreground">
          Typography
        </h2>

        <div className="mt-10 space-y-12">
          <article className="border-b border-espresso/10 pb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Primary serif — Cormorant Garamond
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              Headlines, primary brand line, and brand storytelling
            </p>
            <p className="mt-6 font-serif text-5xl font-semibold leading-tight sm:text-6xl">
              Where Joy Meets the Dough.
            </p>
            <div className="mt-6 flex flex-wrap gap-8 text-foreground/90">
              <span className="font-serif text-xl font-normal">
                Regular 400
              </span>
              <span className="font-serif text-xl font-medium">
                Medium 500
              </span>
              <span className="font-serif text-xl font-semibold">
                Semibold 600
              </span>
            </div>
          </article>

          <article className="border-b border-espresso/10 pb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Primary sans — Montserrat
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              Body copy, navigation, buttons, lockup labels (Microbakery ·
              Chino, CA)
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed">
              Our sourdough starts with a slow fermentation and finishes in a
              blazing hearth oven. Every loaf is shaped by hand at Lucy's
              Doughjo.
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.25em] text-foreground/80">
              Microbakery · Chino, CA
            </p>
            <div className="mt-6 flex flex-wrap gap-8">
              <span className="text-base font-normal">Regular 400</span>
              <span className="text-base font-medium">Medium 500</span>
              <span className="text-base font-semibold">Semibold 600</span>
            </div>
          </article>

          <article>
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Accent script — Allura
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              Secondary brand line only — never use for the business name
            </p>
            <p className="mt-6 font-script text-5xl text-primary">
              Baked with Love.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/70">
              The name &quot;Lucy&apos;s Doughjo&quot; always appears in the
              official logo lockup or Montserrat uppercase treatments — not in
              script.
            </p>
          </article>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="font-serif text-3xl font-semibold text-foreground">
          Logo suite
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80">
          Use the mark that fits the space. Do not stretch, recolor, or replace
          type in the provided assets.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {logoSuite.map((item) => (
            <article
              key={item.variant}
              className="flex flex-col rounded-lg border border-espresso/10 bg-white/40 p-6"
            >
              <div className="flex min-h-[140px] flex-1 items-center justify-center py-4">
                <Logo variant={item.variant} className={item.className} />
              </div>
              <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-foreground/70">{item.usage}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="font-serif text-3xl font-semibold text-foreground">
          Key messaging
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <article className="rounded-lg border border-espresso/10 p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Primary brand line
            </p>
            <p className="mt-4 font-serif text-3xl font-semibold leading-snug sm:text-4xl">
              Where Joy Meets the Dough.
            </p>
          </article>
          <article className="rounded-lg border border-espresso/10 p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Secondary brand line
            </p>
            <p className="mt-4 font-script text-4xl text-primary sm:text-5xl">
              Baked with Love.
            </p>
          </article>
        </div>
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <div
            className="h-px w-12 bg-primary"
            aria-hidden
          />
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-foreground/80">
            Microbakery · Chino, CA
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-3xl font-semibold text-foreground">
          UI samples
        </h2>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
          >
            Order pickup
          </button>
          <button
            type="button"
            className="rounded-full border border-espresso/20 bg-cream px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-highlight/30"
          >
            View menu
          </button>
          <span className="inline-flex items-center rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            Seasonal
          </span>
        </div>
      </section>
    </div>
  );
}
