import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wand2, Loader2, Sparkles, ChevronDown, ChevronUp, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/comics")({
  component: ComicsPage,
});

type Panel = {
  panel_number: number;
  camera_angle: string;
  setting: string;
  characters_in_panel: string;
  action: string;
  dialogue: { speaker: string; text: string }[];
  narration?: string;
  mood: string;
  image_prompt: string;
};

type ComicRow = {
  id: string;
  title: string;
  art_style: string | null;
  panel_count: number;
  panels: Panel[] | null;
  prompt: string;
  status: string;
  created_at: string;
};

const ART_STYLES = [
  "Manga",
  "American comics",
  "European BD",
  "Webcomic",
  "Noir / Black & White",
  "Superhero",
  "Chibi / Kawaii",
  "Indie / Graphic novel",
];

const MOOD_COLORS: Record<string, string> = {
  tense: "text-orange-400",
  joyful: "text-yellow-400",
  mysterious: "text-purple-400",
  sad: "text-blue-400",
  action: "text-red-400",
  romantic: "text-pink-400",
  dramatic: "text-primary",
};

function ComicCard({ comic }: { comic: ComicRow }) {
  const [expanded, setExpanded] = useState(false);
  const panels = (comic.panels ?? []) as Panel[];

  return (
    <div className="glass rounded-2xl overflow-hidden transition-all hover:shadow-elegant">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl">{comic.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {comic.art_style} · {comic.panel_count} panels ·{" "}
              {new Date(comic.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && panels.length > 0 && (
        <div className="border-t border-white/5 p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {panels.map((panel) => (
              <div key={panel.panel_number} className="glass rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg text-gradient-primary">
                    Panel {panel.panel_number}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs capitalize ${MOOD_COLORS[panel.mood.toLowerCase()] ?? ""}`}
                    >
                      {panel.mood}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Camera className="h-3 w-3" />
                  <span className="capitalize">{panel.camera_angle}</span>
                  <span className="mx-1">·</span>
                  <span>{panel.setting}</span>
                </div>

                <p className="text-sm">{panel.action}</p>

                {panel.narration && (
                  <div className="rounded-lg border border-white/10 bg-background/30 p-2 text-xs italic text-muted-foreground">
                    {panel.narration}
                  </div>
                )}

                {panel.dialogue.length > 0 && (
                  <div className="space-y-1.5">
                    {panel.dialogue.map((line, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="font-semibold text-accent shrink-0">{line.speaker}:</span>
                        <span className="text-muted-foreground">"{line.text}"</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-lg bg-primary/5 border border-primary/10 p-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-primary font-medium">Image: </span>
                    {panel.image_prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComicsPage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [panelCount, setPanelCount] = useState([6]);
  const [form, setForm] = useState({
    prompt: "",
    art_style: "Manga",
    characters: "",
  });

  const { data: comics, isLoading } = useQuery({
    queryKey: ["comic-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comic_projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ComicRow[];
    },
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (form.prompt.trim().length < 10) {
      toast.error("Describe the story to adapt (at least 10 characters).");
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
      const res = await fetch("/api/generate-comic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...form,
          panel_count: panelCount[0],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      toast.success(`${json.comic?.title ?? "Comic"} is ready!`);
      qc.invalidateQueries({ queryKey: ["comic-projects"] });
      setForm({ prompt: "", art_style: "Manga", characters: "" });
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
          <span>Comic Generator</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Create a comic</h1>
        <p className="text-muted-foreground">
          Turn any story concept into a full comic script — panels, camera angles, dialogue bubbles,
          and image prompts.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="glass grid gap-5 rounded-2xl p-6 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="comic-prompt">Story concept</Label>
          <Textarea
            id="comic-prompt"
            rows={3}
            placeholder="A street mechanic discovers her scrap-heap robot is actually a sleeping war machine from an extinct civilization…"
            value={form.prompt}
            onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
            disabled={generating}
          />
        </div>

        <div className="space-y-2">
          <Label>Art Style</Label>
          <Select
            value={form.art_style}
            onValueChange={(v) => setForm((f) => ({ ...f, art_style: v }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ART_STYLES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>
            Panel Count:{" "}
            <span className="text-primary font-semibold">{panelCount[0]}</span>
          </Label>
          <Slider
            min={4}
            max={12}
            step={2}
            value={panelCount}
            onValueChange={setPanelCount}
            disabled={generating}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>12</span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="comic-characters">Characters (optional)</Label>
          <Textarea
            id="comic-characters"
            rows={2}
            placeholder="Maya — 19, grease-stained overalls, determined. AXIOM — the ancient war robot, looming but gentle."
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scripting…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Generate comic
              </>
            )}
          </Button>
        </div>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Your comics</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !comics?.length ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Wand2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              No comics yet. Script your first above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comics.map((c) => (
              <ComicCard key={c.id} comic={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
