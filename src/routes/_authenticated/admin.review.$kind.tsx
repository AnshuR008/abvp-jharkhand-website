import { createFileRoute, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase as typedSupabase } from "@/integrations/supabase/client";

// Generic admin CRUD works across many tables, so use an untyped client here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = typedSupabase as any;
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/review/$kind")({
  component: ReviewPage,
});

type Row = Record<string, unknown>;

const CONFIG: Record<
  string,
  { table: string; label: string; title: string; sub: string[]; statuses: string[]; noteField?: string }
> = {
  volunteers: {
    table: "volunteer_applications",
    label: "Volunteer Applications",
    title: "full_name",
    sub: ["mobile", "email", "district", "college", "course", "academic_year", "interests"],
    statuses: ["pending", "under_review", "approved", "rejected"],
    noteField: "admin_notes",
  },
  messages: {
    table: "contact_messages",
    label: "Contact Messages",
    title: "name",
    sub: ["email", "mobile", "category", "subject", "message"],
    statuses: ["new", "read", "replied", "archived"],
    noteField: "internal_notes",
  },
};

function ReviewPage() {
  const { kind } = useParams({ from: "/_authenticated/admin/review/$kind" });
  const config = CONFIG[kind];
  const queryClient = useQueryClient();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-review", kind],
    enabled: Boolean(config),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(config!.table)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Row }) => {
      const { error } = await supabase.from(config!.table).update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated");
      queryClient.invalidateQueries({ queryKey: ["admin-review", kind] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!config) return <p className="text-muted-foreground">Unknown section.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">{config.label}</h1>
        <p className="text-sm text-muted-foreground">{rows?.length ?? 0} submissions</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !rows?.length ? (
        <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">Abhi koi submission nahi.</div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={String(row["id"])} className="rounded-lg border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">{String(row[config.title] ?? "—")}</h2>
                  <p className="text-xs text-muted-foreground">
                    Received {formatDate(row["created_at"] as string)}
                  </p>
                </div>
                <select
                  aria-label="Status"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={String(row["status"] ?? config.statuses[0])}
                  onChange={(e) => update.mutate({ id: String(row["id"]), patch: { status: e.target.value } })}
                >
                  {config.statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                {config.sub.map((key) =>
                  row[key] ? (
                    <div key={key}>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{key.replace(/_/g, " ")}</dt>
                      <dd>{Array.isArray(row[key]) ? (row[key] as string[]).join(", ") : String(row[key])}</dd>
                    </div>
                  ) : null,
                )}
              </dl>

              {config.noteField ? (
                <form
                  className="mt-4 flex flex-wrap gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const value = new FormData(e.currentTarget).get("note");
                    update.mutate({ id: String(row["id"]), patch: { [config.noteField!]: value } });
                  }}
                >
                  <input
                    name="note"
                    defaultValue={String(row[config.noteField] ?? "")}
                    placeholder="Admin notes"
                    maxLength={500}
                    className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    Save note
                  </Button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
