import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader } from "@/components/site/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertRow, listRows } from "@/lib/data";
import { CONTACT_CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ABVP Jharkhand — State Office" },
      {
        name: "description",
        content: "Contact the ABVP Jharkhand state office by email, phone or the online message form.",
      },
      { property: "og:title", content: "Contact — ABVP Jharkhand" },
      { property: "og:description", content: "Prant karyalaya se sampark kijiye." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  mobile: z.string().trim().max(15),
  subject: z.string().trim().min(3, "Subject is required").max(150),
  category: z.string().trim().min(1),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

const empty = { name: "", email: "", mobile: "", subject: "", category: "General", message: "" };

function ContactPage() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => (await listRows("site_settings", { limit: 1 }))[0] ?? null,
  });

  const mutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => insertRow("contact_messages", values),
    onSuccess: () => {
      setDone(true);
      setForm(empty);
      toast.success("Message sent — hum jald hi jawab denge.");
    },
    onError: () => toast.error("Could not send your message. Please try again."),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  };

  return (
    <PublicLayout>
      <PageHeader eyebrow="Sampark" title="Contact Us" description="Sujhav, sahyog ya shikayat — hamein likhiye." />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr]">
        {done ? (
          <div className="rounded-lg border bg-card p-10 text-center shadow-card">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden />
            <h2 className="mt-4 font-display text-2xl font-semibold">Message sent</h2>
            <p className="mt-2 text-muted-foreground">Aapka sandesh admin inbox mein pahunch gaya hai.</p>
            <Button className="mt-6" onClick={() => setDone(false)}>
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-6 shadow-card md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors["name"] ? <p className="mt-1 text-xs text-destructive">{errors["name"]}</p> : null}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {errors["email"] ? <p className="mt-1 text-xs text-destructive">{errors["email"]}</p> : null}
              </div>
              <div>
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" maxLength={15} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" maxLength={150} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              {errors["subject"] ? <p className="mt-1 text-xs text-destructive">{errors["subject"]}</p> : null}
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                rows={6}
                maxLength={1000}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              {errors["message"] ? <p className="mt-1 text-xs text-destructive">{errors["message"]}</p> : null}
            </div>
            <Button type="submit" size="lg" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? "Sending..." : "Send message"}
            </Button>
          </form>
        )}

        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold">State Office</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {settings?.address ?? "ABVP Jharkhand State Office, Ranchi"}
              </li>
              <li className="flex gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <a href={`mailto:${settings?.contact_email ?? ""}`}>{settings?.contact_email}</a>
              </li>
              <li className="flex gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <a href={`tel:${settings?.contact_phone ?? ""}`}>{settings?.contact_phone}</a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </PublicLayout>
  );
}
