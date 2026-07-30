import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Loader2, Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/stories/")({
  component: StoriesPage,
});

type StoryRow = {
  id: string;
  title: string;
  genre: string | null;
  tone: string | null;
  status: string;
  created_at: string;
};

const GENRES = [
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Romance",
  "Thriller",
  "Horror",
  "Historical",
  "Literary",
  "Adventure",
  "Young Adult",
];
const TONES = [
  "Dark & Gritty",
  "Whimsical",
  "Epic & Heroic",
  "Melancholic",
  "Humorous",
  "Suspenseful",
  "Romantic",
  "Philosophical",
];
const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Japanese",
  "Chinese",
];

function StoriesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    prompt: "",
    genre: "Fantasy",
    tone: "Epic & Heroic",
    length: "short" as "short" | "medium" | "long",
    language: "English",
    characters: "",
  });

  const { data: stories, isLoading } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("id, title, genre, tone, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as StoryRow[];
    },
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (form.prompt.trim().length < 10) {
      toast.error("Please describe your story idea (at least 10 characters).");
      return;
    }
    setGenerating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in again.");
        return;
      }
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Generation failed");
      }
      toast.success("Your story is ready!");
      qc.invalidateQueries({ queryKey: ["stories"] });
      navigate({ to: "/dashboard/stories/$storyId", params: { storyId: json.storyId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>AI Story Generator</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Forge a new story</h1>
        <p className="text-muted-foreground">
          Describe your idea. StoryForge will craft an outline and full chapters in your chosen
          language and tone.
        </p>
      </div>

      <form
        onSubmit={handleGenerate}
        className="glass grid gap-5 rounded-2xl p-6 md:grid-cols-2"
      >
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="prompt">Story idea</Label>
          <Textarea
            id="prompt"
            rows={4}
            placeholder="A cartographer in a floating city discovers a map to a continent that shouldn't exist…"
            value={form.prompt}
            onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
            disabled={generating}
          />
        </div>

        <div className="space-y-2">
          <Label>Genre</Label>
          <Select
            value={form.genre}
            onValueChange={(v) => setForm((f) => ({ ...f, genre: v }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tone</Label>
          <Select
            value={form.tone}
            onValueChange={(v) => setForm((f) => ({ ...f, tone: v }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Length</Label>
          <Select
            value={form.length}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, length: v as "short" | "medium" | "long" }))
            }
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short — 3 chapters</SelectItem>
              <SelectItem value="medium">Medium — 5 chapters</SelectItem>
              <SelectItem value="long">Long — 8 chapters</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            value={form.language}
            onValueChange={(v) => setForm((f) => ({ ...f, language: v }))}
            disabled={generating}
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

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="characters">Characters (optional)</Label>
          <Textarea
            id="characters"
            rows={3}
            placeholder="Lira, a reluctant heir with a stormcaller's gift. Vex, her cynical cartographer mentor…"
            value={form.characters}
            onChange={(e) => setForm((f) => ({ ...f, characters: e.target.value }))}
            disabled={generating}
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button
            type="submit"
            variant="hero"
            size="lg"
            disabled={generating}
            className="min-w-48"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Forging…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Generate story
              </>
            )}
          </Button>
        </div>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Your library</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !stories?.length ? (
          <p className="text-sm text-muted-foreground">
            No stories yet. Generate your first above.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {stories.map((s) => (
              <li key={s.id}>
                <Link
                  to="/dashboard/stories/$storyId"
                  params={{ storyId: s.id }}
                  className="glass block rounded-xl p-4 transition hover:border-accent/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <BookOpen className="mt-1 h-5 w-5 text-accent" />
                      <div>
                        <div className="font-medium">{s.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {[s.genre, s.tone].filter(Boolean).join(" · ") || "—"} · {new Date(s.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        s.status === "complete"
                          ? "bg-accent/10 text-accent"
                          : s.status === "failed"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary-foreground"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
