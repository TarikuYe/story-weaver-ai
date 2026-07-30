import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  Loader2,
  Sparkles,
  BookOpen,
  Users,
  Globe2,
  MessageSquare,
  Wand2,
  GitBranch,
  Mic,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/favorites")({
  component: FavoritesPage,
});

type FavoriteRow = {
  id: string;
  item_type: string;
  item_id: string;
  created_at: string;
};

type StoryRow = { id: string; title: string; genre: string | null; status: string };
type CharacterRow = { id: string; name: string; occupation: string | null };
type WorldRow = { id: string; name: string; type: string | null };

const TYPE_META: Record<
  string,
  { label: string; icon: React.ElementType; color: string; to: string }
> = {
  story: { label: "Story", icon: BookOpen, color: "text-primary", to: "/dashboard/stories" },
  character: { label: "Character", icon: Users, color: "text-accent", to: "/dashboard/characters" },
  world: { label: "World", icon: Globe2, color: "text-gold", to: "/dashboard/worlds" },
  dialogue: { label: "Dialogue", icon: MessageSquare, color: "text-blue-400", to: "/dashboard/dialogues" },
  comic: { label: "Comic", icon: Wand2, color: "text-purple-400", to: "/dashboard/comics" },
  interactive: { label: "Adventure", icon: GitBranch, color: "text-orange-400", to: "/dashboard/interactive" },
  audiobook: { label: "Audiobook", icon: Mic, color: "text-pink-400", to: "/dashboard/audiobooks" },
};

function FavoritesPage() {
  const { user } = useAuth();

  // Fetch favorites list
  const { data: favorites, isLoading: loadingFavs } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FavoriteRow[];
    },
  });

  // Fetch stories for story favorites
  const storyIds = favorites?.filter((f) => f.item_type === "story").map((f) => f.item_id) ?? [];
  const { data: stories } = useQuery({
    queryKey: ["fav-stories", storyIds],
    enabled: storyIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("id, title, genre, status")
        .in("id", storyIds);
      if (error) throw error;
      return data as StoryRow[];
    },
  });

  // Fetch characters for character favorites
  const charIds = favorites?.filter((f) => f.item_type === "character").map((f) => f.item_id) ?? [];
  const { data: characters } = useQuery({
    queryKey: ["fav-characters", charIds],
    enabled: charIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("id, name, occupation")
        .in("id", charIds);
      if (error) throw error;
      return data as CharacterRow[];
    },
  });

  // Fetch worlds for world favorites
  const worldIds = favorites?.filter((f) => f.item_type === "world").map((f) => f.item_id) ?? [];
  const { data: worlds } = useQuery({
    queryKey: ["fav-worlds", worldIds],
    enabled: worldIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worlds")
        .select("id, name, type")
        .in("id", worldIds);
      if (error) throw error;
      return data as WorldRow[];
    },
  });

  function getItemName(fav: FavoriteRow): string {
    if (fav.item_type === "story") {
      return stories?.find((s) => s.id === fav.item_id)?.title ?? "Story";
    }
    if (fav.item_type === "character") {
      return characters?.find((c) => c.id === fav.item_id)?.name ?? "Character";
    }
    if (fav.item_type === "world") {
      return worlds?.find((w) => w.id === fav.item_id)?.name ?? "World";
    }
    return fav.item_type;
  }

  function getItemSubtitle(fav: FavoriteRow): string {
    if (fav.item_type === "story") {
      const s = stories?.find((s) => s.id === fav.item_id);
      return s?.genre ?? "";
    }
    if (fav.item_type === "character") {
      const c = characters?.find((c) => c.id === fav.item_id);
      return c?.occupation ?? "";
    }
    if (fav.item_type === "world") {
      const w = worlds?.find((w) => w.id === fav.item_id);
      return w?.type ?? "";
    }
    return "";
  }

  function getLink(fav: FavoriteRow): string {
    if (fav.item_type === "story") return `/dashboard/stories/${fav.item_id}`;
    return TYPE_META[fav.item_type]?.to ?? "/dashboard";
  }

  // Group favorites by type
  const grouped = Object.entries(
    (favorites ?? []).reduce<Record<string, FavoriteRow[]>>((acc, fav) => {
      const t = fav.item_type;
      if (!acc[t]) acc[t] = [];
      acc[t].push(fav);
      return acc;
    }, {}),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Favorites</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Your favorites</h1>
        <p className="text-muted-foreground">
          Stories, characters, and worlds you've starred for quick access.
        </p>
      </div>

      {loadingFavs ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : !favorites?.length ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Star className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h2 className="mt-4 font-display text-2xl">Nothing starred yet</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Star your favorite stories, characters, worlds and more to find them here instantly.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {Object.entries(TYPE_META)
              .slice(0, 4)
              .map(([key, meta]) => (
                <Link
                  key={key}
                  to={meta.to}
                  className="glass rounded-xl px-4 py-2 text-sm flex items-center gap-2 hover:shadow-elegant transition-all"
                >
                  <meta.icon className={`h-4 w-4 ${meta.color}`} />
                  {meta.label}s
                </Link>
              ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([type, items]) => {
            const meta = TYPE_META[type];
            if (!meta) return null;
            return (
              <section key={type}>
                <div className="mb-3 flex items-center gap-2">
                  <meta.icon className={`h-4 w-4 ${meta.color}`} />
                  <h2 className="font-display text-xl">{meta.label}s</h2>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {items.length}
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((fav) => (
                    <Link
                      key={fav.id}
                      to={getLink(fav)}
                      className="glass rounded-xl p-4 flex items-start gap-3 hover:-translate-y-0.5 hover:shadow-elegant transition-all"
                    >
                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10`}
                      >
                        <meta.icon className={`h-4 w-4 ${meta.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{getItemName(fav)}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {getItemSubtitle(fav) || meta.label}
                        </div>
                      </div>
                      <Star className="ml-auto h-4 w-4 text-gold shrink-0 fill-gold" />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
