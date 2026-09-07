import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader } from "@/components/site/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertRow, listRows } from "@/lib/data";
import { ACADEMIC_YEARS, INTEREST_OPTIONS } from "@/lib/site";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join / Volunteer — ABVP Jharkhand Membership" },
      {
        name: "description",
        content:
          "Apply to join ABVP Jharkhand as a member or volunteer. Fill the application form and our district team will contact you.",
      },
      { property: "og:title", content: "Join ABVP Jharkhand" },
      { property: "og:description", content: "Sadasyata ya volunteer ke liye aavedan kijiye." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  mobile: z.string().trim().regex(/^[0-9+\s-]{10,15}$/, "Enter a valid mobile number"),
  email: z.string().trim().email("Enter a valid email").max(255).or(z.literal("")),
  date_of_birth: z.string().max(20),
  district: z.string().trim().min(1, "Select your district"),
  city: z.string().trim().max(80),
  address: z.string().trim().max(300),
  college: z.string().trim().max(150),
  course: z.string().trim().max(100),
  academic_year: z.string().max(40),
  photo_url: z.string().trim().url("Enter a valid image URL").max(500).or(z.literal("")),
  message: z.string().trim().max(1000),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
});

const empty = {
  full_name: "",
  mobile: "",
  email: "",
  date_of_birth: "",
  district: "",
  city: "",
  address: "",
  college: "",
  course: "",
  academic_year: "",
  photo_url: "",
  message: "",
  consent: false,
};

function JoinPage() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const { data: districts } = useQuery({
    queryKey: ["districts", "names"],
    queryFn: () => listRows("districts", { order: { column: "sort_order", ascending: true } }),
  });

  const mutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => insertRow("volunteer_applications", values),
    onSuccess: () => {
      setDone(true);
      setForm(empty);
      setInterests([]);
      toast.success("Application submitted — dhanyavaad!");
    },
    onError: () => toast.error("Could not submit your application. Please try again."),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    const v = parsed.data;
    mutation.mutate({
      ...v,
      email: v.email || null,
      photo_url: v.photo_url || null,
      date_of_birth: v.date_of_birth || null,
      interests,
    });
  };

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Sadasyata"
        title="Join / Volunteer"
        description="Form bhariye — aapke zile ki team aapse sampark karegi."
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[2fr_1fr]">
        {done ? (
          <div className="rounded-lg border bg-card p-10 text-center shadow-card">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden />
            <h2 className="mt-4 font-display text-2xl font-semibold">Application received</h2>
            <p className="mt-2 text-muted-foreground">
              Aapka aavedan admin team ke paas pahunch gaya hai. Review ke baad aapse sampark kiya jayega.
            </p>
            <Button className="mt-6" onClick={() => setDone(false)}>
              Submit another application
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6 rounded-lg border bg-card p-6 shadow-card md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Full name *</Label>
                <Input id="full_name" maxLength={100} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                {errors["full_name"] ? <p className="mt-1 text-xs text-destructive">{errors["full_name"]}</p> : null}
              </div>
              <div>
                <Label htmlFor="mobile">Mobile *</Label>
                <Input id="mobile" maxLength={15} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                {errors["mobile"] ? <p className="mt-1 text-xs text-destructive">{errors["mobile"]}</p> : null}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {errors["email"] ? <p className="mt-1 text-xs text-destructive">{errors["email"]}</p> : null}
              </div>
              <div>
                <Label htmlFor="dob">Date of birth</Label>
                <Input id="dob" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
              </div>
              <div>
                <Label>District *</Label>
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
                {errors["district"] ? <p className="mt-1 text-xs text-destructive">{errors["district"]}</p> : null}
              </div>
              <div>
                <Label htmlFor="city">City / Town</Label>
                <Input id="city" maxLength={80} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" maxLength={300} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="college">College / University</Label>
                <Input id="college" maxLength={150} value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="course">Course</Label>
                <Input id="course" maxLength={100} value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
              </div>
              <div>
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
              <div>
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input
                  id="photo_url"
                  placeholder="https://..."
                  maxLength={500}
                  value={form.photo_url}
                  onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                />
                {errors["photo_url"] ? <p className="mt-1 text-xs text-destructive">{errors["photo_url"]}</p> : null}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Areas of interest</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {INTEREST_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={interests.includes(option)}
                      onCheckedChange={(v) =>
                        setInterests((prev) => (v === true ? [...prev, option] : prev.filter((p) => p !== option)))
                      }
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="message">Why do you want to join?</Label>
              <Textarea
                id="message"
                rows={4}
                maxLength={1000}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="consent" checked={form.consent} onCheckedChange={(v) => setForm({ ...form, consent: v === true })} />
              <Label htmlFor="consent" className="text-sm font-normal leading-snug text-muted-foreground">
                Main pushti karta/karti hoon ki di gayi jaankari sahi hai aur ABVP Jharkhand mujhse sampark kar
                sakta hai.
              </Label>
            </div>
            {errors["consent"] ? <p className="text-xs text-destructive">{errors["consent"]}</p> : null}

            <Button type="submit" size="lg" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? "Submitting..." : "Submit application"}
            </Button>
          </form>
        )}

        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold">Kyun judein?</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Campus star par netritva ka avsar</li>
              <li>• Prashikshan shivir aur karyashalayein</li>
              <li>• Samaj seva aur rashtra nirman ke prakalp</li>
              <li>• 25 zilon ka sakriya network</li>
            </ul>
          </div>
          <div className="rounded-lg gradient-navy p-6 text-navy-foreground">
            <h2 className="font-display text-lg font-semibold">Gyan • Sheel • Ekta</h2>
            <p className="mt-2 text-sm text-navy-foreground/80">
              ABVP ka mool mantra. Sadasyata sirf ek form nahi, ek sankalp hai.
            </p>
          </div>
        </aside>
      </div>
    </PublicLayout>
  );
}
