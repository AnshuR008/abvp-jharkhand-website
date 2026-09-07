import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PlayCircle } from "lucide-react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader, CardsSkeleton, EmptyState } from "@/components/site/States";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { listRows } from "@/lib/data";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Video Gallery — ABVP Jharkhand" },
      { name: "description", content: "Speeches, campaign films and event highlights from ABVP Jharkhand." },
      { property: "og:title", content: "Videos — ABVP Jharkhand" },
      { property: "og:description", content: "Bhashan, abhiyan aur karyakram ke videos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VideosPage,
});

function VideosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: () => listRows("videos", { order: { column: "published_on" } }),
  });
  const [active, setActive] = useState<string | null>(null);
  const youtubeId = (value: string) => {
    if (!value.startsWith("http")) return value;
    try {
      const url = new URL(value);
      return url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).pop() ?? value;
    } catch {
      return value;
    }
  };

  return (
    <PublicLayout>
      <PageHeader eyebrow="Video" title="Video Gallery" description="Karyakram aur abhiyan ke videos." />
      <div className="container-page py-10">
        {isLoading ? (
          <CardsSkeleton />
        ) : data?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((video, i) => (
              <Reveal key={video.id} delay={Math.min(i, 6) * 0.04}>
                <button
                  type="button"
                  onClick={() => setActive(video.youtube_id)}
                  className="group block w-full overflow-hidden rounded-lg border bg-card text-left shadow-card transition-shadow hover:shadow-lift"
                >
                  <div className="zoom-media relative aspect-video bg-muted">
                    {video.youtube_id.startsWith("http") ? (
                      <video
                        src={video.youtube_id}
                        preload="metadata"
                        playsInline
                        muted={false}
                        defaultMuted={false}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                        alt={video.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                    <PlayCircle className="absolute inset-0 m-auto h-14 w-14 text-primary-foreground drop-shadow" aria-hidden />
                  </div>
                  <div className="p-5">
                    <Badge variant="secondary">{video.category}</Badge>
                    <h2 className="mt-2 font-display text-lg font-semibold">{video.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDate(video.published_on)}</p>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState title="No videos yet" />
        )}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl p-0">
          <DialogTitle className="sr-only">Video player</DialogTitle>
          {active ? (
            <div className="aspect-video w-full">
              {active.startsWith("http") ? (
                <video
                  src={active}
                  controls
                  playsInline
                  muted={false}
                  defaultMuted={false}
                  onLoadedMetadata={(event) => {
                    event.currentTarget.muted = false;
                    event.currentTarget.volume = 1;
                  }}
                  className="h-full w-full rounded-lg"
                />
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId(active)}?autoplay=1`}
                  title="ABVP Jharkhand video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full rounded-lg"
                />
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
