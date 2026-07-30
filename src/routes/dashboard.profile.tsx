import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Camera, Loader2, Save, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  credits: number;
  subscription: string;
  language: string;
  created_at: string;
};

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    username: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? "",
        username: profile.username ?? "",
      });
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          display_name: form.display_name.trim() || null,
          username: form.username.trim() || null,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
      toast.success("Profile updated.");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const initials = (form.display_name || user?.email || "S").slice(0, 2).toUpperCase();
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Profile</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Your profile</h1>
        <p className="text-muted-foreground">Manage your public identity and account info.</p>
      </div>

      {/* Avatar + stats banner */}
      <div className="glass-strong relative overflow-hidden rounded-2xl p-8 shadow-elegant">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-40" />
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-2 ring-primary/40 ring-offset-2 ring-offset-background">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[image:var(--gradient-primary)] text-primary-foreground text-2xl font-display">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-primary shadow-glow hover:opacity-90 transition-opacity"
              aria-label="Change avatar"
              title="Avatar upload coming soon"
            >
              <Camera className="h-3.5 w-3.5 text-primary-foreground" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="font-display text-2xl">
              {profile?.display_name ?? user?.email?.split("@")[0] ?? "Storyteller"}
            </h2>
            {profile?.username && (
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Member since {memberSince}</p>
          </div>
          <div className="ml-auto flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
            <div className="text-center">
              <div className="font-display text-3xl text-gradient">
                {profile?.credits?.toLocaleString() ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">Credits</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl capitalize text-gold">
                {profile?.subscription ?? "Free"}
              </div>
              <div className="text-xs text-muted-foreground">Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="glass rounded-2xl p-6 space-y-5">
        <h2 className="font-display text-xl">Edit details</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              placeholder="Elena the Storyteller"
              value={form.display_name}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="elena_writes"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                }))
              }
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Letters, numbers and underscores only.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled className="opacity-60" />
          <p className="text-xs text-muted-foreground">
            Email changes are handled through your account security settings.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="hero" disabled={saving} className="min-w-36">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Account info */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-xl">Account</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            { label: "User ID", value: user?.id?.slice(0, 8) + "…" },
            { label: "Auth provider", value: user?.app_metadata?.provider ?? "email" },
            { label: "Email verified", value: user?.email_confirmed_at ? "Yes" : "Pending" },
            { label: "Language", value: profile?.language ?? "English" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between gap-2 py-2 border-b border-white/5">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium capitalize">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
