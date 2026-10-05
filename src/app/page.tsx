import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Logo
        variant="horizontal"
        priority
        className="h-auto w-full max-w-md"
      />
      <div
        className="mt-8 h-px w-12 bg-primary"
        aria-hidden
      />
      <h1 className="mt-8 max-w-xl font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
        Where Joy Meets the Dough.
      </h1>
      <p className="mt-4 font-script text-4xl text-primary sm:text-5xl">
        Baked with Love.
      </p>
      <p className="mt-6 text-xs font-medium uppercase tracking-[0.25em] text-foreground/70">
        Microbakery · Chino, CA
      </p>
      <p className="mt-8 max-w-md text-base leading-relaxed text-foreground/80">
        Website coming soon. Preview colors, logos, and type in the design
        system.
      </p>
      <Link
        href="/design-system"
        className="mt-10 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
      >
        View design system
      </Link>
    </main>
  );
}
