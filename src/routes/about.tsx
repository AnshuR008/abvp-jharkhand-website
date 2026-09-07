import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, ListChecks, Network } from "lucide-react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHeader, SectionHeading } from "@/components/site/States";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ABVP Jharkhand — History, Vision & Structure" },
      {
        name: "description",
        content:
          "History, vision, mission, objectives and organisational structure of Akhil Bharatiya Vidyarthi Parishad, Jharkhand.",
      },
      { property: "og:title", content: "About ABVP Jharkhand" },
      { property: "og:description", content: "Itihas, drishti, uddeshya aur sangathanatmak dhancha." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const objectives = [
  "Chhatra hiton ki raksha aur campus par nyaypurna vyavastha.",
  "Shiksha sudhar — samay par pariksha, result aur chhatrasangh chunav.",
  "Rashtriya ekta aur samajik samrasta ka prasar.",
  "Seva karya — raktdaan, aapda sahayata, swachhata abhiyan.",
  "Chhatraon ki suraksha aur samaan bhagidari.",
  "Skill development aur rozgaar se juda margdarshan.",
];

const structure = [
  { level: "Prant (State)", detail: "Prant Adhyaksh, Prant Mantri, Prant Sangathan Mantri aur prant karyakarini." },
  { level: "Vibhag & Zila", detail: "25 zila ikaiyan, pratyek mein zila adhyaksh aur zila mantri." },
  { level: "Nagar / Ikai", detail: "Mahavidyalaya star par ikai — campus gatividhiyon ka aadhar." },
  { level: "Aayam & Prakoshth", detail: "SFD, Think India, Media, Chhatra Shakti jaise vishisht aayam." },
];

function AboutPage() {
  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Hamara Parichay"
        title="About ABVP Jharkhand"
        description="Akhil Bharatiya Vidyarthi Parishad vishwa ka sabse bada chhatra sangathan hai. Jharkhand prant iski sabse sakriya ikaiyon mein se ek hai."
      />

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="Itihas" title="Our History" />
            <div className="space-y-4 text-muted-foreground">
              <p>
                ABVP ki sthapna 9 July 1949 ko hui. Sangathan ka mool mantra hai —{" "}
                <strong className="text-foreground">Gyan, Sheel, Ekta</strong>. Shuruaat se hi ABVP ne
                chhatron ko keval maang karne wala nahi, balki nirman karne wala samuh maana hai.
              </p>
              <p>
                Jharkhand rajya ke gathan (2000) ke baad ABVP Jharkhand prant ne alag ikai ke roop mein
                kaam shuru kiya. Aaj rajya ke 25 zilon, 400 se adhik mahavidyalayon aur vishwavidyalayon
                mein sangathan sakriya hai.
              </p>
              <p>
                Chhatrasangh chunav ki bahali, hostel suraksha, pariksha sudhar aur aapda ke samay seva
                karya — in sab mein ABVP Jharkhand ne netritva kiya hai.
              </p>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={0.05}>
              <div className="rounded-lg border bg-card p-6 shadow-card">
                <Eye className="mb-3 h-6 w-6 text-primary" aria-hidden />
                <h3 className="font-display text-xl font-semibold">Vision</h3>
                <p className="mt-2 text-muted-foreground">
                  Aisa chhatra samaj jo shikshit, sanskarit aur rashtra ke prati samarpit ho — jahan har
                  vidyarthi ko samaan avsar mile.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-lg border bg-card p-6 shadow-card">
                <Target className="mb-3 h-6 w-6 text-primary" aria-hidden />
                <h3 className="font-display text-xl font-semibold">Mission</h3>
                <p className="mt-2 text-muted-foreground">
                  Campus star par chhatra hiton ki nirantar paksh-rakhna, netritva nirman, aur samaj
                  seva ke madhyam se rashtra nirman.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-muted/60 py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Uddeshya" title="Our Objectives" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {objectives.map((item, i) => (
              <Reveal key={item} delay={i * 0.04}>
                <div className="flex h-full gap-3 rounded-lg border bg-card p-5 shadow-card">
                  <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm text-muted-foreground">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Dhancha" title="Organisational Structure" />
        <div className="grid gap-5 md:grid-cols-2">
          {structure.map((item, i) => (
            <Reveal key={item.level} delay={i * 0.05}>
              <div className="rounded-lg border-l-4 border-l-primary bg-card p-6 shadow-card">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" aria-hidden />
                  <h3 className="font-display text-lg font-semibold">{item.level}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
