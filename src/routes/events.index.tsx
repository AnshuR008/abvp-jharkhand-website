import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader, CardsSkeleton, EmptyState } from "@/components/site/States";
import { EventCard } from "@/components/site/Cards";
import { Reveal } from "@/components/site/Reveal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listRows } from "@/lib/data";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events & Programmes — ABVP Jharkhand" },
      {
        name: "description",
        content:
          "Upcoming and past events, abhyas varg, samvad and sabha organised by ABVP Jharkhand.",
      },
      { property: "og:title", content: "Events — ABVP Jharkhand" },
      { property: "og:description", content: "Aane wale aur beete karyakram." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [tab, setTab] = useState("upcoming");
  const { data, isLoading } = useQuery({
    queryKey: ["events", "list"],
    queryFn: () => listRows("events", { order: { column: "start_date", ascending: false } }),
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    const now = Date.now();
    if (tab === "upcoming") return list.filter((e) => new Date(e.start_date).getTime() >= now);
    if (tab === "past") return list.filter((e) => new Date(e.start_date).getTime() < now);
    return list;
  }, [data, tab]);

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Karyakram"
        title="Events & Programmes"
        description="Abhyas varg, samvad, sabha aur prashikshan."
      />
      <div className="container-page py-10">
        <Tabs value={tab} onValueChange={setTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <CardsSkeleton />
        ) : filtered.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => (
              <Reveal key={item.id} delay={Math.min(i, 6) * 0.04}>
                <EventCard item={item} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState title="No events here" description="Check the other tabs for more programmes." />
        )}
      </div>
    </PublicLayout>
  );
}
