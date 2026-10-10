import GalleryClient from "@/components/GalleryClient";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { getGallery } from "@/lib/content";
export const metadata = { title: "Gallery" };
export const dynamic = "force-dynamic";
export default async function Gallery() {
  const items = await getGallery();
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Reveal><SectionHeading kicker="Gallery" title="Moments from the field" lede="Photographs from our work in the community, published with consent. Select any photo to view it full-screen." /></Reveal>
      <GalleryClient items={items} />
      <p className="mt-6 text-sm text-forest-muted">Videos: thumbnails only — full players load on click. No videos published yet.</p>
    </div>
  );
}
