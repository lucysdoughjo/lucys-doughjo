export { metadata, viewport } from "next-sanity/studio";

import Studio from "./Studio";

export const dynamic = "force-dynamic";

export default function StudioPage() {
  return <Studio />;
}
