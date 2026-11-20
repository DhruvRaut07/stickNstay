import { permanentRedirect } from "next/navigation";

/** The designs now live in the shop. Kept so old links and bookmarks still work. */
export default function DesignsPage() {
  permanentRedirect("/shop");
}
