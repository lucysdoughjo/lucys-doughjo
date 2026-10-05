export const primaryNavLeft = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Our Story" },
  { href: "/find-us", label: "Find Us" },
] as const;

export const primaryNavRight = [
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
] as const;

export const mobileNav = [
  ...primaryNavLeft,
  ...primaryNavRight,
  { href: "/cart", label: "Cart" },
] as const;

export const footerNav = mobileNav;
