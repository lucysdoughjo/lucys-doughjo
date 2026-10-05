import Link from "next/link";
import { Logo } from "@/components/logo";
import { footerNav } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-espresso/10 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs">
            <Logo variant="wordmark" className="h-auto w-full max-w-[200px]" />
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-foreground/70">
              Microbakery · Chino, CA
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-x-6 gap-y-2"
            aria-label="Footer"
          >
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <p className="font-script text-3xl text-primary sm:text-4xl lg:max-w-sm lg:text-right">
            Good bread brings people together.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-espresso/10 pt-6 text-xs text-foreground/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Lucy&apos;s Doughjo. All rights reserved.</p>
          <p>Cottage food operation · Made with simple ingredients in Chino, CA</p>
        </div>
      </div>
    </footer>
  );
}
