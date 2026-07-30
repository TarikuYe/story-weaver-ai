import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GitBranch,
  Loader2,
  Sparkles,
  Wand2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Trophy,
  Skull,
  Heart,
  Zap,
  Circle,
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

export const Route = createFileRoute("/dashboard/interactive")({
  component: InteractivePage,
});

type StoryNode = {
  id: string;
  title: string;
  content: string;
  choices: { text: string; leads_to: string }[];
  is_ending: boolean;
  ending_type?: string;
};

type InteractiveRow = {
  id: string;
  title: string;
  genre: string | null;
  prompt: string;
  opening: string | null;
  nodes: StoryNode[] | null;
  status: string;
  created_at: string;
};

const GENRES = [
  "Adventure",
  "Fantasy",
  "Science Fiction",
  "Horror",
  "Mystery",
  "Romance",
  "Thriller",
  "Historical",
];
const DEPTHS = [
  { value: "short", label: "Short (~6 nodes)" },
  { value: "medium", label: "Medium (~10 nodes)" },
  { value: "deep", label: "Deep (~15 nodes)" },
];
const CHOICES_OPTIONS = [2, 3, 4];

const ENDING_ICONS: Record<string, React.ElementType> = {
  victory: Trophy,
  defeat: Skull,
  bittersweet: Heart,
  twist: Zap,
  open: Circle,
};
const ENDING_COLORS: Record<string, string> = {
  victory: "text-gold",
  defeat: "text-destructive",
  bittersweet: "text-pink-400",
  twist: "text-purple-400",
  open: "text-muted-foreground",
};

function InteractiveCard({ story }: { story: InteractiveRow }) {
  const [expanded, setExpanded] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const nodes = (story.nodes ?? []) as StoryNode[];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const currentNode = currentNodeId ? nodeMap.get(currentNodeId) : null;

  const endings = nodes.filter((n) => n.is_ending);
  const firstNode = nodes[0];

  function startPlay() {
    if (firstNode) {
      setCurrentNodeId(firstNode.id);
      setPlaying(true);
    }
  }

  function resetPlay() {
    setCurrentNodeId(null);
    setPlaying(false);
  }

  return (
    <div className="glass rounded-2xl overflow-hidden transition-all hover:shadow-elegant">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[image:var(--gradient-primary)] shadow-glow shrink-0">
              <GitBranch className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-xl">{story.title}</h3>
              <p className="text-xs text-muted-foreground">
                {story.genre} · {nodes.length} nodes · {endings.length} endings ·{" "}
                {new Date(story.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!playing && firstNode && (
              <Button variant="glass" size="sm" onClick={startPlay}>
                Play
              </Button>
            )}
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {story.opening && !playing && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{story.opening}</p>
        )}
      </div>

      {/* Interactive Player */}
      {playing && currentNode && (
        <div className="border-t border-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {currentNode.title}
            </Badge>
            <button
              onClick={resetPlay}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Restart
            </button>
          </div>

          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            <p>{currentNode.content}</p>
          </div>

          {currentNode.is_ending ? (
            <div className="glass rounded-xl p-4 text-center space-y-3">
              {(() => {
                const EndIcon = ENDING_ICONS[currentNode.ending_type ?? "open"] ?? Circle;
                const endColor = ENDING_COLORS[currentNode.ending_type ?? "open"] ?? "";
                return (
                  <>
                    <EndIcon className={`mx-auto h-8 w-8 ${endColor}`} />
                    <p className={`font-display text-xl capitalize ${endColor}`}>
                      {currentNode.ending_type ?? "The End"}
                    </p>
                  </>
                );
              })()}
              <Button variant="glass" size="sm" onClick={resetPlay}>
                Play again
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                What do you do?
              </p>
              {currentNode.choices.map((choice, i) => {
                const target = nodeMap.get(choice.leads_to);
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentNodeId(choice.leads_to)}
                    disabled={!target}
                    className="w-full glass rounded-xl p-3 text-left text-sm flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-elegant transition-all disabled:opacity-40"
                  >
                    <ArrowRight className="h-4 w-4 text-accent shrink-0" />
                    <span>{choice.text}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Node map overview */}
      {expanded && !playing && nodes.length > 0 && (
        <div className="border-t border-white/5 p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Story Graph ({nodes.length} nodes)
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {nodes.map((node) => {
              const EndIcon = node.is_ending
                ? (ENDING_ICONS[node.ending_type ?? "open"] ?? Circle)
                : null;
              return (
                <div
                  key={node.id}
                  className={`rounded-xl p-3 text-xs ${
                    node.is_ending
                      ? "bg-primary/5 border border-primary/20"
                      : "bg-background/30 border border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {EndIcon && (
                      <EndIcon
                        className={`h-3 w-3 ${ENDING_COLORS[node.ending_type ?? "open"] ?? ""}`}
                      />
                    )}
                    <span className="font-medium truncate">{node.title}</span>
                    {node.is_ending && (
                      <Badge variant="secondary" className="ml-auto text-xs capitalize shrink-0">
                        {node.ending_type ?? "ending"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{node.content}</p>
                  {node.choices.length > 0 && (
                    <p className="mt-1 text-primary/60">{node.choices.length} choices</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function InteractivePage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    prompt: "",
    genre: "Adventure",
    choices_per_node: 3,
    depth: "medium" as "short" | "medium" | "deep",
  });

  const { data: stories, isLoading } = useQuery({
    queryKey: ["interactive-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interactive_stories")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InteractiveRow[];
    },
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (form.prompt.trim().length < 10) {
      toast.error("Describe your story concept (at least 10 characters).");
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
      const res = await fetch("/api/generate-interactive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      toast.success(`"${json.interactive?.title ?? "Story"}" is ready to play!`);
      qc.invalidateQueries({ queryKey: ["interactive-stories"] });
      setForm({ prompt: "", genre: "Adventure", choices_per_node: 3, depth: "medium" });
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
          <span>Interactive Stories</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Branching narratives</h1>
        <p className="text-muted-foreground">
          Generate choose-your-own-adventure stories with meaningful choices, multiple paths,
          and distinct endings — playable directly in the browser.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="glass grid gap-5 rounded-2xl p-6 md:grid-cols-3">
        <div className="md:col-span-3 space-y-2">
          <Label htmlFor="interactive-prompt">Story concept</Label>
          <Textarea
            id="interactive-prompt"
            rows={3}
            placeholder="You wake up in a cryopod on a derelict starship. The distress beacon is blinking and you're the only one awake…"
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
          <Label>Choices per node</Label>
          <Select
            value={String(form.choices_per_node)}
            onValueChange={(v) => setForm((f) => ({ ...f, choices_per_node: Number(v) }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHOICES_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} choices
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Depth</Label>
          <Select
            value={form.depth}
            onValueChange={(v) => setForm((f) => ({ ...f, depth: v as typeof form.depth }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPTHS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Branching story…
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
        <h2 className="font-display text-2xl">Your adventures</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !stories?.length ? (
          <div className="glass rounded-2xl p-10 text-center">
            <GitBranch className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              No adventures yet. Generate your first above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((s) => (
              <InteractiveCard key={s.id} story={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
