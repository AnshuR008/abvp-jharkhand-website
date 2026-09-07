import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Mail,
  ClipboardList,
  Settings,
  Menu,
  UsersRound,
  UserCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { RESOURCE_LIST } from "@/lib/admin-resources";
import logo from "@/assets/abvp-logo.png";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin CMS — ABVP Jharkhand" },
      { name: "description", content: "Content management system for ABVP Jharkhand." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin CMS — ABVP Jharkhand" },
      { property: "og:description", content: "Content management system." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: role, isLoading } = useQuery({
    queryKey: ["admin-role"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id);
      const roles = (data ?? []).map(({ role }) => role);
      return (roles.find((value) => value === "super_admin") ??
        roles.find((value) => value === "admin") ??
        roles.find((value) => value === "media_admin") ?? null) as
        | "admin"
        | "super_admin"
        | "media_admin"
        | null;
    },
  });
  const isAdmin = Boolean(role);
  const isMainAdmin = role === "admin" || role === "super_admin";
  const mediaResources = RESOURCE_LIST.filter((resource) =>
    ["gallery", "videos", "events", "news"].includes(resource.key),
  );
  const visibleResources = isMainAdmin ? RESOURCE_LIST : mediaResources;

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  if (isLoading) {
    return (
      <div className="container-page space-y-4 py-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-lg border bg-card p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aapke account ko abhi admin role nahi mila hai. Kisi maujuda admin se anurodh kijiye.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
            <Button asChild>
              <Link to="/">View site</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const reviewLinks = [
    { kind: "volunteers", label: "Volunteer Applications", Icon: ClipboardList },
    { kind: "messages", label: "Contact Messages", Icon: Mail },
  ];

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2 border-b border-sidebar-border p-4">
          <img
            src={logo}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-contain"
          />
          <span className="font-display font-bold">ABVP Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-3 text-sm">
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-sidebar-accent" }}
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-sidebar-accent"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>

          <p className="px-3 pt-4 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            Content
          </p>
          {visibleResources.map((r) => (
            <Link
              key={r.key}
              to="/admin/c/$resource"
              params={{ resource: r.key }}
              activeProps={{ className: "bg-sidebar-accent" }}
              className="block rounded-md px-3 py-2 hover:bg-sidebar-accent"
            >
              {r.label}
            </Link>
          ))}

          <p className="px-3 pt-4 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            Review
          </p>
          {reviewLinks.map(({ kind, label, Icon }) => (
            <Link
              key={kind}
              to="/admin/review/$kind"
              params={{ kind }}
              activeProps={{ className: "bg-sidebar-accent" }}
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-sidebar-accent"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}

          <p className="px-3 pt-4 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            System
          </p>
          {isMainAdmin ? (
            <>
              <Link
                to="/admin/settings"
                activeProps={{ className: "bg-sidebar-accent" }}
                className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-sidebar-accent"
              >
                <Settings className="h-4 w-4" /> Site Settings
              </Link>
              <Link
                to="/admin/users"
                activeProps={{ className: "bg-sidebar-accent" }}
                className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-sidebar-accent"
              >
                <UsersRound className="h-4 w-4" /> Admin access
              </Link>
            </>
          ) : null}
          <Link
            to="/admin/profile"
            activeProps={{ className: "bg-sidebar-accent" }}
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-sidebar-accent"
          >
            <UserCircle className="h-4 w-4" /> My profile
          </Link>
        </nav>
        <div className="space-y-2 border-t border-sidebar-border p-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Link to="/">
              <ExternalLink className="mr-2 h-4 w-4" /> View site
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 overflow-x-hidden">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-contain"
            />
            <span className="font-display font-bold">ABVP Admin</span>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open admin menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 overflow-y-auto"
              onClick={() => setMobileOpen(false)}
            >
              <SheetTitle className="font-display">Admin menu</SheetTitle>
              <nav className="mt-5 space-y-1 text-sm">
                <Link to="/admin" className="block rounded-md px-3 py-2 hover:bg-muted">
                  Dashboard
                </Link>
                <p className="px-3 pt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Content
                </p>
                {visibleResources.map((r) => (
                  <Link
                    key={r.key}
                    to="/admin/c/$resource"
                    params={{ resource: r.key }}
                    className="block rounded-md px-3 py-2 hover:bg-muted"
                  >
                    {r.label}
                  </Link>
                ))}
                <p className="px-3 pt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Review
                </p>
                {reviewLinks.map((r) => (
                  <Link
                    key={r.kind}
                    to="/admin/review/$kind"
                    params={{ kind: r.kind }}
                    className="block rounded-md px-3 py-2 hover:bg-muted"
                  >
                    {r.label}
                  </Link>
                ))}
                <p className="px-3 pt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                  System
                </p>
                {isMainAdmin ? (
                  <>
                    <Link to="/admin/settings" className="block rounded-md px-3 py-2 hover:bg-muted">
                      Site settings
                    </Link>
                    <Link to="/admin/users" className="block rounded-md px-3 py-2 hover:bg-muted">
                      Admin access
                    </Link>
                  </>
                ) : null}
                <Link to="/admin/profile" className="block rounded-md px-3 py-2 hover:bg-muted">
                  My profile
                </Link>
                <Link to="/" className="block rounded-md px-3 py-2 hover:bg-muted">
                  View site
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="block w-full rounded-md px-3 py-2 text-left text-destructive hover:bg-muted"
                >
                  Logout
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
