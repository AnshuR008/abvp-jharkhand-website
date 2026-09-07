import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader, CardsSkeleton, EmptyState } from "@/components/site/States";
import { LeaderCard } from "@/components/site/Cards";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listRows } from "@/lib/data";
import { LEADER_CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/leadership")({
  head: () => ({
    meta: [
      { title: "Leadership Directory — ABVP Jharkhand" },
      {
        name: "description",
        content:
          "State leadership, office bearers, wings and district leadership of ABVP Jharkhand with designations and profiles.",
      },
      { property: "og:title", content: "Leadership — ABVP Jharkhand" },
      { property: "og:description", content: "Prant, zila aur ikai star ke padadhikari." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeadershipPage,
});

function LeadershipPage() {
  const [category, setCategory] = useState("All");
  const [district, setDistrict] = useState("all");

  const leaders = useQuery({
    queryKey: ["leaders", "list"],
    queryFn: () => listRows("leaders", { order: { column: "sort_order", ascending: true } }),
  });
  const districts = useQuery({
    queryKey: ["districts", "list"],
    queryFn: () => listRows("districts", { order: { column: "sort_order", ascending: true } }),
  });

  const filtered = useMemo(() => {
    return (leaders.data ?? []).filter((l) => {
      const catOk = category === "All" || l.category === category;
      const distOk = district === "all" || l.district_id === district;
      return catOk && distOk;
    });
  }, [leaders.data, category, district]);

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Netritva"
        title="Leadership Directory"
        description="Prant se lekar ikai star tak ka sangathanatmak netritva."
      />
      <div className="container-page py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["All", ...LEADER_CATEGORIES].map((cat) => (
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
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="lg:w-56">
              <SelectValue placeholder="All districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All districts</SelectItem>
              {(districts.data ?? []).map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {leaders.isLoading ? (
          <CardsSkeleton count={8} />
        ) : filtered.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((item, i) => (
              <Reveal key={item.id} delay={Math.min(i, 8) * 0.03}>
                <LeaderCard item={item} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState title="No leaders found" description="Try a different category or district." />
        )}
      </div>
    </PublicLayout>
  );
}
