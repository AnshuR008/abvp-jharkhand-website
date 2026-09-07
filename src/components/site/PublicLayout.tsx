import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Menu,
  Search,
  Megaphone,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { listRows } from "@/lib/data";
import { NAV_LINKS, SITE } from "@/lib/site";
import logo from "@/assets/abvp-logo.png";

function AnnouncementBar() {
  const { data } = useQuery({
    queryKey: ["announcements", "active"],
    queryFn: () => listRows("announcements", { order: { column: "created_at" }, limit: 3 }),
  });
  const first = (data ?? [])[0];
  if (!first) return null;
  return (
    <div className="gradient-saffron text-primary-foreground">
      <div className="container-page flex items-center gap-3 py-2 text-sm">
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
        <div className="flex-1 overflow-hidden">
          <p className="truncate">
            {first.link ? (
              <Link to={first.link} className="underline-offset-4 hover:underline">
                {first.message}
              </Link>
            ) : (
              first.message
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { data: settings } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => (await listRows("site_settings", { limit: 1 }))[0] ?? null,
  });
  const siteName = settings?.site_name ?? SITE.name;
  const tagline = settings?.tagline ?? SITE.tagline;
  const logoUrl = settings?.logo_url || logo;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    setOpen(false);
    navigate({ to: "/search", search: { q: term.trim() } });
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <img
            src={logoUrl}
            alt={`${siteName} logo`}
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 rounded-full object-contain sm:h-10 sm:w-10"
          />
          <span className="min-w-0 leading-tight">
            <span className="block truncate whitespace-nowrap font-display text-base font-bold sm:text-lg">
              {siteName}
            </span>
            <span className="hidden whitespace-nowrap text-[9px] uppercase tracking-[0.12em] text-muted-foreground min-[361px]:block sm:text-[10px] sm:tracking-[0.18em]">
              {tagline}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <form onSubmit={submitSearch} className="hidden xl:block">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search"
                aria-label="Search the site"
                className="h-9 w-40 pl-8"
              />
            </div>
          </form>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/join">Join ABVP</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetTitle className="font-display">{siteName}</SheetTitle>
              <form onSubmit={submitSearch} className="mt-4 px-1">
                <Input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search news, events, leaders"
                  aria-label="Search the site"
                />
              </form>
              <nav className="mt-4 flex flex-col px-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    activeProps={{ className: "text-primary" }}
                    className="rounded-md px-2 py-3 text-sm font-medium hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button asChild className="mt-4">
                  <Link to="/join" onClick={() => setOpen(false)}>
                    Join ABVP
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { data: settings } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => (await listRows("site_settings", { limit: 1 }))[0] ?? null,
  });

  const socials = [
    { href: settings?.facebook_url, Icon: Facebook, label: "Facebook" },
    { href: settings?.twitter_url, Icon: Twitter, label: "Twitter" },
    { href: settings?.instagram_url, Icon: Instagram, label: "Instagram" },
    { href: settings?.youtube_url, Icon: Youtube, label: "YouTube" },
  ].filter((s) => Boolean(s.href));

  return (
    <footer className="gradient-navy text-navy-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={settings?.logo_url || logo}
              alt=""
              width={44}
              height={44}
              loading="lazy"
              className="h-11 w-11 rounded-full object-contain"
            />
            <div>
              <p className="font-display text-xl font-bold">{settings?.site_name ?? SITE.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-saffron-light">
                {settings?.tagline ?? SITE.tagline}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm text-navy-foreground/70">
            {settings?.footer_text ??
              "Akhil Bharatiya Vidyarthi Parishad, Jharkhand Pradesh. Student Power, Nation First."}
          </p>
          {socials.length ? (
            <div className="mt-5 flex gap-3">
              {socials.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href as string}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="rounded-md border border-navy-foreground/20 p-2 transition-colors hover:bg-navy-foreground/10"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-saffron-light">
            Explore
          </h3>
          <ul className="space-y-2 text-sm text-navy-foreground/75">
            {[...NAV_LINKS.slice(1), { to: "/join", label: "Join / Volunteer" }].map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-navy-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-saffron-light">
            Contact
          </h3>
          <ul className="space-y-3 text-sm text-navy-foreground/75">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{settings?.address ?? "State Office, Ranchi, Jharkhand"}</span>
            </li>
            <li className="flex gap-2">
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              <a
                href={`mailto:${settings?.contact_email ?? ""}`}
                className="hover:text-navy-foreground"
              >
                {settings?.contact_email ?? "contact@abvpjharkhand.org"}
              </a>
            </li>
            <li className="flex gap-2">
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              <a
                href={`tel:${settings?.contact_phone ?? ""}`}
                className="hover:text-navy-foreground"
              >
                {settings?.contact_phone ?? "+91 90000 00000"}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-navy-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings?.site_name ?? SITE.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-navy-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-navy-foreground">
              Terms of Use
            </Link>
            <Link to="/login" className="hover:text-navy-foreground">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
