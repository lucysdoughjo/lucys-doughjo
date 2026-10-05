import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-espresso text-cream hover:bg-espresso/90 disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "border border-espresso/20 bg-cream text-foreground hover:bg-highlight/30 disabled:opacity-50 disabled:pointer-events-none",
  ghost:
    "text-foreground underline-offset-4 hover:underline disabled:opacity-50 disabled:pointer-events-none",
};

type SharedProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = SharedProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };

type ButtonAsLink = SharedProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function cn(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    className,
    children,
    ...rest
  } = props;

  const base =
    "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors";

  const classes = cn(base, variantClasses[variant], className);

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as ComponentPropsWithoutRef<typeof Link>;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as ComponentPropsWithoutRef<"button">;
  const type = buttonRest.type ?? "button";

  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
