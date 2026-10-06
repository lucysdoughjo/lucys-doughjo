"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { useCart } from "@/components/cart-provider";
import {
  mobileNav,
  primaryNavLeft,
  primaryNavRight,
} from "@/lib/navigation";

function CartLink({ count = 0 }: { count?: number }) {
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center p-2 text-foreground transition-opacity hover:opacity-70"
      aria-label={`Cart, ${count} items`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-cream">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground transition-opacity hover:opacity-70"
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const { totalPacks } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative border-b border-espresso/10 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 md:min-h-[88px]">
        <nav
          className="hidden flex-1 items-center gap-6 md:flex"
          aria-label="Primary left"
        >
          {primaryNavLeft.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <Link
          href="/"
          className="flex shrink-0 justify-center md:absolute md:left-1/2 md:-translate-x-1/2"
        >
          <Logo variant="seal" className="h-16 w-16 sm:h-20 sm:w-20" priority />
        </Link>

        <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Primary right"
          >
            {primaryNavRight.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
          <CartLink count={totalPacks} />
          <button
            type="button"
            className="inline-flex p-2 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              {menuOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M4 5h16" />
                  <path d="M4 12h16" />
                  <path d="M4 19h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-espresso/10 px-4 py-4 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-4">
            {mobileNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block text-sm font-semibold uppercase tracking-[0.12em]"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
