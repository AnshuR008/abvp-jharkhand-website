import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function CardsSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 shadow-card">
          <Skeleton className="mb-4 h-40 w-full rounded-md" />
          <Skeleton className="mb-2 h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed bg-card/50 px-6 py-16 text-center">
      <h3 className="font-display text-xl text-foreground">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-8 max-w-2xl",
        align === "center" && "mx-auto text-center",
        light && "text-primary-foreground",
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-2 text-xs font-semibold uppercase tracking-[0.2em]",
            light ? "text-saffron-light" : "text-primary",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-bold text-balance-title sm:text-4xl">{title}</h2>
      {description ? (
        <p className={cn("mt-3", light ? "text-primary-foreground/75" : "text-muted-foreground")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
}) {
  return (
    <header className="gradient-navy text-navy-foreground">
      <div className="container-page py-14 md:py-20">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-saffron-light">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold text-balance-title md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-navy-foreground/75">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
