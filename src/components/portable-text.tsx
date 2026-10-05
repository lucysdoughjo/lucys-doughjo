import type { ReactNode } from "react";
import { PortableText, type PortableTextBlock } from "next-sanity";

const components = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="mb-4 text-base leading-relaxed text-foreground/85 last:mb-0">
        {children}
      </p>
    ),
  },
};

type StoryPortableTextProps = {
  value: PortableTextBlock[];
};

export function StoryPortableText({ value }: StoryPortableTextProps) {
  if (!value?.length) {
    return null;
  }

  return (
    <div className="max-w-2xl">
      <PortableText value={value} components={components} />
    </div>
  );
}
