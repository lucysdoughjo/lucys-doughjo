import { AboutStory } from "@/components/about-story";
import { SectionHeading } from "@/components/section-heading";
import { getAboutPageContent } from "@/sanity/fetch";

export const metadata = {
  title: "Our Story",
};

export default async function AboutPage() {
  const content = await getAboutPageContent();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Our story"
        title={content.title}
        description="Small batches, slow fermentation, and bread meant to be shared around your table."
      />
      <AboutStory content={content} />
    </div>
  );
}
