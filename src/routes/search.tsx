import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader, EmptyState } from "@/components/site/States";
import { Skeleton } from "@/components/ui/skeleton";
import { searchAll } from "@/lib/data";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().catch("") }),
  head: () => ({
    meta: [
      { title: "Search — ABVP Jharkhand" },
      { name: "description", content: "Search news, events, leaders and districts across ABVP Jharkhand." },
      { property: "og:title", content: "Search — ABVP Jharkhand" },
      { property: "og:description", content: "Samachar, karyakram, netritva aur zilon mein khojiye." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    enabled: q.length > 1,
    queryFn: () => searchAll(q),
  });

  const total =
    (data?.news.length ?? 0) + (data?.events.length ?? 0) + (data?.leaders.length ?? 0) + (data?.districts.length ?? 0);

  return (
    <PublicLayout>
      <PageHeader eyebrow="Khoj" title={q ? `Results for “${q}”` : "Search"} />
      <div className="container-page space-y-10 py-10">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : !q ? (
          <EmptyState title="Type something to search" description="Use the search box in the header." />
        ) : total === 0 ? (
          <EmptyState title="No results found" description="Try a different keyword." />
        ) : (
          <>
            {data!.news.length ? (
              <section>
                <h2 className="mb-3 font-display text-xl font-semibold">News</h2>
                <ul className="space-y-2">
                  {data!.news.map((n) => (
                    <li key={n.id}>
                      <Link to="/news/$slug" params={{ slug: n.slug }} className="text-primary hover:underline">
                        {n.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {data!.events.length ? (
              <section>
                <h2 className="mb-3 font-display text-xl font-semibold">Events</h2>
                <ul className="space-y-2">
                  {data!.events.map((e) => (
                    <li key={e.id}>
                      <Link to="/events/$slug" params={{ slug: e.slug }} className="text-primary hover:underline">
                        {e.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {data!.leaders.length ? (
              <section>
                <h2 className="mb-3 font-display text-xl font-semibold">Leaders</h2>
                <ul className="space-y-2 text-sm">
                  {data!.leaders.map((l) => (
                    <li key={l.id}>
                      <Link to="/leadership" className="text-primary hover:underline">
                        {l.name}
                      </Link>{" "}
                      <span className="text-muted-foreground">— {l.designation}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {data!.districts.length ? (
              <section>
                <h2 className="mb-3 font-display text-xl font-semibold">Districts</h2>
                <ul className="space-y-2">
                  {data!.districts.map((d) => (
                    <li key={d.id}>
                      <Link to="/districts/$slug" params={{ slug: d.slug }} className="text-primary hover:underline">
                        {d.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
