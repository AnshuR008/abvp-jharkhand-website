import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SmartImage } from "./SmartImage";
import { formatDate } from "@/lib/site";
import type { Row } from "@/lib/data";

export function NewsCard({ item }: { item: Row }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-card transition-shadow hover:shadow-lift">
      <Link to="/news/$slug" params={{ slug: item.slug }} className="zoom-media block aspect-[16/10]">
        <SmartImage src={item.featured_image} alt={item.title} className="h-full w-full object-cover" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2 text-xs">
          <Badge variant="secondary">{item.category}</Badge>
          <span className="text-muted-foreground">{formatDate(item.published_at)}</span>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug">
          <Link to="/news/$slug" params={{ slug: item.slug }} className="hover:text-primary">
            {item.title}
          </Link>
        </h3>
        {item.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.excerpt}</p>
        ) : null}
      </div>
    </article>
  );
}

export function EventCard({ item }: { item: Row }) {
  const past = new Date(item.start_date) < new Date();
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-card transition-shadow hover:shadow-lift">
      <Link to="/events/$slug" params={{ slug: item.slug }} className="zoom-media relative block aspect-[16/10]">
        <SmartImage src={item.banner_image} alt={item.title} className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3">
          <Badge variant={past ? "secondary" : "default"}>{past ? "Past" : "Upcoming"}</Badge>
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug">
          <Link to="/events/$slug" params={{ slug: item.slug }} className="hover:text-primary">
            {item.title}
          </Link>
        </h3>
        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" aria-hidden /> {formatDate(item.start_date)}
          </p>
          {item.venue ? (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden /> {item.venue}
              {item.city ? `, ${item.city}` : ""}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function LeaderCard({ item }: { item: Row }) {
  return (
    <article className="group overflow-hidden rounded-lg border bg-card text-center shadow-card transition-shadow hover:shadow-lift">
      <div className="zoom-media aspect-square">
        <SmartImage src={item.photo} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold">{item.name}</h3>
        <p className="mt-1 text-sm font-medium text-primary">{item.designation}</p>
        {item.bio ? <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{item.bio}</p> : null}
      </div>
    </article>
  );
}

export function DistrictCard({ item }: { item: Row }) {
  return (
    <Link
      to="/districts/$slug"
      params={{ slug: item.slug }}
      className="group relative block overflow-hidden rounded-lg border shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="zoom-media aspect-[4/3]">
        <SmartImage src={item.cover_image} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
      <div className="absolute bottom-0 w-full p-4 text-navy-foreground">
        <h3 className="font-display text-lg font-semibold">{item.name}</h3>
        {item.president_name ? (
          <p className="text-xs text-navy-foreground/80">{item.president_name}</p>
        ) : null}
      </div>
    </Link>
  );
}
