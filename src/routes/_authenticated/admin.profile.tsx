import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { KeyRound, Upload, UserCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  component: AdminProfilePage,
});

function AdminProfilePage() {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw error ?? new Error("Sign in required");
      return data.user;
    },
  });

  useEffect(() => {
    if (!user) return;
    setName(user.user_metadata?.["full_name"] ?? "");
    setAvatarUrl(user.user_metadata?.["avatar_url"] ?? null);
  }, [user]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name.trim(), avatar_url: avatarUrl },
      });
      if (error) throw error;
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      toast.error("Choose an image smaller than 2 MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("admin-assets").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("admin-assets").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      const { error: profileError } = await supabase.auth.updateUser({
        data: { ...(user.user_metadata ?? {}), avatar_url: data.publicUrl },
      });
      if (profileError) throw profileError;
      toast.success("Avatar uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.email) return;
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const { error: verificationError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });
      if (verificationError) throw new Error("Current password is incorrect");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading profile...</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">My profile</h1>
        <p className="text-sm text-muted-foreground">
          Update the details associated with your admin account.
        </p>
      </div>

      <form onSubmit={saveProfile} className="space-y-5 rounded-lg border bg-card p-6 shadow-card">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile avatar"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <UserCircle className="h-20 w-20 text-muted-foreground" strokeWidth={1} />
          )}
          <div>
            <Label
              htmlFor="avatar"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              <Upload className="h-4 w-4" /> {uploadingAvatar ? "Uploading..." : "Upload avatar"}
            </Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={uploadAvatar}
              disabled={uploadingAvatar}
            />
            <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, or WebP up to 2 MB.</p>
          </div>
        </div>
        <div>
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.email ?? ""} readOnly />
        </div>
        <Button type="submit" disabled={savingProfile || uploadingAvatar}>
          {savingProfile ? "Saving..." : "Save profile"}
        </Button>
      </form>

      <form
        onSubmit={changePassword}
        className="space-y-4 rounded-lg border bg-card p-6 shadow-card"
      >
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <KeyRound className="h-5 w-5" /> Change password
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm your current password before setting a new one.
          </p>
        </div>
        <div>
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="confirm-new-password">Confirm new password</Label>
          <Input
            id="confirm-new-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={changingPassword}>
          {changingPassword ? "Changing..." : "Change password"}
        </Button>
      </form>
    </div>
  );
}
