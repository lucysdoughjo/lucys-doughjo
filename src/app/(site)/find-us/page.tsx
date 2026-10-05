import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";
import { getAllUpcomingEvents, getHomePageContent } from "@/sanity/fetch";

export const metadata = {
  title: "Find Us",
};

export default async function FindUsPage() {
  const [events, home] = await Promise.all([
    getAllUpcomingEvents(),
    getHomePageContent(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,320px)] lg:items-start">
        <div>
          <SectionHeading
            eyebrow="Find us"
            title="Markets & pop-ups"
            description={home.findUsIntro}
          />
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/75">
            Sunday Dough Drop pickup and local delivery are separate from market
            dates — preorder through the shop when the weekly window is open.
          </p>

          {events.length === 0 ? (
            <p className="mt-10 text-sm text-foreground/70">
              No upcoming markets or pop-ups are listed yet. Check back soon or
              follow us on social for day-of updates.
            </p>
          ) : (
            <ul className="mt-10 divide-y divide-espresso/10 rounded-sm border border-espresso/10">
              {events.map((event) => (
                <li key={event.id} className="px-4 py-5 sm:px-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    {event.dateLabel}
                  </p>
                  <p className="mt-1 font-serif text-xl text-foreground">
                    {event.name}
                  </p>
                  <dl className="mt-3 space-y-1 text-sm text-foreground/75">
                    {event.timeRange ? (
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-foreground/50">Time</dt>
                        <dd>{event.timeRange}</dd>
                      </div>
                    ) : null}
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-foreground/50">Where</dt>
                      <dd>{event.location}</dd>
                    </div>
                  </dl>
                  {event.note ? (
                    <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                      {event.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <figure className="relative aspect-[3/4] overflow-hidden rounded-sm bg-highlight/20 lg:sticky lg:top-28">
          <Image
            src="/assets/markets_popups/market-pop-up-current.jpg"
            alt="Lucy's Doughjo at a local market"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 320px"
            priority
          />
        </figure>
      </div>
    </div>
  );
}
