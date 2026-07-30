import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Globe2,
  Loader2,
  Sparkles,
  Wand2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Shield,
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

export const Route = createFileRoute("/dashboard/worlds")({
  component: WorldsPage,
});

type Location = { name: string; description: string };
type Faction = { name: string; description: string; alignment: string };

type WorldRow = {
  id: string;
  name: string;
  type: string | null;
  overview: string | null;
  geography: string | null;
  history: string | null;
  politics: string | null;
  religion: string | null;
  magic_system: string | null;
  technology: string | null;
  economy: string | null;
  climate: string | null;
  population: string | null;
  notable_locations: Location[] | null;
  factions: Faction[] | null;
  status: string;
  created_at: string;
};

const WORLD_TYPES = [
  "Fantasy",
  "Science Fiction",
  "Dystopian",
  "Post-Apocalyptic",
  "Steampunk",
  "Cyberpunk",
  "Historical",
  "Mythological",
  "Contemporary",
  "Horror",
];
const ERAS = [
  "Ancient / Pre-industrial",
  "Medieval",
  "Renaissance",
  "Industrial Revolution",
  "Modern",
  "Near Future",
  "Far Future",
  "Timeless / Mythic",
];
const TONES = ["Epic", "Gritty", "Whimsical", "Dark", "Hopeful", "Mysterious", "Political", "Mythic"];

const ALIGNMENT_COLORS: Record<string, string> = {
  lawful: "text-blue-400",
  neutral: "text-muted-foreground",
  chaotic: "text-orange-400",
  dark: "text-destructive",
  light: "text-gold",
};

function WorldCard({ world }: { world: WorldRow }) {
  const [expanded, setExpanded] = useState(false);
  const locations = (world.notable_locations ?? []) as Location[];
  const factions = (world.factions ?? []) as Faction[];

  return (
    <div className="glass rounded-2xl overflow-hidden transition-all hover:shadow-elegant">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[image:var(--gradient-primary)] shadow-glow shrink-0">
              <Globe2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-xl">{world.name}</h3>
              <p className="text-xs text-muted-foreground">
                {world.type ?? "World"} · {new Date(world.created_at).toLocaleDateString()}
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
        {world.overview && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{world.overview}</p>
        )}
      </div>

      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-5">
          {[
            { label: "Geography", text: world.geography },
            { label: "History", text: world.history },
            { label: "Politics", text: world.politics },
            { label: "Religion", text: world.religion },
            { label: "Magic System", text: world.magic_system },
            { label: "Technology", text: world.technology },
            { label: "Economy", text: world.economy },
            { label: "Climate", text: world.climate },
            { label: "Population", text: world.population },
          ]
            .filter((s) => s.text)
            .map((s) => (
              <div key={s.label}>
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
                <p className="text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}

          {locations.length > 0 && (
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Notable Locations
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {locations.map((loc) => (
                  <div key={loc.name} className="glass rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-gold" />
                      <span className="font-medium text-sm">{loc.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{loc.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {factions.length > 0 && (
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Factions
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {factions.map((fac) => (
                  <div key={fac.name} className="glass rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-3.5 w-3.5 text-accent" />
                      <span className="font-medium text-sm">{fac.name}</span>
                      <Badge
                        variant="secondary"
                        className={`ml-auto text-xs capitalize ${ALIGNMENT_COLORS[fac.alignment] ?? ""}`}
                      >
                        {fac.alignment}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{fac.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorldsPage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    prompt: "",
    type: "Fantasy",
    era: "Medieval",
    tone: "Epic",
  });

  const { data: worlds, isLoading } = useQuery({
    queryKey: ["worlds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worlds")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WorldRow[];
    },
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (form.prompt.trim().length < 10) {
      toast.error("Describe your world concept (at least 10 characters).");
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
      const res = await fetch("/api/generate-world", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      toast.success(`${json.world?.name ?? "World"} has been forged!`);
      qc.invalidateQueries({ queryKey: ["worlds"] });
      setForm({ prompt: "", type: "Fantasy", era: "Medieval", tone: "Epic" });
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
          <span>World Builder</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Build a world</h1>
        <p className="text-muted-foreground">
          Describe your vision and StoryForge will design a complete world — geography, history,
          politics, factions, magic, and more.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="glass grid gap-5 rounded-2xl p-6 md:grid-cols-3">
        <div className="md:col-span-3 space-y-2">
          <Label htmlFor="world-prompt">World concept</Label>
          <Textarea
            id="world-prompt"
            rows={3}
            placeholder="A shattered moon orbits a dying sun. The tidal forces have twisted the planet's geography into endless archipelagos ruled by rival sky-pirate empires…"
            value={form.prompt}
            onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
            disabled={generating}
          />
        </div>

        <div className="space-y-2">
          <Label>World Type</Label>
          <Select
            value={form.type}
            onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WORLD_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Era / Tech Level</Label>
          <Select
            value={form.era}
            onValueChange={(v) => setForm((f) => ({ ...f, era: v }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ERAS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
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

        <div className="md:col-span-3 flex justify-end">
          <Button
            type="submit"
            variant="hero"
            size="lg"
            disabled={generating}
            className="min-w-48"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building world…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Generate world
              </>
            )}
          </Button>
        </div>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Your worlds</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !worlds?.length ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Globe2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              No worlds yet. Build your first above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {worlds.map((w) => (
              <WorldCard key={w.id} world={w} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
