import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader, CardsSkeleton, EmptyState } from "@/components/site/States";
import { NewsCard } from "@/components/site/Cards";
import { Reveal } from "@/components/site/Reveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listRows } from "@/lib/data";
import { NEWS_CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "News & Press Releases — ABVP Jharkhand" },
      {
        name: "description",
        content:
          "Latest news, press releases, organisation updates and district news from ABVP Jharkhand.",
      },
      { property: "og:title", content: "News — ABVP Jharkhand" },
      { property: "og:description", content: "Taza samachar, press vigyapti aur zila samachar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewsListPage,
});

function NewsListPage() {
  const [category, setCategory] = useState<string>("All");
  const [term, setTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["news", "list"],
    queryFn: () => listRows("news", { order: { column: "published_at" } }),
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    return list.filter((item) => {
      const catOk = category === "All" || item.category === category;
      const q = term.trim().toLowerCase();
      const searchOk =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.excerpt?.toLowerCase().includes(q) ||
        (item.tags ?? []).some((t: string) => t.toLowerCase().includes(q));
      return catOk && searchOk;
    });
  }, [data, category, term]);

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Samachar"
        title="News & Updates"
        description="Sangathan ki gatividhiyan, press vigyaptiyan aur zila samachar ek jagah."
      />

      <div className="container-page py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["All", ...NEWS_CATEGORIES].map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={category === cat ? "default" : "outline"}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="relative lg:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search news"
              aria-label="Search news"
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <CardsSkeleton />
        ) : filtered.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => (
              <Reveal key={item.id} delay={Math.min(i, 6) * 0.04}>
                <NewsCard item={item} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No articles found"
            description="Try a different category or search term."
          />
        )}
      </div>
    </PublicLayout>
  );
}
