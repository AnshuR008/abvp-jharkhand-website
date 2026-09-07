import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PublicLayout } from "@/components/site/PublicLayout";
import { SmartImage } from "@/components/site/SmartImage";
import { EmptyState } from "@/components/site/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRowBy, insertRow, listRows } from "@/lib/data";
import { ACADEMIC_YEARS, formatDateTime } from "@/lib/site";

export const Route = createFileRoute("/events/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — ABVP Jharkhand Event` },
      { name: "description", content: "Event details from ABVP Jharkhand." },
      { property: "og:title", content: "ABVP Jharkhand Event" },
      { property: "og:description", content: "Event details from ABVP Jharkhand." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventDetailPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  mobile: z.string().trim().regex(/^[0-9+\s-]{10,15}$/, "Enter a valid mobile number"),
  email: z.string().trim().email("Enter a valid email").max(255).or(z.literal("")),
  district: z.string().trim().max(80),
  college: z.string().trim().max(150),
  course: z.string().trim().max(100),
  academic_year: z.string().trim().max(40),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
});

function RegistrationForm({ eventId }: { eventId: string }) {
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    district: "",
    college: "",
    course: "",
    academic_year: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const { data: districts } = useQuery({
    queryKey: ["districts", "names"],
    queryFn: () => listRows("districts", { order: { column: "sort_order", ascending: true } }),
  });

  const mutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      insertRow("event_registrations", { ...values, event_id: eventId }),
    onSuccess: () => {
      setDone(true);
      toast.success("Registration submitted! Hum aapse sampark karenge.");
    },
    onError: () => toast.error("Could not submit registration. Please try again."),
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
    mutation.mutate({ ...parsed.data, email: parsed.data.email || null });
  };

  if (done) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center shadow-card">
        <h3 className="font-display text-xl font-semibold">Registration received</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Dhanyavaad! Karyakram se pehle aapko sanchaar prapt hoga.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-6 shadow-card">
      <h3 className="font-display text-xl font-semibold">Register for this event</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="full_name">Full name *</Label>
          <Input
            id="full_name"
            value={form.full_name}
            maxLength={100}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          {errors["full_name"] ? <p className="mt-1 text-xs text-destructive">{errors["full_name"]}</p> : null}
        </div>
        <div>
          <Label htmlFor="mobile">Mobile *</Label>
          <Input
            id="mobile"
            value={form.mobile}
            maxLength={15}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />
          {errors["mobile"] ? <p className="mt-1 text-xs text-destructive">{errors["mobile"]}</p> : null}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            maxLength={255}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors["email"] ? <p className="mt-1 text-xs text-destructive">{errors["email"]}</p> : null}
        </div>
        <div>
          <Label>District</Label>
          <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {(districts ?? []).map((d) => (
                <SelectItem key={d.id} value={d.name}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="college">College</Label>
          <Input
            id="college"
            value={form.college}
            maxLength={150}
            onChange={(e) => setForm({ ...form, college: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="course">Course</Label>
          <Input
            id="course"
            value={form.course}
            maxLength={100}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Academic year</Label>
          <Select value={form.academic_year} onValueChange={(v) => setForm({ ...form, academic_year: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="consent"
          checked={form.consent}
          onCheckedChange={(v) => setForm({ ...form, consent: v === true })}
        />
        <Label htmlFor="consent" className="text-sm font-normal leading-snug text-muted-foreground">
          Main sahmati deta/deti hoon ki ABVP Jharkhand meri di gayi jaankari karyakram sanchaalan ke liye
          upyog kare.
        </Label>
      </div>
      {errors["consent"] ? <p className="text-xs text-destructive">{errors["consent"]}</p> : null}

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Submitting..." : "Submit registration"}
      </Button>
    </form>
  );
}

function EventDetailPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["events", slug],
    queryFn: () => getRowBy("events", "slug", slug),
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container-page space-y-4 py-16">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-80 w-full" />
        </div>
      </PublicLayout>
    );
  }

  if (!data) {
    return (
      <PublicLayout>
        <div className="container-page py-20">
          <EmptyState title="Event not found" />
        </div>
      </PublicLayout>
    );
  }

  const past = new Date(data.start_date) < new Date();

  return (
    <PublicLayout>
      <div className="container-page py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link to="/events">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to events
          </Link>
        </Button>

        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-lg">
              <SmartImage
                src={data.banner_image}
                alt={data.title}
                className="aspect-[16/9] w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 700px"
                priority
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Badge variant={past ? "secondary" : "default"}>{past ? "Past event" : "Upcoming"}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-bold text-balance-title md:text-4xl">{data.title}</h1>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden /> {formatDateTime(data.start_date)}
                {data.end_date ? ` — ${formatDateTime(data.end_date)}` : ""}
              </p>
              {data.venue ? (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden /> {data.venue}
                  {data.city ? `, ${data.city}` : ""}
                </p>
              ) : null}
            </div>
            {data.description ? <p className="mt-6 text-lg text-muted-foreground">{data.description}</p> : null}
            <div className="mt-4 space-y-4 leading-relaxed">
              {(data.content ?? "").split("\n").filter(Boolean).map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
