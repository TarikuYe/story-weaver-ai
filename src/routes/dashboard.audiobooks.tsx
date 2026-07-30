import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Mic,
  Loader2,
  Sparkles,
  Wand2,
  ChevronDown,
  ChevronUp,
  Volume2,
  Clock,
  Music,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/audiobooks")({
  component: AudiobooksPage,
});

type ChapterAudio = {
  chapter_number: number;
  title: string;
  narration_script: string;
  sound_design_notes: string;
  estimated_minutes: number;
  audio_url?: string;
};

type AudiobookRow = {
  id: string;
  title: string;
  narrator_style: string | null;
  chapters_audio: ChapterAudio[] | null;
  prompt: string;
  status: string;
  created_at: string;
};

const NARRATOR_STYLES = [
  { value: "dramatic", label: "Dramatic", desc: "Deep, theatrical, commanding" },
  { value: "warm", label: "Warm & Intimate", desc: "Gentle, cozy, inviting" },
  { value: "journalistic", label: "Journalistic", desc: "Crisp, measured, authoritative" },
  { value: "whimsical", label: "Whimsical", desc: "Playful, expressive, light" },
  { value: "dark", label: "Dark & Hushed", desc: "Slow-burn, intense, brooding" },
];

const CHAPTER_COUNTS = [1, 2, 3, 4, 5];

function AudiobookCard({ book }: { book: AudiobookRow }) {
  const [expanded, setExpanded] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const chapters = (book.chapters_audio ?? []) as ChapterAudio[];
  const totalMinutes = chapters.reduce((s, c) => s + (c.estimated_minutes ?? 0), 0);

  return (
    <div className="glass rounded-2xl overflow-hidden transition-all hover:shadow-elegant">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[image:var(--gradient-primary)] shadow-glow shrink-0">
              <Mic className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-xl">{book.title}</h3>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  {book.narrator_style}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{totalMinutes} min
                </span>
                <span>{chapters.length} chapters</span>
              </div>
            </div>
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

      {expanded && chapters.length > 0 && (
        <div className="border-t border-white/5">
          {/* Chapter tabs */}
          <div className="flex gap-1 overflow-x-auto px-5 pt-4 pb-0">
            {chapters.map((ch, i) => (
              <button
                key={ch.chapter_number}
                onClick={() => setActiveChapter(i)}
                className={`shrink-0 rounded-t-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeChapter === i
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Ch. {ch.chapter_number}
              </button>
            ))}
          </div>

          {/* Active chapter */}
          {(() => {
            const ch = chapters[activeChapter];
            if (!ch) return null;
            return (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-display text-lg">{ch.title}</h4>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    ~{ch.estimated_minutes} min
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Narration Script
                  </p>
                  <div className="max-h-64 overflow-y-auto rounded-xl bg-background/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {ch.narration_script}
                  </div>
                </div>

                {ch.audio_url && (
                  <div className="pt-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Volume2 className="h-3.5 w-3.5 text-accent" /> Listen to Chapter
                    </p>
                    <audio controls className="w-full h-10 rounded-lg outline-none" src={ch.audio_url} />
                  </div>
                )}

                {ch.sound_design_notes && (
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      <Music className="h-3.5 w-3.5 text-gold" /> Sound Design Notes
                    </div>
                    <p className="text-sm text-muted-foreground">{ch.sound_design_notes}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function AudiobooksPage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    prompt: "",
    narrator_style: "dramatic",
    chapter_count: 2,
    tone: "",
  });

  const { data: audiobooks, isLoading } = useQuery({
    queryKey: ["audiobooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audiobooks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AudiobookRow[];
    },
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (form.prompt.trim().length < 10) {
      toast.error("Describe your audiobook concept (at least 10 characters).");
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
      const res = await fetch("/api/generate-audiobook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      toast.success(`"${json.audiobook?.title ?? "Audiobook"}" is ready!`);
      qc.invalidateQueries({ queryKey: ["audiobooks"] });
      setForm({ prompt: "", narrator_style: "dramatic", chapter_count: 2, tone: "" });
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
          <span>Audiobook Studio</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Create an audiobook</h1>
        <p className="text-muted-foreground">
          Generate narration scripts with pacing markers, voice direction, and ambient sound
          design notes — ready for studio recording.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="glass grid gap-5 rounded-2xl p-6 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="audio-prompt">Story concept</Label>
          <Textarea
            id="audio-prompt"
            rows={3}
            placeholder="A lighthouse keeper on a remote island begins receiving Morse code messages from ships that sank fifty years ago…"
            value={form.prompt}
            onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
            disabled={generating}
          />
        </div>

        <div className="space-y-2">
          <Label>Narrator Style</Label>
          <Select
            value={form.narrator_style}
            onValueChange={(v) => setForm((f) => ({ ...f, narrator_style: v }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NARRATOR_STYLES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div>
                    <div>{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Chapters</Label>
          <Select
            value={String(form.chapter_count)}
            onValueChange={(v) => setForm((f) => ({ ...f, chapter_count: Number(v) }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHAPTER_COUNTS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} chapter{n > 1 ? "s" : ""}
                </SelectItem>
              ))}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing script…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Generate audiobook
              </>
            )}
          </Button>
        </div>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Your audiobooks</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !audiobooks?.length ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Mic className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              No audiobooks yet. Create your first above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {audiobooks.map((b) => (
              <AudiobookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
