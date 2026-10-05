import { DoughDropStatusBanner } from "@/components/dough-drop-status-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SanityStatusBanner } from "@/components/sanity-status-banner";
import { getOrderWindowForSite } from "@/sanity/fetch";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orderWindow = await getOrderWindowForSite();

  return (
    <>
      <SiteHeader cartCount={0} />
      <SanityStatusBanner />
      <DoughDropStatusBanner state={orderWindow} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
