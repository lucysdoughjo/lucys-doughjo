import type { StructureResolver } from "sanity/structure";

const singleton = (S: Parameters<StructureResolver>[0], typeName: string, title: string) =>
  S.listItem()
    .title(title)
    .id(typeName)
    .child(S.document().schemaType(typeName).documentId(typeName));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Lucy's Doughjo")
    .items([
      singleton(S, "siteSettings", "Site settings"),
      singleton(S, "homePage", "Homepage"),
      singleton(S, "aboutPage", "About page"),
      S.divider(),
      S.documentTypeListItem("weeklyDrop").title("Weekly drops"),
      S.documentTypeListItem("product").title("Products"),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("event").title("Markets & pop-ups"),
      S.documentTypeListItem("faqItem").title("FAQ"),
    ]);
