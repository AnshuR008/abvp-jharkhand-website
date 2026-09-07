import { createFileRoute } from "@tanstack/react-router";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader } from "@/components/site/States";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — ABVP Jharkhand" },
      { name: "description", content: "Terms governing the use of the ABVP Jharkhand website and services." },
      { property: "og:title", content: "Terms of Use — ABVP Jharkhand" },
      { property: "og:description", content: "Website upyog ki shartein." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PublicLayout>
      <PageHeader eyebrow="Legal" title="Terms of Use" />
      <div className="container-page max-w-3xl space-y-6 py-12 text-muted-foreground">
        <p>
          Is website ka upyog karke aap in shartaon se sahmat hote hain. Yeh platform ABVP Jharkhand prant
          dwara sanchalit hai.
        </p>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Content</h2>
          <p className="mt-2">
            Website par prakashit samagri sangathan ki sampatti hai. Punah-prakashan ke liye anumati avashyak
            hai.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Submissions</h2>
          <p className="mt-2">
            Form ke madhyam se di gayi jaankari satya honi chahiye. Galat ya bhramak jaankari par aavedan
            nirast kiya ja sakta hai.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Acceptable use</h2>
          <p className="mt-2">
            Website ka durupyog, spam ya kisi prakar ki aparadhik gatividhi sakht mana hai.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
