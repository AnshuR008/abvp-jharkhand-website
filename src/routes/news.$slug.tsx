import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Share2, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { PublicLayout } from "@/components/site/PublicLayout";
import { SmartImage } from "@/components/site/SmartImage";
import { EmptyState } from "@/components/site/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getRowBy } from "@/lib/data";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/news/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — ABVP Jharkhand News` },
      { name: "description", content: "Read the full article from ABVP Jharkhand." },
      { property: "og:title", content: "ABVP Jharkhand News" },
      { property: "og:description", content: "Read the full article from ABVP Jharkhand." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  notFoundComponent: () => (
    <PublicLayout>
      <div className="container-page py-20">
        <EmptyState title="Article not found" description="This article may have been removed." />
      </div>
    </PublicLayout>
  ),
  component: NewsDetailPage,
});

function NewsDetailPage() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["news", slug],
    queryFn: async () => {
      const row = await getRowBy("news", "slug", slug);
      if (!row) throw notFound();
      return row;
    },
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container-page space-y-4 py-16">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !data) {
    return (
      <PublicLayout>
        <div className="container-page py-20">
          <EmptyState title="Article not found" description="This article may have been removed." />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="container-page max-w-3xl py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link to="/news">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to news
          </Link>
        </Button>

        <Badge variant="secondary">{data.category}</Badge>
        <h1 className="mt-3 text-3xl font-bold text-balance-title md:text-4xl">{data.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {formatDate(data.published_at)}
          {data.author ? ` • ${data.author}` : ""}
        </p>

        <div className="mt-6 overflow-hidden rounded-lg">
          <SmartImage
            src={data.featured_image}
            alt={data.title}
            className="aspect-[16/9] w-full object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>

        {data.excerpt ? (
          <p className="mt-8 border-l-4 border-l-primary pl-4 text-lg text-muted-foreground">
            {data.excerpt}
          </p>
        ) : null}

        <div className="mt-6 space-y-4 leading-relaxed text-foreground/90">
          {(data.content ?? "").split("\n").filter(Boolean).map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {(data.tags ?? []).length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {data.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-10 flex items-center gap-2 border-t pt-6">
          <span className="mr-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Share2 className="h-4 w-4" /> Share
          </span>
          <Button asChild variant="outline" size="icon" aria-label="Share on Facebook">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="icon" aria-label="Share on Twitter">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(data.title)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copy link">
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      </article>
    </PublicLayout>
  );
}
