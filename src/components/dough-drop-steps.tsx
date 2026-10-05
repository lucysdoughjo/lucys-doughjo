const steps = [
  {
    title: "Order",
    body: "Monday – Wednesday. Orders close Wednesday at 8 PM.",
    icon: (
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z M3 6h18 M16 10a4 4 0 0 1-8 0" />
    ),
  },
  {
    title: "We bake",
    body: "Saturday. Made fresh in small batches.",
    icon: (
      <>
        <path d="M12 2v4" />
        <path d="M8 6h8" />
        <path d="M7 10c0 4 2 8 5 10 3-2 5-6 5-10" />
      </>
    ),
  },
  {
    title: "Pickup or delivery",
    body: "Sunday. Choose local pickup or delivery in Chino and nearby areas.",
    icon: (
      <>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11" />
        <path d="M15 18H2" />
        <path d="M16 8h4l3 3v5h-7V8Z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    ),
  },
  {
    title: "Enjoy",
    body: "Made to share — or keep all to yourself.",
    icon: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  },
] as const;

export function DoughDropSteps() {
  return (
    <section className="border-y border-espresso/10 bg-cream py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          The Sunday Dough Drop
        </p>
        <p className="mt-2 text-center font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Freshly baked in small batches. Worth the wait.
        </p>
        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {step.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.15em]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                {step.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
