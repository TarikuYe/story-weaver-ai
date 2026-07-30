import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Loader2,
  BookOpen,
  Users,
  Globe2,
  MessageSquare,
  Wand2,
  GitBranch,
  Mic,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/search")({
  component: SearchPage,
});

type SearchResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  link: string;
};

const TYPE_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  story:       { icon: BookOpen,     color: "text-primary",    label: "Story" },
  character:   { icon: Users,        color: "text-accent",     label: "Character" },
  world:       { icon: Globe2,       color: "text-gold",       label: "World" },
  dialogue:    { icon: MessageSquare, color: "text-blue-400",  label: "Dialogue" },
  comic:       { icon: Wand2,        color: "text-purple-400", label: "Comic" },
  interactive: { icon: GitBranch,    color: "text-orange-400", label: "Adventure" },
  audiobook:   { icon: Mic,          color: "text-pink-400",   label: "Audiobook" },
  image:       { icon: ImageIcon,    color: "text-green-400",  label: "Image" },
};

const ALL_TYPES = Object.keys(TYPE_META);

async function runSearch(userId: string, q: string): Promise<SearchResult[]> {
  const like = `%${q}%`;
  const [stories, characters, worlds, dialogues, comics, interactives, audiobooks, images] =
    await Promise.all([
      supabase
        .from("stories")
        .select("id, title, genre")
        .eq("user_id", userId)
        .ilike("title", like)
        .limit(5),
      supabase
        .from("characters")
        .select("id, name, occupation")
        .eq("user_id", userId)
        .ilike("name", like)
        .limit(5),
      supabase
        .from("worlds")
        .select("id, name, type")
        .eq("user_id", userId)
        .ilike("name", like)
        .limit(5),
      supabase
        .from("dialogues")
        .select("id, title, emotion")
        .eq("user_id", userId)
        .ilike("title", like)
        .limit(5),
      supabase
        .from("comic_projects")
        .select("id, title, art_style")
        .eq("user_id", userId)
        .ilike("title", like)
        .limit(5),
      supabase
        .from("interactive_stories")
        .select("id, title, genre")
        .eq("user_id", userId)
        .ilike("title", like)
        .limit(5),
      supabase
        .from("audiobooks")
        .select("id, title, narrator_style")
        .eq("user_id", userId)
        .ilike("title", like)
        .limit(5),
      supabase
        .from("generated_images")
        .select("id, subject, style")
        .eq("user_id", userId)
        .ilike("subject", like)
        .limit(5),
    ]);

  const results: SearchResult[] = [
    ...(stories.data ?? []).map((s) => ({
      id: s.id, type: "story",
      title: s.title,
      subtitle: s.genre ?? "",
      link: `/dashboard/stories/${s.id}`,
    })),
    ...(characters.data ?? []).map((c) => ({
      id: c.id, type: "character",
      title: (c as { name: string }).name,
      subtitle: (c as { occupation: string | null }).occupation ?? "",
      link: "/dashboard/characters",
    })),
    ...(worlds.data ?? []).map((w) => ({
      id: w.id, type: "world",
      title: (w as { name: string }).name,
      subtitle: (w as { type: string | null }).type ?? "",
      link: "/dashboard/worlds",
    })),
    ...(dialogues.data ?? []).map((d) => ({
      id: d.id, type: "dialogue",
      title: (d as { title: string }).title,
      subtitle: (d as { emotion: string | null }).emotion ?? "",
      link: "/dashboard/dialogues",
    })),
    ...(comics.data ?? []).map((c) => ({
      id: c.id, type: "comic",
      title: (c as { title: string }).title,
      subtitle: (c as { art_style: string | null }).art_style ?? "",
      link: "/dashboard/comics",
    })),
    ...(interactives.data ?? []).map((i) => ({
      id: i.id, type: "interactive",
      title: (i as { title: string }).title,
      subtitle: (i as { genre: string | null }).genre ?? "",
      link: "/dashboard/interactive",
    })),
    ...(audiobooks.data ?? []).map((a) => ({
      id: a.id, type: "audiobook",
      title: (a as { title: string }).title,
      subtitle: (a as { narrator_style: string | null }).narrator_style ?? "",
      link: "/dashboard/audiobooks",
    })),
    ...(images.data ?? []).map((img) => ({
      id: img.id, type: "image",
      title: (img as { subject: string }).subject,
      subtitle: (img as { style: string | null }).style ?? "",
      link: "/dashboard/images",
    })),
  ];

  return results;
}

function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || !user?.id) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await runSearch(user.id, query.trim());
        setResults(r);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, user?.id]);

  const filtered = activeType ? results.filter((r) => r.type === activeType) : results;

  const countByType = Object.fromEntries(
    ALL_TYPES.map((t) => [t, results.filter((r) => r.type === t).length]),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-10">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          className="h-14 pl-12 pr-12 text-base rounded-2xl glass border-white/10 focus-visible:ring-primary"
          placeholder="Search stories, characters, worlds…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Type filter chips */}
      {results.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveType(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeType === null
                ? "bg-primary text-primary-foreground"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({results.length})
          </button>
          {ALL_TYPES.filter((t) => countByType[t] > 0).map((t) => {
            const meta = TYPE_META[t];
            return (
              <button
                key={t}
                onClick={() => setActiveType(activeType === t ? null : t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeType === t
                    ? "bg-primary/20 text-primary"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                <meta.icon className={`h-3 w-3 ${meta.color}`} />
                {meta.label} ({countByType[t]})
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Searching…
        </div>
      ) : query && !results.length ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 font-display text-xl">No results for "{query}"</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different term or browse a module directly.
          </p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((item) => {
            const meta = TYPE_META[item.type];
            if (!meta) return null;
            return (
              <Link
                key={`${item.type}-${item.id}`}
                to={item.link}
                className="glass flex items-center gap-3 rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-elegant transition-all"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
                  <meta.icon className={`h-4 w-4 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.subtitle ? `${meta.label} · ${item.subtitle}` : meta.label}
                  </div>
                </div>
                <Badge variant="secondary" className={`text-xs shrink-0 ${meta.color}`}>
                  {meta.label}
                </Badge>
              </Link>
            );
          })}
        </div>
      ) : !query ? (
        /* Empty state — show quick-access shortcuts */
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Quick access</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(TYPE_META).map(([type, meta]) => (
              <Link
                key={type}
                to={`/dashboard/${type === "story" ? "stories" : type === "image" ? "images" : type === "comic" ? "comics" : type === "interactive" ? "interactive" : type + "s"}`}
                className="glass flex items-center gap-3 rounded-xl p-4 hover:shadow-elegant transition-all"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
                  <meta.icon className={`h-4 w-4 ${meta.color}`} />
                </div>
                <span className="font-medium">{meta.label}s</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
