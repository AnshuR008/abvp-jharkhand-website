import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/abvp-logo.png";

const AUTH_REQUEST_TIMEOUT_MS = 15000;

async function withAuthTimeout<T>(request: Promise<T>): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Supabase se response nahi aa raha. Internet ya Supabase Auth settings check kijiye.")),
      AUTH_REQUEST_TIMEOUT_MS,
    );
  });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Login — ABVP Jharkhand" },
      { name: "description", content: "Sign in to the ABVP Jharkhand content management system." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Login — ABVP Jharkhand" },
      { property: "og:description", content: "Content management system sign in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) throw new Error("Email bharna zaroori hai.");
        if (password.length < 8)
          throw new Error("Password kam se kam 8 characters ka hona chahiye.");
        if (password !== confirmPassword)
          throw new Error("Password aur confirm password match nahi kar rahe.");

        const { data, error } = await withAuthTimeout(
          supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/login`,
            },
          }),
        );
        if (error) {
          if (error.status === 401) {
            throw new Error("Supabase API key invalid hai. Project ki Publishable key .env mein update kijiye.");
          }
          throw error;
        }

        if (data.session) {
          toast.success("Account created successfully!");
          navigate({ to: "/admin/setup" });
        } else if (data.user) {
          setVerificationPending(true);
          toast.success("Account created. Please verify your email before signing in.");
        } else {
          throw new Error("Account create nahi hua. Email dobara check karke try kijiye.");
        }
      } else {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || !password) {
          throw new Error("Email aur password dono bharna zaroori hai.");
        }
        const { data, error } = await withAuthTimeout(
          supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          }),
        );
        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            throw new Error("Pehle email inbox se verification link par click kijiye.");
          }
          if (error.status === 401) {
            throw new Error("Supabase API key invalid hai. .env mein isi project ki Publishable key paste kijiye.");
          }
          throw error;
        }
        const { data: roles, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);
        if (roleError) throw roleError;
        const hasAdminAccess = roles?.some(
          ({ role }) => role === "admin" || role === "super_admin" || role === "media_admin",
        );
        navigate({ to: hasAdminAccess ? "/admin" : "/admin/setup" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  const resendVerification = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Email bharna zaroori hai.");
      return;
    }
    setResendingVerification(true);
    try {
      const { error } = await withAuthTimeout(
        supabase.auth.resend({ type: "signup", email: normalizedEmail }),
      );
      if (error) throw error;
      toast.success("Verification email dobara bhej diya gaya hai.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification email nahi bheja ja saka.");
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-navy px-4">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lift">
        <div className="mb-6 flex items-center gap-3">
          <img
            src={logo}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-contain"
          />
          <div>
            <h1 className="font-display text-xl font-bold">ABVP Jharkhand</h1>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin CMS</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={mode === "signup" ? 8 : 6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {mode === "signup" ? (
            <div>
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Kam se kam 8 characters ka password rakhiye.
              </p>
            </div>
          ) : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        {verificationPending ? (
          <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
            <p>Email inbox check karke verification link par click kijiye, phir yahan sign in kijiye.</p>
            <Button
              type="button"
              variant="link"
              className="h-auto px-0 pt-2"
              onClick={resendVerification}
              disabled={resendingVerification}
            >
              {resendingVerification ? "Sending..." : "Resend verification email"}
            </Button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setConfirmPassword("");
            setVerificationPending(false);
          }}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>

        <div className="mt-6 border-t pt-4 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
