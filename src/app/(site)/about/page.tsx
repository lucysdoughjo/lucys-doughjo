import { AboutStory } from "@/components/about-story";
import { SectionHeading } from "@/components/section-heading";
import { pageMetadata } from "@/lib/seo";
import { getAboutPageContent } from "@/sanity/fetch";

export const metadata = pageMetadata({
  title: "Our Story",
  description:
    "Meet Lucy's Doughjo — a Chino microbakery built on simple ingredients, slow fermentation, and the weekly Sunday Dough Drop.",
  keywords: [
    "Lucy's Doughjo story",
    "Chino microbakery",
    "artisan sourdough",
    "small batch bakery",
  ],
  path: "/about",
  ogImage: "/assets/about/mixing-dough-by-hand.jpg",
});

export default async function AboutPage() {
  const content = await getAboutPageContent();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-4 md:gap-6 lg:flex-row items-center lg:justify-between">
      <SectionHeading
        eyebrow="Our story"
        title={content.title}
        description="Small batches, slow fermentation, and bread meant to be shared around your table."
      />
      <p className="font-script text-3xl text-primary sm:text-4xl lg:max-w-sm lg:text-right">
        Baked with love.
      </p>
      </div>  
      <AboutStory content={content} />
    </div>
  );
}
