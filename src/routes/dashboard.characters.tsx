import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Loader2,
  Sparkles,
  Wand2,
  ChevronDown,
  ChevronUp,
  User,
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

export const Route = createFileRoute("/dashboard/characters")({
  component: CharactersPage,
});

type CharacterRow = {
  id: string;
  name: string;
  occupation: string | null;
  genre: string | null;
  appearance: string | null;
  backstory: string | null;
  personality: string | null;
  strengths: string | null;
  weaknesses: string | null;
  skills: string | null;
  goals: string | null;
  relationships: string | null;
  clothing: string | null;
  voice_style: string | null;
  age: string | null;
  status: string;
  created_at: string;
};

const GENRES = ["Fantasy", "Science Fiction", "Mystery", "Romance", "Thriller", "Horror", "Historical", "Adventure"];
const ARCHETYPES = ["Hero", "Mentor", "Trickster", "Villain", "Outcast", "Guardian", "Seeker", "Shadow"];
const ROLES = ["Protagonist", "Antagonist", "Mentor", "Sidekick", "Love Interest", "Anti-hero", "Foil", "Support"];

function CharacterCard({ char }: { char: CharacterRow }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass rounded-2xl overflow-hidden transition-all hover:shadow-elegant">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[image:var(--gradient-primary)] shadow-glow shrink-0">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-xl">{char.name}</h3>
              <p className="text-xs text-muted-foreground">
                {[char.age, char.occupation, char.genre].filter(Boolean).join(" · ")}
              </p>
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

        {char.appearance && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{char.appearance}</p>
        )}
      </div>

      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-4">
          {char.backstory && (
            <Section label="Backstory" text={char.backstory} />
          )}
          {char.personality && (
            <Section label="Personality" text={char.personality} />
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {char.strengths && <TagSection label="Strengths" items={char.strengths.split(",").map(s => s.trim())} color="text-primary" />}
            {char.weaknesses && <TagSection label="Weaknesses" items={char.weaknesses.split(",").map(s => s.trim())} color="text-destructive" />}
            {char.skills && <TagSection label="Skills" items={char.skills.split(",").map(s => s.trim())} color="text-gold" />}
          </div>
          {char.goals && <Section label="Goals" text={char.goals} />}
          {char.relationships && <Section label="Relationships" text={char.relationships} />}
          {char.clothing && <Section label="Clothing" text={char.clothing} />}
          {char.voice_style && <Section label="Voice" text={char.voice_style} />}
        </div>
      )}
    </div>
  );
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function TagSection({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className={`text-xs ${color}`}>{item}</Badge>
        ))}
      </div>
    </div>
  );
}

function CharactersPage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    prompt: "",
    genre: "Fantasy",
    archetype: "Hero",
    role: "Protagonist",
  });

  const { data: characters, isLoading } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CharacterRow[];
    },
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (form.prompt.trim().length < 10) {
      toast.error("Describe your character (at least 10 characters).");
      return;
    }
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in again."); return; }

      const res = await fetch("/api/generate-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");

      toast.success(`${json.character?.name ?? "Character"} has been forged!`);
      qc.invalidateQueries({ queryKey: ["characters"] });
      setForm({ prompt: "", genre: "Fantasy", archetype: "Hero", role: "Protagonist" });
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
          <span>Character Studio</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Forge a character</h1>
        <p className="text-muted-foreground">
          Describe who you want, and StoryForge will build a deep, consistent character — backstory, traits, voice, and all.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="glass grid gap-5 rounded-2xl p-6 md:grid-cols-3">
        <div className="md:col-span-3 space-y-2">
          <Label htmlFor="char-prompt">Describe your character</Label>
          <Textarea
            id="char-prompt"
            rows={3}
            placeholder="A disgraced knight who secretly practices forbidden magic to protect the village that exiled her…"
            value={form.prompt}
            onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
            disabled={generating}
          />
        </div>

        <div className="space-y-2">
          <Label>Genre</Label>
          <Select value={form.genre} onValueChange={(v) => setForm((f) => ({ ...f, genre: v }))} disabled={generating}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Archetype</Label>
          <Select value={form.archetype} onValueChange={(v) => setForm((f) => ({ ...f, archetype: v }))} disabled={generating}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ARCHETYPES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Story Role</Label>
          <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))} disabled={generating}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3 flex justify-end">
          <Button type="submit" variant="hero" size="lg" disabled={generating} className="min-w-48">
            {generating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Forging character…</>
            ) : (
              <><Wand2 className="mr-2 h-4 w-4" /> Generate character</>
            )}
          </Button>
        </div>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Your cast</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !characters?.length ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">No characters yet. Create your first above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {characters.map((char) => (
              <CharacterCard key={char.id} char={char} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
