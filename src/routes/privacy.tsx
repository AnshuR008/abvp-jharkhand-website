import { createFileRoute } from "@tanstack/react-router";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader } from "@/components/site/States";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ABVP Jharkhand" },
      { name: "description", content: "How ABVP Jharkhand collects, uses and protects the information you submit." },
      { property: "og:title", content: "Privacy Policy — ABVP Jharkhand" },
      { property: "og:description", content: "Aapki jaankari ka upyog aur suraksha." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PublicLayout>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <div className="container-page max-w-3xl space-y-6 py-12 text-muted-foreground">
        <p>
          ABVP Jharkhand aapki niji jaankari ka samman karta hai. Yeh policy batati hai ki hum kaunsi
          jaankari ekatrit karte hain aur uska upyog kaise karte hain.
        </p>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Information we collect</h2>
          <p className="mt-2">
            Membership, volunteer, event registration aur contact forms ke madhyam se aapka naam, mobile,
            email, zila, mahavidyalaya aur sandesh jaisi jaankari ekatrit ki jati hai.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">How we use it</h2>
          <p className="mt-2">
            Jaankari ka upyog keval sangathanatmak sanchaar, karyakram sanchaalan aur aavedan review ke liye
            hota hai. Hum aapka data kisi vyaavsayik sanstha ko nahi bechte.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Data security</h2>
          <p className="mt-2">
            Sabhi submissions surakshit database mein store hote hain aur keval adhikrit admin hi unhe dekh
            sakte hain.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Your rights</h2>
          <p className="mt-2">
            Aap kabhi bhi apni jaankari ke sudhaar ya hatane ke liye contact page ke madhyam se anurodh kar
            sakte hain.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
