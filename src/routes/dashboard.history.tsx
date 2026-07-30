import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Loader2,
  Sparkles,
  BookOpen,
  Users,
  Globe2,
  MessageSquare,
  Wand2,
  GitBranch,
  Mic,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/history")({
  component: HistoryPage,
});

type HistoryItem = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  status: string;
  created_at: string;
  link: string;
};

const TYPE_META: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  story:       { icon: BookOpen,    color: "text-primary",      label: "Story" },
  character:   { icon: Users,       color: "text-accent",       label: "Character" },
  world:       { icon: Globe2,      color: "text-gold",         label: "World" },
  dialogue:    { icon: MessageSquare, color: "text-blue-400",   label: "Dialogue" },
  comic:       { icon: Wand2,       color: "text-purple-400",   label: "Comic" },
  interactive: { icon: GitBranch,   color: "text-orange-400",   label: "Adventure" },
  audiobook:   { icon: Mic,         color: "text-pink-400",     label: "Audiobook" },
  image:       { icon: ImageIcon,   color: "text-green-400",    label: "Image" },
};

function groupByDate(items: HistoryItem[]): [string, HistoryItem[]][] {
  const groups: Record<string, HistoryItem[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  for (const item of items) {
    const d = new Date(item.created_at);
    d.setHours(0, 0, 0, 0);
    let label: string;
    if (d.getTime() === today.getTime()) label = "Today";
    else if (d.getTime() === yesterday.getTime()) label = "Yesterday";
    else
      label = d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return Object.entries(groups);
}

function HistoryPage() {
  const { user } = useAuth();

  const { data: items, isLoading } = useQuery({
    queryKey: ["history", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Fetch all content types in parallel
      const [stories, characters, worlds, dialogues, comics, interactives, audiobooks, images] =
        await Promise.all([
          supabase
            .from("stories")
            .select("id, title, genre, status, created_at")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("characters")
            .select("id, name, occupation, status, created_at")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("worlds")
            .select("id, name, type, status, created_at")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("dialogues")
            .select("id, title, emotion, status, created_at")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("comic_projects")
            .select("id, title, art_style, status, created_at")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("interactive_stories")
            .select("id, title, genre, status, created_at")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("audiobooks")
            .select("id, title, narrator_style, status, created_at")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("generated_images")
            .select("id, subject, style, status, created_at")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

      const all: HistoryItem[] = [
        ...(stories.data ?? []).map((s) => ({
          id: s.id,
          type: "story",
          title: s.title,
          subtitle: s.genre ?? "",
          status: s.status,
          created_at: s.created_at,
          link: `/dashboard/stories/${s.id}`,
        })),
        ...(characters.data ?? []).map((c) => ({
          id: c.id,
          type: "character",
          title: (c as { name: string }).name,
          subtitle: (c as { occupation: string | null }).occupation ?? "",
          status: c.status,
          created_at: c.created_at,
          link: "/dashboard/characters",
        })),
        ...(worlds.data ?? []).map((w) => ({
          id: w.id,
          type: "world",
          title: (w as { name: string }).name,
          subtitle: (w as { type: string | null }).type ?? "",
          status: w.status,
          created_at: w.created_at,
          link: "/dashboard/worlds",
        })),
        ...(dialogues.data ?? []).map((d) => ({
          id: d.id,
          type: "dialogue",
          title: (d as { title: string }).title,
          subtitle: (d as { emotion: string | null }).emotion ?? "",
          status: d.status,
          created_at: d.created_at,
          link: "/dashboard/dialogues",
        })),
        ...(comics.data ?? []).map((c) => ({
          id: c.id,
          type: "comic",
          title: (c as { title: string }).title,
          subtitle: (c as { art_style: string | null }).art_style ?? "",
          status: c.status,
          created_at: c.created_at,
          link: "/dashboard/comics",
        })),
        ...(interactives.data ?? []).map((i) => ({
          id: i.id,
          type: "interactive",
          title: (i as { title: string }).title,
          subtitle: (i as { genre: string | null }).genre ?? "",
          status: i.status,
          created_at: i.created_at,
          link: "/dashboard/interactive",
        })),
        ...(audiobooks.data ?? []).map((a) => ({
          id: a.id,
          type: "audiobook",
          title: (a as { title: string }).title,
          subtitle: (a as { narrator_style: string | null }).narrator_style ?? "",
          status: a.status,
          created_at: a.created_at,
          link: "/dashboard/audiobooks",
        })),
        ...(images.data ?? []).map((img) => ({
          id: img.id,
          type: "image",
          title: (img as { subject: string }).subject,
          subtitle: (img as { style: string | null }).style ?? "",
          status: img.status,
          created_at: img.created_at,
          link: "/dashboard/images",
        })),
      ];

      // Sort all by date desc
      all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return all;
    },
  });

  const grouped = groupByDate(items ?? []);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>History</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Creation history</h1>
        <p className="text-muted-foreground">
          Everything you've generated — stories, characters, worlds, and more.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : !items?.length ? (
        <div className="glass rounded-2xl p-12 text-center">
          <History className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h2 className="mt-4 font-display text-2xl">Nothing yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your generated content will appear here as you create.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([label, groupItems]) => (
            <section key={label}>
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">{label}</span>
                <span>·</span>
                <span>{groupItems.length} item{groupItems.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-2">
                {groupItems.map((item) => {
                  const meta = TYPE_META[item.type];
                  if (!meta) return null;
                  return (
                    <Link
                      key={item.id}
                      to={item.link}
                      className="glass flex items-center gap-3 rounded-xl p-3.5 hover:-translate-y-0.5 hover:shadow-elegant transition-all"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
                        <meta.icon className={`h-4 w-4 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {meta.label}
                          {item.subtitle ? ` · ${item.subtitle}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="secondary"
                          className={`text-xs capitalize ${
                            item.status === "complete"
                              ? "text-primary"
                              : item.status === "failed"
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
