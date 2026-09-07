import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, ShieldCheck, UserRoundX, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase as typedSupabase } from "@/integrations/supabase/client";

// The RPCs are restricted to administrators in the database migration.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = typedSupabase as any;

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsersPage,
});

type AdminUser = { user_id: string; email: string; role: "admin" | "super_admin" | "media_admin"; created_at: string };
type AccessRequest = { id: string; user_id: string; email: string; status: string; created_at: string };

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [roleToGrant, setRoleToGrant] = useState<"media_admin" | "super_admin">("media_admin");
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_admin_users");
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["admin-access-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_admin_access_requests");
      if (error) throw error;
      return (data ?? []) as AccessRequest[];
    },
  });

  const grant = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("grant_admin_access", {
        _email: email.trim(),
        _role: roleToGrant,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${roleToGrant === "super_admin" ? "Super Admin" : "Media Admin"} access granted`);
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const revoke = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("revoke_admin_role", { _user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Admin access removed");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const review = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.rpc("review_admin_access_request", {
        _request_id: id,
        _approved: approved,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Access request updated");
      queryClient.invalidateQueries({ queryKey: ["admin-access-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Admin access</h1>
        <p className="text-sm text-muted-foreground">
          Grant access to an account that has already signed up on this website.
        </p>
      </div>
      <form
        className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-card sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          grant.mutate();
        }}
      >
        <Input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Registered user email"
        />
        <Select value={roleToGrant} onValueChange={(value) => setRoleToGrant(value as "media_admin" | "super_admin")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="media_admin">Media Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={grant.isPending}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Grant Media Admin
        </Button>
      </form>
      <section className="space-y-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Pending access requests</h2>
          <p className="text-sm text-muted-foreground">Approve karne par user ko sirf Gallery, Videos, Events aur News ka access milega.</p>
        </div>
        {requestsLoading ? <Skeleton className="h-20 w-full" /> : requests?.filter((request) => request.status === "pending").length ? (
          <div className="overflow-hidden rounded-lg border bg-card shadow-card">
            {requests.filter((request) => request.status === "pending").map((request) => (
              <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 border-b p-4 last:border-0">
                <div>
                  <p className="font-medium">{request.email}</p>
                  <p className="text-xs text-muted-foreground">Media Admin request</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" disabled={review.isPending} onClick={() => review.mutate({ id: request.id, approved: true })}>
                    <Check className="mr-2 h-4 w-4" /> Allow
                  </Button>
                  <Button variant="outline" size="sm" disabled={review.isPending} onClick={() => review.mutate({ id: request.id, approved: false })}>
                    <X className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">No pending requests.</p>}
      </section>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !users?.length ? (
        <p className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No admin users found.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card shadow-card">
          {users.map((user) => (
            <div
              key={user.user_id}
              className="flex flex-wrap items-center justify-between gap-3 border-b p-4 last:border-0"
            >
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-xs capitalize text-muted-foreground">{user.role.replace("_", " ")}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={revoke.isPending}
                onClick={() => {
                  if (confirm(`Remove admin access for ${user.email}?`))
                    revoke.mutate(user.user_id);
                }}
              >
                <UserRoundX className="mr-2 h-4 w-4" />
                Remove access
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
