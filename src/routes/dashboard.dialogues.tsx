import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Loader2, Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/dialogues")({
  component: DialoguesPage,
});

type DialogueRow = {
  id: string;
  title: string;
  characters_involved: string | null;
  emotion: string | null;
  setting: string | null;
  content: string | null;
  status: string;
  created_at: string;
};

const EMOTIONS = [
  "Neutral",
  "Happy / Joyful",
  "Sad / Melancholic",
  "Romantic / Tender",
  "Funny / Comedic",
  "Angry / Heated",
  "Suspenseful / Tense",
  "Fearful / Anxious",
  "Mysterious",
  "Sarcastic",
];
const LENGTHS = ["short", "medium", "long"];

function DialogueCard({ dialogue }: { dialogue: DialogueRow }) {
  return (
    <div className="glass rounded-2xl p-5 transition-all hover:shadow-elegant">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">{dialogue.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {[
              dialogue.characters_involved,
              dialogue.emotion,
              new Date(dialogue.created_at).toLocaleDateString(),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>
      {dialogue.content && (
        <div className="mt-4 max-h-64 overflow-y-auto rounded-xl bg-background/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {dialogue.content}
        </div>
      )}
    </div>
  );
}

function DialoguesPage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    prompt: "",
    characters: "",
    emotion: "Neutral",
    setting: "",
    length: "medium" as "short" | "medium" | "long",
  });

  const { data: dialogues, isLoading } = useQuery({
    queryKey: ["dialogues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dialogues")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DialogueRow[];
    },
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (form.prompt.trim().length < 10) {
      toast.error("Describe the scenario (at least 10 characters).");
      return;
    }
    if (form.characters.trim().length < 2) {
      toast.error("List the characters involved (at least 2 characters).");
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
      const res = await fetch("/api/generate-dialogue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      toast.success("Dialogue scene ready!");
      qc.invalidateQueries({ queryKey: ["dialogues"] });
      setForm({
        prompt: "",
        characters: "",
        emotion: "Neutral",
        setting: "",
        length: "medium",
      });
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
          <span>Dialogue Generator</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Write a scene</h1>
        <p className="text-muted-foreground">
          Describe the scenario and emotion. StoryForge will craft natural, character-driven
          dialogue with action beats.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="glass grid gap-5 rounded-2xl p-6 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="dialogue-prompt">Scenario</Label>
          <Textarea
            id="dialogue-prompt"
            rows={3}
            placeholder="Two bounty hunters cornered in a burning tavern, forced to decide who escapes with the artifact and who stays behind…"
            value={form.prompt}
            onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
            disabled={generating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="characters">Characters (comma-separated)</Label>
          <Input
            id="characters"
            placeholder="Kael, Riva"
            value={form.characters}
            onChange={(e) => setForm((f) => ({ ...f, characters: e.target.value }))}
            disabled={generating}
          />
        </div>

        <div className="space-y-2">
          <Label>Emotional Tone</Label>
          <Select
            value={form.emotion}
            onValueChange={(v) => setForm((f) => ({ ...f, emotion: v }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMOTIONS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="setting">Setting (optional)</Label>
          <Input
            id="setting"
            placeholder="Inside a burning tavern, smoke filling the room"
            value={form.setting}
            onChange={(e) => setForm((f) => ({ ...f, setting: e.target.value }))}
            disabled={generating}
          />
        </div>

        <div className="space-y-2">
          <Label>Length</Label>
          <Select
            value={form.length}
            onValueChange={(v) => setForm((f) => ({ ...f, length: v as typeof form.length }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short (6–10 exchanges)</SelectItem>
              <SelectItem value="medium">Medium (12–18 exchanges)</SelectItem>
              <SelectItem value="long">Long (20–30 exchanges)</SelectItem>
            </SelectContent>
          </Select>
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing dialogue…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Generate dialogue
              </>
            )}
          </Button>
        </div>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Your scenes</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !dialogues?.length ? (
          <div className="glass rounded-2xl p-10 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              No dialogue scenes yet. Write your first above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dialogues.map((d) => (
              <DialogueCard key={d.id} dialogue={d} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
