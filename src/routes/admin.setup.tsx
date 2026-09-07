import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/setup")({
  ssr: false,
  component: AdminSetupPage,
});

function AdminSetupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setEmail(user?.email ?? null);
      if (!user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (roles?.some(({ role }) => role === "admin" || role === "super_admin" || role === "media_admin")) {
        navigate({ to: "/admin", replace: true });
      }
    })();
  }, [navigate]);

  const claim = async () => {
    setBusy(true);
    try {
      if (!email) throw new Error("Sign in before claiming Super Admin access");
      const { data, error } = await supabase.rpc("claim_first_super_admin");
      if (error) throw error;
      if (data !== true) throw new Error("Super Admin claim was not completed");
      toast.success("Super Admin access claimed");
      navigate({ to: "/admin" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Setup could not be completed";
      if (message.toLowerCase().includes("already been claimed")) setAlreadyClaimed(true);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const requestAccess = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.rpc("request_media_admin_access");
      if (error) throw error;
      setRequestSent(true);
      toast.success("Request main admin ko bhej di gayi hai.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request nahi bheji ja saki");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-navy px-4">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lift">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-bold">Claim Super Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This one-time setup is available only to the signed-in account while no admin exists.
        </p>
        {alreadyClaimed ? (
          <div className="mt-5 space-y-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p>Super Admin access kisi aur account ne claim kar liya hai.</p>
            <p className="text-muted-foreground">Media Admin banne ke liye request bhejiye. Access tabhi milega jab Main Admin approve karega.</p>
            <Button className="w-full" onClick={requestAccess} disabled={busy || requestSent}>
              {requestSent ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Request sent</> : "Request Media Admin access"}
            </Button>
          </div>
        ) : email ? (
          <>
            <p className="mt-5 rounded-md border bg-muted/50 p-3 text-sm">Signed in as {email}</p>
            <Button className="mt-5 w-full" onClick={claim} disabled={busy}>
              {busy ? "Checking access..." : "Claim Super Admin access"}
            </Button>
          </>
        ) : (
          <Button asChild className="mt-5 w-full">
            <Link to="/login">Sign in to continue</Link>
          </Button>
        )}
        <Link
          to="/"
          className="mt-5 block text-center text-sm text-muted-foreground hover:text-primary"
        >
          Back to website
        </Link>
      </div>
    </div>
  );
}
