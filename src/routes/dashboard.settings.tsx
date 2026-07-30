import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings, Loader2, Save, Bell, Palette, Globe, Shield, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

type ProfileSettings = {
  language: string;
  dark_mode: boolean;
};

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese",
  "Italian", "Japanese", "Chinese", "Korean", "Arabic",
];

const WRITING_LEVELS = ["Elementary", "Middle School", "High School", "College", "Professional"];

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="font-display text-xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ProfileSettings>({
    language: "English",
    dark_mode: true,
  });
  const [notifications, setNotifications] = useState({
    generation_complete: true,
    weekly_digest: false,
    product_updates: true,
  });
  const [writingLevel, setWritingLevel] = useState("College");

  const { isLoading } = useQuery({
    queryKey: ["profile-settings", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("language, dark_mode")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setSettings({ language: data.language ?? "English", dark_mode: data.dark_mode ?? true });
      }
      return data;
    },
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          language: settings.language,
          dark_mode: settings.dark_mode,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
      toast.success("Settings saved.");
      qc.invalidateQueries({ queryKey: ["profile-settings"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

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
          <span>Settings</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Preferences</h1>
        <p className="text-muted-foreground">Customize your StoryForge experience.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Appearance */}
        <SettingsSection icon={Palette} title="Appearance">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="text-base">Dark mode</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                StoryForge is designed for the dark. We recommend keeping this on.
              </p>
            </div>
            <Switch
              checked={settings.dark_mode}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, dark_mode: v }))}
            />
          </div>
        </SettingsSection>

        {/* Language */}
        <SettingsSection icon={Globe} title="Language & Content">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Interface language</Label>
              <Select
                value={settings.language}
                onValueChange={(v) => setSettings((s) => ({ ...s, language: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default writing level</Label>
              <Select value={writingLevel} onValueChange={setWritingLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WRITING_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection icon={Bell} title="Notifications">
          {[
            {
              key: "generation_complete" as const,
              label: "Generation complete",
              desc: "Notify when a long generation finishes",
            },
            {
              key: "weekly_digest" as const,
              label: "Weekly digest",
              desc: "A summary of your creative output each week",
            },
            {
              key: "product_updates" as const,
              label: "Product updates",
              desc: "New features, improvements and announcements",
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <Label className="text-sm">{item.label}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={(v) =>
                  setNotifications((n) => ({ ...n, [item.key]: v }))
                }
              />
            </div>
          ))}
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection icon={Shield} title="Privacy & Data">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <div className="font-medium">Analytics</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Anonymous usage data to improve the product
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Public profile</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Show your work in the StoryForge community
                </p>
              </div>
              <Switch />
            </div>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
            <p className="text-sm font-medium text-destructive">Danger zone</p>
            <p className="text-xs text-muted-foreground">
              Deleting your account permanently removes all your stories, characters, and worlds.
              This cannot be undone.
            </p>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" type="button">
              Delete account
            </Button>
          </div>
        </SettingsSection>

        <div className="flex justify-end">
          <Button type="submit" variant="hero" disabled={saving} className="min-w-36">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
