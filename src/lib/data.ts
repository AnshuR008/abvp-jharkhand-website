import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = any;

/** Generic list reader used by both public pages and the admin CMS. */
export async function listRows(
  table: string,
  opts: {
    order?: { column: string; ascending?: boolean };
    filters?: Array<[string, string | number | boolean | null]>;
    limit?: number;
    select?: string;
  } = {},
): Promise<Row[]> {
  let query = supabase.from(table as never).select(opts.select ?? "*");
  for (const [column, value] of opts.filters ?? []) {
    query = query.eq(column, value as never);
  }
  if (opts.order) {
    query = query.order(opts.order.column, { ascending: opts.order.ascending ?? false });
  }
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Row[];
}

export async function getRowBy(table: string, column: string, value: string): Promise<Row | null> {
  const { data, error } = await supabase
    .from(table as never)
    .select("*")
    .eq(column, value as never)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as Row | null;
}

export async function insertRow(table: string, values: Row) {
  const { data, error } = await supabase
    .from(table as never)
    .insert(values as never)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Row;
}

export async function updateRow(table: string, id: string, values: Row) {
  const { error } = await supabase
    .from(table as never)
    .update(values as never)
    .eq("id", id as never);
  if (error) throw error;
}

export async function deleteRow(table: string, id: string) {
  const { error } = await supabase
    .from(table as never)
    .delete()
    .eq("id", id as never);
  if (error) throw error;
}

export async function countRows(table: string, filters?: Array<[string, string | boolean]>) {
  let query = supabase.from(table as never).select("id", { count: "exact", head: true });
  for (const [column, value] of filters ?? []) query = query.eq(column, value as never);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function searchAll(term: string) {
  const like = `%${term}%`;
  const [news, events, leaders, districts] = await Promise.all([
    supabase.from("news").select("id,title,slug,excerpt,category").ilike("title", like).eq("published", true).limit(10),
    supabase.from("events").select("id,title,slug,description,venue").ilike("title", like).eq("published", true).limit(10),
    supabase.from("leaders").select("id,name,slug,designation,category").ilike("name", like).eq("published", true).limit(10),
    supabase.from("districts").select("id,name,slug,description").ilike("name", like).eq("active", true).limit(10),
  ]);
  return {
    news: news.data ?? [],
    events: events.data ?? [],
    leaders: leaders.data ?? [],
    districts: districts.data ?? [],
  };
}
