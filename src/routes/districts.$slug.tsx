import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, MapPin, Users } from "lucide-react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { SmartImage } from "@/components/site/SmartImage";
import { EmptyState, SectionHeading } from "@/components/site/States";
import { NewsCard, EventCard, LeaderCard } from "@/components/site/Cards";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getRowBy, listRows } from "@/lib/data";

export const Route = createFileRoute("/districts/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} District — ABVP Jharkhand` },
      { name: "description", content: "District unit of ABVP Jharkhand: leadership, units, news and events." },
      { property: "og:title", content: "ABVP Jharkhand District Unit" },
      { property: "og:description", content: "Zila ikai ka netritva, gatividhiyan aur sampark." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DistrictDetailPage,
});

function DistrictDetailPage() {
  const { slug } = Route.useParams();
  const district = useQuery({
    queryKey: ["district", slug],
    queryFn: () => getRowBy("districts", "slug", slug),
  });
  const districtId = district.data?.id as string | undefined;

  const units = useQuery({
    queryKey: ["district", slug, "units"],
    enabled: Boolean(districtId),
    queryFn: () =>
      listRows("units", { filters: [["district_id", districtId!], ["active", true]] }),
  });
  const news = useQuery({
    queryKey: ["district", slug, "news"],
    enabled: Boolean(districtId),
    queryFn: () =>
      listRows("news", { filters: [["district_id", districtId!]], order: { column: "published_at" }, limit: 3 }),
  });
  const events = useQuery({
    queryKey: ["district", slug, "events"],
    enabled: Boolean(districtId),
    queryFn: () =>
      listRows("events", {
        filters: [["district_id", districtId!]],
        order: { column: "start_date", ascending: false },
        limit: 3,
      }),
  });
  const leaders = useQuery({
    queryKey: ["district", slug, "leaders"],
    enabled: Boolean(districtId),
    queryFn: () =>
      listRows("leaders", { filters: [["district_id", districtId!]], order: { column: "sort_order", ascending: true } }),
  });

  if (district.isLoading) {
    return (
      <PublicLayout>
        <div className="container-page space-y-4 py-16">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-8 w-1/3" />
        </div>
      </PublicLayout>
    );
  }

  if (!district.data) {
    return (
      <PublicLayout>
        <div className="container-page py-20">
          <EmptyState title="District not found" />
        </div>
      </PublicLayout>
    );
  }

  const d = district.data;

  return (
    <PublicLayout>
      <section className="relative isolate">
        <SmartImage
          src={d.cover_image}
          alt={`${d.name} district`}
          className="h-64 w-full object-cover md:h-80"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/20" />
        <div className="container-page absolute inset-x-0 bottom-0 pb-8 text-navy-foreground">
          <Button asChild variant="ghost" size="sm" className="mb-3 -ml-3 text-navy-foreground hover:bg-navy-foreground/10">
            <Link to="/districts">
              <ArrowLeft className="mr-1 h-4 w-4" /> All districts
            </Link>
          </Button>
          <h1 className="text-4xl font-bold md:text-5xl">{d.name}</h1>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <p className="text-lg text-muted-foreground">{d.description}</p>
          </div>
          <aside className="rounded-lg border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold">District Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {d.president_name ? (
                <li className="flex gap-2">
                  <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>
                    Zila Adhyaksh: <strong className="text-foreground">{d.president_name}</strong>
                  </span>
                </li>
              ) : null}
              {d.contact_phone ? (
                <li className="flex gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <a href={`tel:${d.contact_phone}`}>{d.contact_phone}</a>
                </li>
              ) : null}
              {d.contact_email ? (
                <li className="flex gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <a href={`mailto:${d.contact_email}`}>{d.contact_email}</a>
                </li>
              ) : null}
              {d.address ? (
                <li className="flex gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{d.address}</span>
                </li>
              ) : null}
            </ul>
          </aside>
        </div>

        {(leaders.data ?? []).length ? (
          <section className="mt-14">
            <SectionHeading eyebrow="Netritva" title="District Leadership" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {leaders.data!.map((item) => (
                <LeaderCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        {(units.data ?? []).length ? (
          <section className="mt-14">
            <SectionHeading eyebrow="Ikai" title="Campus Units" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {units.data!.map((u) => (
                <div key={u.id} className="rounded-lg border bg-[#FFF4E8] p-5 shadow-card">
                  <h3 className="font-display text-base font-semibold">{u.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{u.college_name}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Incharge: {u.incharge_name ?? "—"} • {u.member_count} members
                  </p>
                  {u.contact_phone ? (
                    <a
                      className="mt-1 block text-xs text-black hover:underline"
                      href={`tel:${u.contact_phone}`}
                    >
                      Contact: {u.contact_phone}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {(news.data ?? []).length ? (
          <section className="mt-14">
            <SectionHeading eyebrow="Samachar" title="District News" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.data!.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        {(events.data ?? []).length ? (
          <section className="mt-14">
            <SectionHeading eyebrow="Karyakram" title="District Events" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.data!.map((item) => (
                <EventCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PublicLayout>
  );
}
