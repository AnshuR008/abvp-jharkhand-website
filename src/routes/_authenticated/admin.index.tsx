import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { supabase as typedSupabase } from "@/integrations/supabase/client";

// Generic admin CRUD works across many tables, so use an untyped client here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = typedSupabase as any;
import { RESOURCE_LIST } from "@/lib/admin-resources";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

const COUNTERS = [
  { table: "news", label: "News" },
  { table: "events", label: "Events" },
  { table: "leaders", label: "Leaders" },
  { table: "districts", label: "Districts" },
  { table: "units", label: "Units" },
  { table: "gallery_albums", label: "Albums" },
  { table: "videos", label: "Videos" },
  {
    table: "volunteer_applications",
    label: "Volunteers (pending)",
    filter: { column: "status", value: "pending" },
  },
  {
    table: "contact_messages",
    label: "Messages (new)",
    filter: { column: "status", value: "new" },
  },
] as const;

function Dashboard() {
  const { data: role } = useQuery({
    queryKey: ["admin-role"],
    queryFn: async () => {
      const { data: userData } = await typedSupabase.auth.getUser();
      if (!userData.user) return null;
      const { data } = await typedSupabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id);
      return (data ?? []).some(({ role }) => role === "admin" || role === "super_admin")
        ? "admin"
        : (data ?? []).some(({ role }) => role === "media_admin")
          ? "media_admin"
          : null;
    },
  });
  const isMainAdmin = role === "admin" || role === "super_admin";
  const visibleCounters = isMainAdmin
    ? COUNTERS
    : COUNTERS.filter((counter) => ["news", "events", "gallery_albums", "videos"].includes(counter.table));
  const visibleResources = isMainAdmin
    ? RESOURCE_LIST
    : RESOURCE_LIST.filter((resource) => ["news", "events", "gallery", "videos"].includes(resource.key));
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const entries = await Promise.all(
        visibleCounters.map(async (c) => {
          let query = supabase.from(c.table).select("id", { count: "exact", head: true });
          if ("filter" in c && c.filter) query = query.eq(c.filter.column, c.filter.value);
          const { count } = await query;
          return [c.label, count ?? 0] as const;
        }),
      );
      return Object.fromEntries(entries) as Record<string, number>;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">ABVP Jharkhand content overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleCounters.map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-1 font-display text-3xl font-bold text-primary">
                {data?.[c.label] ?? 0}
              </p>
            )}
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-semibold">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          {visibleResources.map((r) => (
            <Link
              key={r.key}
              to="/admin/c/$resource"
              params={{ resource: r.key }}
              className="rounded-md border bg-card px-3 py-2 text-sm shadow-card hover:border-primary hover:text-primary"
            >
              Manage {r.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
