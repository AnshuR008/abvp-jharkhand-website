import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader, CardsSkeleton, EmptyState } from "@/components/site/States";
import { SmartImage } from "@/components/site/SmartImage";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { listRows } from "@/lib/data";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery — ABVP Jharkhand" },
      {
        name: "description",
        content: "Photo albums from ABVP Jharkhand campaigns, camps, meetings and campus programmes.",
      },
      { property: "og:title", content: "Gallery — ABVP Jharkhand" },
      { property: "og:description", content: "Karyakramon ki tasveerein aur albums." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

type Photo = { url: string; caption?: string };

function GalleryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["gallery_albums"],
    queryFn: () => listRows("gallery_albums", { order: { column: "album_date" } }),
  });

  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [index, setIndex] = useState(0);

  const current = photos?.[index];

  return (
    <PublicLayout>
      <PageHeader eyebrow="Chhavi" title="Photo Gallery" description="Gatividhiyon ki jhalkiyan." />
      <div className="container-page py-10">
        {isLoading ? (
          <CardsSkeleton />
        ) : data?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((album, i) => (
              <Reveal key={album.id} delay={Math.min(i, 6) * 0.04}>
                <button
                  type="button"
                  onClick={() => {
                    setPhotos((album.images ?? []) as Photo[]);
                    setIndex(0);
                  }}
                  className="group block w-full overflow-hidden rounded-lg border bg-card text-left shadow-card transition-shadow hover:shadow-lift"
                >
                  <div className="zoom-media aspect-[16/10]">
                    <SmartImage src={album.cover_image} alt={album.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-5">
                    <h2 className="font-display text-lg font-semibold">{album.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {(album.images ?? []).length} photos • {formatDate(album.album_date)}
                    </p>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState title="No albums yet" description="Albums added from the admin panel appear here." />
        )}
      </div>

      <Dialog open={Boolean(photos)} onOpenChange={(open) => !open && setPhotos(null)}>
        <DialogContent className="max-w-4xl border-0 bg-navy p-0 text-navy-foreground">
          <DialogTitle className="sr-only">Photo viewer</DialogTitle>
          {current ? (
            <div className="relative">
              <img src={current.url} alt={current.caption ?? "Gallery photo"} className="max-h-[75vh] w-full object-contain" />
              <div className="flex items-center justify-between gap-4 p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous photo"
                  onClick={() => setIndex((i) => (i - 1 + (photos?.length ?? 1)) % (photos?.length ?? 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <p className="flex-1 text-center text-sm text-navy-foreground/80">{current.caption}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next photo"
                  onClick={() => setIndex((i) => (i + 1) % (photos?.length ?? 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close viewer"
                className="absolute right-2 top-2"
                onClick={() => setPhotos(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
