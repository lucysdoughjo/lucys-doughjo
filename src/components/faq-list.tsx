import type { FaqItem } from "@/sanity/fetch";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <ul className="divide-y divide-espresso/10 rounded-sm border border-espresso/10">
      {items.map((item) => (
        <li key={item.id}>
          <details className="group px-4 py-4 sm:px-6">
            <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                {item.question}
                <span
                  className="mt-0.5 shrink-0 text-primary transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/75">
              {item.answer}
            </p>
          </details>
        </li>
      ))}
    </ul>
  );
}
