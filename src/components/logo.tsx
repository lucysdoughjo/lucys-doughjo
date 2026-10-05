import Image from "next/image";

export type LogoVariant = "seal" | "horizontal" | "wordmark" | "wheat";

const logos = {
  seal: {
    src: "/assets/icons/submark.png",
    width: 1254,
    height: 1254,
    alt: "Lucy's Doughjo microbakery seal logo",
  },
  horizontal: {
    src: "/assets/icons/horizontal_logo.png",
    width: 2107,
    height: 746,
    alt: "Lucy's Doughjo horizontal logo",
  },
  wordmark: {
    src: "/assets/icons/workmark.png",
    width: 2106,
    height: 747,
    alt: "Lucy's Doughjo wordmark",
  },
  wheat: {
    src: "/assets/icons/wheat-icon.png",
    width: 1271,
    height: 1238,
    alt: "Lucy's Doughjo wheat icon",
  },
} as const satisfies Record<
  LogoVariant,
  { src: string; width: number; height: number; alt: string }
>;

type LogoProps = {
  variant: LogoVariant;
  className?: string;
  priority?: boolean;
};

export function Logo({ variant, className, priority }: LogoProps) {
  const logo = logos[variant];

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      priority={priority}
      className={className}
    />
  );
}
