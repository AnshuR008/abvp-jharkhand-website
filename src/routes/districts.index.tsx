import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader, CardsSkeleton, EmptyState } from "@/components/site/States";
import { DistrictCard } from "@/components/site/Cards";
import { Reveal } from "@/components/site/Reveal";
import { listRows } from "@/lib/data";

export const Route = createFileRoute("/districts/")({
  head: () => ({
    meta: [
      { title: "Districts — ABVP Jharkhand Zila Units" },
      {
        name: "description",
        content:
          "Explore ABVP Jharkhand district units: district presidents, contacts, campus units, local news and events.",
      },
      { property: "og:title", content: "Districts — ABVP Jharkhand" },
      { property: "og:description", content: "Jharkhand ke 25 zilon ki ABVP ikaiyan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DistrictsPage,
});

function DistrictsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["districts", "all"],
    queryFn: () => listRows("districts", { order: { column: "sort_order", ascending: true } }),
  });

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Zila Sangathan"
        title="Our Districts"
        description="Har zile mein sakriya ikai, netritva aur gatividhiyan."
      />
      <div className="container-page py-10">
        {isLoading ? (
          <CardsSkeleton count={8} />
        ) : data?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((item, i) => (
              <Reveal key={item.id} delay={Math.min(i, 8) * 0.03}>
                <DistrictCard item={item} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState title="No districts published yet" />
        )}
      </div>
    </PublicLayout>
  );
}
