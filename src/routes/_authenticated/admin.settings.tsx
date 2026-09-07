import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase as typedSupabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = typedSupabase as any;

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

const KEYS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "site_name", label: "Site name" },
  { key: "tagline", label: "Tagline" },
  { key: "logo_url", label: "Logo" },
  { key: "favicon_url", label: "Favicon" },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "address", label: "Address", multiline: true },
  { key: "footer_text", label: "Footer text", multiline: true },
  { key: "facebook_url", label: "Facebook URL" },
  { key: "twitter_url", label: "Twitter URL" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "youtube_url", label: "YouTube URL" },
  { key: "seo_title", label: "Default SEO title" },
  { key: "seo_description", label: "Default SEO description", multiline: true },
  { key: "maintenance_mode", label: "Maintenance mode (true/false)" },
];

function SettingsPage() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(data ?? {}))
        out[k] = v === null || v === undefined ? "" : String(v);
      return out;
    },
  });

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const patch: Record<string, string | boolean> = {};
      for (const k of KEYS) {
        patch[k.key] =
          k.key === "maintenance_mode" ? values[k.key] === "true" : (values[k.key] ?? "");
      }
      const id = data?.["id"];
      const { error } = id
        ? await supabase.from("site_settings").update(patch).eq("id", id)
        : await supabase.from("site_settings").insert(patch);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadAsset = async (key: string, file?: File) => {
    if (!file) return;
    setUploading(key);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `settings/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("admin-assets").upload(path, file);
      if (error) throw error;
      const { data: url } = supabase.storage.from("admin-assets").getPublicUrl(path);
      setValues((current) => ({ ...current, [key]: url.publicUrl }));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Site Settings</h1>
        <p className="text-sm text-muted-foreground">Global website configuration</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <form
          className="space-y-4 rounded-lg border bg-card p-6 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {KEYS.map((k) => (
            <div key={k.key}>
              <Label htmlFor={k.key}>{k.label}</Label>
              {k.multiline ? (
                <Textarea
                  id={k.key}
                  rows={3}
                  value={values[k.key] ?? ""}
                  onChange={(e) => setValues({ ...values, [k.key]: e.target.value })}
                />
              ) : (
                <div className="space-y-2">
                  {k.key === "logo_url" || k.key === "favicon_url" ? null : (
                    <Input
                      id={k.key}
                      type="text"
                      value={values[k.key] ?? ""}
                      onChange={(e) => setValues({ ...values, [k.key]: e.target.value })}
                    />
                  )}
                  {k.key === "logo_url" || k.key === "favicon_url" ? (
                    <div className="flex items-center gap-3">
                      <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                        <Upload className="h-4 w-4" />{" "}
                        {uploading === k.key ? "Uploading..." : "Upload image"}
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          disabled={uploading === k.key}
                          onChange={(e) => uploadAsset(k.key, e.target.files?.[0])}
                        />
                      </Label>
                      {values[k.key] ? (
                        <img
                          src={values[k.key]}
                          alt="Preview"
                          className="h-10 w-10 rounded-full object-contain"
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving..." : "Save settings"}
          </Button>
        </form>
      )}
    </div>
  );
}
