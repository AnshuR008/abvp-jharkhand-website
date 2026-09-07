import { createFileRoute, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import * as tus from "tus-js-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase as typedSupabase } from "@/integrations/supabase/client";

// Generic admin CRUD works across many tables, so use an untyped client here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = typedSupabase as any;
import { RESOURCES, type Field } from "@/lib/admin-resources";

export const Route = createFileRoute("/_authenticated/admin/c/$resource")({
  component: ResourcePage,
});

type Row = Record<string, unknown>;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

function uploadVideoResumable(file: File, path: string) {
  return new Promise<void>(async (resolve, reject) => {
    const { data, error } = await typedSupabase.auth.getSession();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

    if (error || !data.session || !supabaseUrl || !supabaseKey) {
      reject(error ?? new Error("Admin session is missing. Please sign in again."));
      return;
    }

    const url = new URL(supabaseUrl);
    url.hostname = url.hostname.replace(".supabase.co", ".storage.supabase.co");
    const upload = new tus.Upload(file, {
      endpoint: `${url.origin}/storage/v1/upload/resumable`,
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${data.session.access_token}`,
        apikey: supabaseKey,
        "x-upsert": "false",
      },
      metadata: {
        bucketName: "admin-assets",
        objectName: path,
        contentType: file.type || "video/mp4",
        cacheControl: "3600",
      },
      onError: reject,
      onSuccess: () => resolve(),
    });

    const previousUploads = await upload.findPreviousUploads();
    if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0]);
    upload.start();
  });
}

function emptyForm(fields: Field[]): Row {
  const out: Row = {};
  for (const f of fields)
    out[f.name] = f.type === "boolean" ? false : f.type === "media-list" ? "[]" : "";
  return out;
}

function ResourcePage() {
  const { resource } = useParams({ from: "/_authenticated/admin/c/$resource" });
  const config = RESOURCES[resource];
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
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
        ? "super_admin"
        : (data ?? []).some(({ role }) => role === "media_admin")
          ? "media_admin"
          : null;
    },
  });
  const isAllowed =
    role === "admin" ||
    role === "super_admin" ||
    (role === "media_admin" && ["gallery", "videos", "events", "news"].includes(resource));

  const {
    data: rows,
    isLoading,
    error: rowsError,
  } = useQuery({
    queryKey: ["admin", resource],
    enabled: isAllowed,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(config!.table)
        .select("*")
        .order(config!.orderBy.column, { ascending: config!.orderBy.ascending ?? false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const { data: districts } = useQuery({
    queryKey: ["admin", "district-options"],
    queryFn: async () => {
      const { data } = await supabase.from("districts").select("id,name").order("name");
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  const save = useMutation({
    mutationFn: async (values: Row) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expire ho gaya hai. Logout karke dobara login kijiye.");

      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (roleError) throw roleError;
      if (!roles?.some((role: { role: string }) =>
        role.role === "admin" ||
        role.role === "super_admin" ||
        (role.role === "media_admin" && ["gallery", "videos", "events", "news"].includes(resource)))) {
        throw new Error("Is login user ko admin role nahi mila hai.");
      }

      const payload: Row = {};
      for (const f of config!.fields) {
        const raw = values[f.name];
        if (f.required && (raw === "" || raw === undefined || raw === null)) {
          throw new Error(`${f.label} is required`);
        }
        if (f.type === "boolean") payload[f.name] = Boolean(raw);
        else if (resource === "videos" && f.name === "category" && !raw)
          payload[f.name] = "General";
        else if (raw === "" || raw === undefined || raw === null) payload[f.name] = null;
        else if (f.type === "number") payload[f.name] = Number(raw);
        else if (f.type === "tags")
          payload[f.name] = String(raw)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        else if (f.type === "json" || f.type === "media-list")
          payload[f.name] = JSON.parse(String(raw));
        else payload[f.name] = raw;
      }
      if (editing) {
        const { error } = await supabase
          .from(config!.table)
          .update(payload)
          .eq("id", editing["id"] as string)
          .select("id")
          .single();
        if (error) throw error;
      } else {
        const { error } = await supabase.from(config!.table).insert(payload).select("id").single();
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Updated" : "Created");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", resource] });
    },
    onError: (e: Error & { code?: string; details?: string; hint?: string }) => {
      const isPermissionError =
        e.code === "42501" || e.message.toLowerCase().includes("row-level security");
      toast.error(
        isPermissionError
          ? "Save failed: is login user ke paas admin permission nahi hai. Supabase user_roles mein admin role assign kijiye."
          : `Save failed: ${e.message}`,
      );
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(config!.table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", resource] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!config) return <p className="text-muted-foreground">Unknown resource.</p>;
  if (!isAllowed) return <p className="text-muted-foreground">Is resource ke liye aapke paas permission nahi hai.</p>;

  const statusField = rows?.some((row) => "published" in row)
    ? "published"
    : rows?.some((row) => "active" in row)
      ? "active"
      : rows?.some((row) => "status" in row)
        ? "status"
        : null;
  const statusOptions = statusField
    ? statusField === "published"
      ? ["all", "true", "false"]
      : statusField === "active"
        ? ["all", "true", "false"]
        : [
            "all",
            ...Array.from(
              new Set((rows ?? []).map((row) => String(row.status ?? ""))).filter(Boolean),
            ),
          ]
    : [];
  const filteredRows = (rows ?? []).filter((row) => {
    const matchesTerm = Object.values(row).some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(term.toLowerCase()),
    );
    const matchesFilter =
      filter === "all" || (statusField ? String(row[statusField]) === filter : true);
    return matchesTerm && matchesFilter;
  });
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const activePage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((activePage - 1) * pageSize, activePage * pageSize);

  const uploadFile = async (field: Field, file?: File) => {
    if (!file) return;
    if (field.accept?.includes("video") && file.size > MAX_VIDEO_SIZE) {
      toast.error("Video size 200 MB se zyada nahi ho sakta.");
      return;
    }
    if (field.accept?.includes("video") && !file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }
    setUploadingField(field.name);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${resource}/${Date.now()}-${safeName}`;
      if (field.accept?.includes("video")) {
        await uploadVideoResumable(file, path);
      } else {
        const { error } = await supabase.storage
          .from("admin-assets")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (error) throw error;
      }
      const { data } = supabase.storage.from("admin-assets").getPublicUrl(path);
      setForm((current) => ({ ...current, [field.name]: data.publicUrl }));
      toast.success("File uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  const uploadGalleryFiles = async (field: Field, files: FileList | null) => {
    if (!files?.length) return;
    setUploadingField(field.name);
    try {
      const current = JSON.parse(String(form[field.name] || "[]")) as {
        url: string;
        caption: string;
      }[];
      const uploaded = [] as { url: string; caption: string }[];
      for (const file of Array.from(files)) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${resource}/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from("admin-assets").upload(path, file, {
          upsert: false,
          contentType: file.type,
        });
        if (error) throw error;
        const { data } = supabase.storage.from("admin-assets").getPublicUrl(path);
        uploaded.push({ url: data.publicUrl, caption: "" });
      }
      setForm((value) => ({
        ...value,
        [field.name]: JSON.stringify([...current, ...uploaded], null, 2),
      }));
      toast.success(`${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(config.fields));
    setOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    const next: Row = {};
    for (const f of config.fields) {
      const v = row[f.name];
      next[f.name] =
        f.type === "boolean"
          ? Boolean(v)
          : f.type === "tags"
            ? Array.isArray(v)
              ? v.join(", ")
              : ""
            : f.type === "json" || f.type === "media-list"
              ? v
                ? JSON.stringify(v, null, 2)
                : ""
              : f.type === "datetime" && typeof v === "string"
                ? v.slice(0, 16)
                : (v ?? "");
    }
    setForm(next);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{config.label}</h1>
          <p className="text-sm text-muted-foreground">{rows?.length ?? 0} records</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New {config.label.replace(/s$/, "")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-3 shadow-card">
        <Input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setPage(1);
          }}
          placeholder={`Search ${config.label.toLowerCase()}...`}
          className="min-w-52 flex-1"
          aria-label={`Search ${config.label}`}
        />
        {statusField ? (
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Filter by status"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all"
                  ? "All statuses"
                  : statusField === "published"
                    ? option === "true"
                      ? "Published"
                      : "Draft"
                    : statusField === "active"
                      ? option === "true"
                        ? "Active"
                        : "Inactive"
                      : option.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : rowsError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-10 text-center text-destructive">
          Unable to load {config.label.toLowerCase()}: {rowsError.message}
        </div>
      ) : !filteredRows.length ? (
        <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">
          {rows?.length
            ? "Is search/filter ke liye koi record nahi mila."
            : "Abhi koi record nahi hai. Pehla record banaiye."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{config.titleField}</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={String(row["id"])} className="border-t">
                  <td className="max-w-md truncate px-4 py-3">
                    {String(row[config.titleField] ?? "—")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {"published" in row
                      ? row["published"]
                        ? "Published"
                        : "Draft"
                      : "active" in row
                        ? row["active"]
                          ? "Active"
                          : "Inactive"
                        : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this record?")) remove.mutate(String(row["id"]));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredRows.length > pageSize ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            Page {activePage} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={activePage === 1}
              onClick={() => setPage(activePage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={activePage === pageCount}
              onClick={() => setPage(activePage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit" : "New"} {config.label.replace(/s$/, "")}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(form);
            }}
          >
            {config.fields.map((f) => (
              <div key={f.name}>
                <Label htmlFor={f.name}>{f.label}</Label>
                {f.type === "boolean" ? (
                  <div className="mt-2 flex items-center gap-3">
                    <Switch
                      id={f.name}
                      checked={Boolean(form[f.name])}
                      onCheckedChange={(v) => setForm({ ...form, [f.name]: v })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {f.name === "active"
                        ? form[f.name]
                          ? "Active"
                          : "Deactive"
                        : form[f.name]
                          ? "Published"
                          : "Unpublished"}
                    </span>
                  </div>
                ) : f.type === "textarea" || f.type === "json" ? (
                  <Textarea
                    id={f.name}
                    rows={f.type === "json" ? 6 : 4}
                    value={String(form[f.name] ?? "")}
                    required={f.required}
                    maxLength={f.type === "textarea" ? 10000 : undefined}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                ) : f.type === "select" ? (
                  <select
                    id={f.name}
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={String(form[f.name] ?? "")}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.type === "district" ? (
                  <select
                    id={f.name}
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={String(form[f.name] ?? "")}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  >
                    <option value="">None</option>
                    {districts?.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : f.type === "media-list" ? (
                  <div className="space-y-2">
                    <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      {uploadingField === f.name ? "Uploading..." : "Upload photos"}
                      <input
                        type="file"
                        accept={f.accept}
                        multiple
                        className="sr-only"
                        disabled={uploadingField === f.name}
                        onChange={(e) => uploadGalleryFiles(f, e.target.files)}
                      />
                    </Label>
                    <Textarea
                      id={f.name}
                      rows={4}
                      value={String(form[f.name] ?? "[]")}
                      readOnly
                      aria-label="Uploaded gallery photos"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload one or more photos. Captions can be edited in the saved JSON.
                    </p>
                  </div>
                ) : f.type === "media" ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                        <Upload className="h-4 w-4" />
                        {uploadingField === f.name ? "Uploading..." : "Upload file"}
                        <input
                          type="file"
                          accept={f.accept}
                          {...(f.accept?.includes("video")
                            ? { "data-max-size": MAX_VIDEO_SIZE }
                            : {})}
                          className="sr-only"
                          disabled={uploadingField === f.name}
                          onChange={(e) => uploadFile(f, e.target.files?.[0])}
                        />
                      </Label>
                      {String(form[f.name] ?? "") ? (
                        f.accept?.includes("image") ? (
                          <img
                            src={String(form[f.name])}
                            alt="Upload preview"
                            className="h-14 w-14 rounded object-cover"
                          />
                        ) : f.accept?.includes("video") ? (
                          <video
                            src={String(form[f.name])}
                            controls
                            className="h-20 max-w-full rounded object-contain"
                          />
                        ) : (
                          <a
                            href={String(form[f.name])}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-primary underline"
                          >
                            View current file
                          </a>
                        )
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <Input
                    id={f.name}
                    type={
                      f.type === "number"
                        ? "number"
                        : f.type === "date"
                          ? "date"
                          : f.type === "datetime"
                            ? "datetime-local"
                            : "text"
                    }
                    required={f.required}
                    value={String(form[f.name] ?? "")}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending || Boolean(uploadingField)}>
                {uploadingField ? "Uploading..." : save.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
