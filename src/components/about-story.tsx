import type { AboutPageContent } from "@/sanity/fetch";
import { AboutStoryCarousel } from "@/components/about-story-carousel";
import { StoryPortableText } from "@/components/portable-text";

export function AboutStory({ content }: { content: AboutPageContent }) {
  return (
    <section className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
      <div className="min-w-0">
        <StoryPortableText value={content.body} />
      </div>
      <div className="min-w-0 lg:sticky lg:top-28">
        <AboutStoryCarousel images={content.images} />
      </div>
    </section>
  );
}
