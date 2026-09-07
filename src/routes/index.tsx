import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowRight, Users, MapPinned, CalendarCheck, Flag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { NewsCard, EventCard, LeaderCard, DistrictCard } from "@/components/site/Cards";
import { CardsSkeleton, EmptyState, SectionHeading } from "@/components/site/States";
import { Reveal } from "@/components/site/Reveal";
import { SmartImage } from "@/components/site/SmartImage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listRows } from "@/lib/data";
import { SITE } from "@/lib/site";
import logo from "@/assets/abvp-logo.png";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [news, events, leaders, inspirations, siteStats, districts] = await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["home", "news"],
        queryFn: () => listRows("news", { order: { column: "published_at" }, limit: 6 }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["home", "events"],
        queryFn: () =>
          listRows("events", { order: { column: "start_date", ascending: true }, limit: 3 }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["home", "leaders"],
        queryFn: () =>
          listRows("leaders", { order: { column: "sort_order", ascending: true }, limit: 4 }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["home", "inspirations"],
        queryFn: () =>
          listRows("inspirations", {
            order: { column: "sort_order", ascending: true },
            limit: 6,
          }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["home", "site-stats"],
        queryFn: () =>
          listRows("site_stats", { order: { column: "sort_order", ascending: true }, limit: 8 }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["home", "districts"],
        queryFn: () =>
          listRows("districts", { order: { column: "sort_order", ascending: true }, limit: 8 }),
      }),
    ]);

    return { news, events, leaders, inspirations, siteStats, districts };
  },
  head: () => ({
    meta: [
      { title: "ABVP Jharkhand — National Co-ordination of Students" },
      {
        name: "description",
        content:
          "Official platform of Akhil Bharatiya Vidyarthi Parishad, Jharkhand: news, events, districts, leadership and membership.",
      },
      { property: "og:title", content: "ABVP Jharkhand — Student Power, Nation First" },
      {
        property: "og:description",
        content: "News, events, districts and membership for ABVP Jharkhand students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || started.current) return;
      started.current = true;
      const duration = 1400;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

function HomePage() {
  const homeData = Route.useLoaderData();
  const news = useQuery({
    queryKey: ["home", "news"],
    queryFn: () => listRows("news", { order: { column: "published_at" }, limit: 6 }),
    initialData: homeData.news,
  });
  const events = useQuery({
    queryKey: ["home", "events"],
    queryFn: () =>
      listRows("events", { order: { column: "start_date", ascending: true }, limit: 3 }),
    initialData: homeData.events,
  });
  const leaders = useQuery({
    queryKey: ["home", "leaders"],
    queryFn: () =>
      listRows("leaders", { order: { column: "sort_order", ascending: true }, limit: 4 }),
    initialData: homeData.leaders,
  });
  const inspirations = useQuery({
    queryKey: ["home", "inspirations"],
    queryFn: () =>
      listRows("inspirations", {
        order: { column: "sort_order", ascending: true },
        limit: 6,
      }),
    initialData: homeData.inspirations,
  });
  const [activeInspiration, setActiveInspiration] = useState<{
    name: string;
    quote: string;
    photo?: string;
  } | null>(null);
  const siteStats = useQuery({
    queryKey: ["home", "site-stats"],
    queryFn: () =>
      listRows("site_stats", { order: { column: "sort_order", ascending: true }, limit: 8 }),
    initialData: homeData.siteStats,
  });
  const districts = useQuery({
    queryKey: ["home", "districts"],
    queryFn: () =>
      listRows("districts", { order: { column: "sort_order", ascending: true }, limit: 8 }),
    initialData: homeData.districts,
  });

  const fallbackStats = [
    { icon: Users, label: "Active Members", value: 96000, suffix: "+" },
    { icon: MapPinned, label: "Districts", value: districts.data?.length ?? 25 },
    { icon: CalendarCheck, label: "Programmes / Year", value: 1240, suffix: "+" },
    { icon: Flag, label: "Years of Seva", value: 76 },
  ];
  const iconMap = { users: Users, districts: MapPinned, programmes: CalendarCheck, seva: Flag };
  const stats = siteStats.data?.length
    ? siteStats.data.map((stat) => ({
        icon: iconMap[stat.icon as keyof typeof iconMap] ?? Users,
        label: stat.label,
        value: Number(stat.value),
        suffix: stat.suffix ?? "",
      }))
    : fallbackStats;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative isolate overflow-hidden gradient-navy">
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          width={600}
          height={600}
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full object-contain opacity-10 sm:w-[32rem]"
        />
        <div className="container-page relative z-10 py-24 text-primary-foreground md:py-32">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-block rounded-full border border-primary-foreground/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
          >
            {SITE.motto}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="max-w-3xl text-4xl font-bold leading-[1.1] text-balance-title md:text-6xl"
          >
            Akhil Bharatiya Vidyarthi Parishad, Jharkhand
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-5 max-w-2xl text-lg text-primary-foreground/90"
          >
            Jharkhand ke har campus par chhatra hiton ki awaaz. Shiksha, seva aur rashtra nirman ke
            liye samarpit desh ka sabse bada chhatra sangathan.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary-dark"
            >
              <Link to="/join">
                Join ABVP <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary bg-primary text-primary-foreground hover:bg-primary-dark hover:text-primary-foreground"
            >
              <Link to="/about">Know the Organisation</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {stats.map(({ icon: Icon, label, value, suffix }, i) => (
            <Reveal key={label} delay={i * 0.05} className="text-center">
              <Icon className="mx-auto mb-2 h-6 w-6 text-primary" aria-hidden />
              <p className="font-display text-3xl font-bold md:text-4xl">
                <Counter value={value} suffix={suffix ?? ""} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Inspiration */}
      <section className="bg-muted/60 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Prerna"
            title="Our Inspiration"
            description="Yuva shakti ko seva, charitra aur rashtra nirman ki disha dene wali prernaayein."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(inspirations.data ?? []).map((inspiration, i) => (
              <Reveal key={inspiration.name} delay={i * 0.08}>
                <article className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-card transition-shadow hover:shadow-lift">
                  <button
                    type="button"
                    className="zoom-media aspect-[16/10] w-full cursor-pointer text-left"
                    onClick={() => setActiveInspiration(inspiration)}
                    aria-label={`View details about ${inspiration.name}`}
                  >
                    <SmartImage
                      src={inspiration.photo}
                      alt={inspiration.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="font-display text-2xl leading-tight text-primary">“</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {inspiration.quote}
                    </p>
                    <h3 className="mt-5 font-display text-lg font-semibold">{inspiration.name}</h3>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Dialog
            open={Boolean(activeInspiration)}
            onOpenChange={(open) => !open && setActiveInspiration(null)}
          >
            <DialogContent className="max-w-2xl overflow-hidden p-0">
              {activeInspiration ? (
                <>
                  <div className="aspect-[16/9] w-full bg-muted">
                    <SmartImage
                      src={activeInspiration.photo}
                      alt={activeInspiration.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <DialogHeader className="p-6 pt-2">
                    <DialogTitle className="font-display text-2xl">
                      {activeInspiration.name}
                    </DialogTitle>
                    <DialogDescription className="text-base leading-relaxed">
                      {activeInspiration.quote}
                    </DialogDescription>
                  </DialogHeader>
                </>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* News */}
      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Samachar"
            title="Latest News"
            description="Sangathan ki taza gatividhiyan aur vaktavya."
          />
          <Button asChild variant="ghost" className="mb-8">
            <Link to="/news">
              All news <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {news.isLoading ? (
          <CardsSkeleton />
        ) : news.data?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.data.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.04}>
                <NewsCard item={item} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No news yet"
            description="News published from the admin panel appears here."
          />
        )}
      </section>

      {/* Events */}
      <section className="bg-muted/60 py-16">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Karyakram"
              title="Upcoming Events"
              description="Aane wale abhyas varg, samvad aur sabhaayein."
            />
            <Button asChild variant="ghost" className="mb-8">
              <Link to="/events">
                All events <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {events.isLoading ? (
            <CardsSkeleton count={3} />
          ) : events.data?.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.data.map((item, i) => (
                <Reveal key={item.id} delay={i * 0.04}>
                  <EventCard item={item} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState title="No events scheduled" />
          )}
        </div>
      </section>

      {/* Leadership */}
      <section className="container-page py-16">
        <SectionHeading eyebrow="Netritva" title="State Leadership" align="center" />
        {leaders.isLoading ? (
          <CardsSkeleton count={4} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(leaders.data ?? []).map((item, i) => (
              <Reveal key={item.id} delay={i * 0.04}>
                <LeaderCard item={item} />
              </Reveal>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/leadership">Full leadership directory</Link>
          </Button>
        </div>
      </section>

      {/* Districts */}
      <section className="bg-muted/60 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Zila"
            title="Our Districts"
            description="25 zilon mein sakriya sangathanatmak dhancha."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(districts.data ?? []).map((item, i) => (
              <Reveal key={item.id} delay={i * 0.03}>
                <DistrictCard item={item} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link to="/districts">See all districts</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-saffron">
        <div className="container-page flex flex-col items-center gap-6 py-16 text-center text-primary-foreground">
          <h2 className="max-w-2xl text-3xl font-bold text-balance-title md:text-4xl">
            Ban jaiye ABVP parivaar ka hissa
          </h2>
          <p className="max-w-xl text-primary-foreground/90">
            Sadasyata lijiye ya volunteer baniye — apne campus aur samaj ke liye kaam kijiye.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/join">Join / Volunteer</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
