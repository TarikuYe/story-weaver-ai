import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  Users,
  Globe2,
  MessageSquare,
  Wand2,
  GitBranch,
  Mic,
  Sparkles,
  ArrowRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/templates")({
  component: TemplatesPage,
});

type Template = {
  id: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  icon: React.ElementType;
  color: string;
  route: string;
  prefill: Record<string, string | number>;
};

const TEMPLATES: Template[] = [
  // Stories
  {
    id: "hero-journey",
    category: "story",
    title: "The Hero's Journey",
    description: "A classic Campbell arc — call to adventure, trials, transformation, return.",
    tags: ["Fantasy", "Epic", "Classic"],
    icon: BookOpen,
    color: "text-primary",
    route: "/dashboard/stories",
    prefill: { genre: "Fantasy", tone: "Epic & Heroic", length: "medium" },
  },
  {
    id: "noir-mystery",
    category: "story",
    title: "Noir Mystery",
    description: "A cynical detective, a missing person, and a city full of liars.",
    tags: ["Mystery", "Dark", "Urban"],
    icon: BookOpen,
    color: "text-primary",
    route: "/dashboard/stories",
    prefill: { genre: "Mystery", tone: "Dark & Gritty", length: "short" },
  },
  {
    id: "space-opera",
    category: "story",
    title: "Space Opera",
    description: "Galactic empires, chosen crews, impossible odds, and a universe worth saving.",
    tags: ["Sci-Fi", "Epic", "Action"],
    icon: BookOpen,
    color: "text-primary",
    route: "/dashboard/stories",
    prefill: { genre: "Science Fiction", tone: "Epic & Heroic", length: "long" },
  },
  {
    id: "gothic-romance",
    category: "story",
    title: "Gothic Romance",
    description: "A crumbling manor, forbidden love, and secrets buried beneath the floorboards.",
    tags: ["Romance", "Horror", "Gothic"],
    icon: BookOpen,
    color: "text-primary",
    route: "/dashboard/stories",
    prefill: { genre: "Romance", tone: "Dark & Gritty", length: "medium" },
  },
  // Characters
  {
    id: "trickster-rogue",
    category: "character",
    title: "The Trickster Rogue",
    description: "Fast-talking, light-fingered, hiding a surprisingly noble code beneath the charm.",
    tags: ["Fantasy", "Trickster", "Anti-hero"],
    icon: Users,
    color: "text-accent",
    route: "/dashboard/characters",
    prefill: { genre: "Fantasy", archetype: "Trickster", role: "Anti-hero" },
  },
  {
    id: "reluctant-chosen",
    category: "character",
    title: "The Reluctant Chosen One",
    description: "Ordinary person, impossible destiny, every reason to refuse — and one reason to try.",
    tags: ["Fantasy", "Hero", "Protagonist"],
    icon: Users,
    color: "text-accent",
    route: "/dashboard/characters",
    prefill: { genre: "Fantasy", archetype: "Hero", role: "Protagonist" },
  },
  {
    id: "fallen-mentor",
    category: "character",
    title: "The Fallen Mentor",
    description: "Once the greatest of their order, now broken by a mistake they can't forgive themselves for.",
    tags: ["Fantasy", "Mentor", "Tragedy"],
    icon: Users,
    color: "text-accent",
    route: "/dashboard/characters",
    prefill: { genre: "Fantasy", archetype: "Mentor", role: "Mentor" },
  },
  // Worlds
  {
    id: "dying-empire",
    category: "world",
    title: "Dying Empire",
    description: "A once-great civilization crumbling under corruption, foreign pressure, and its own hubris.",
    tags: ["Fantasy", "Political", "Epic"],
    icon: Globe2,
    color: "text-gold",
    route: "/dashboard/worlds",
    prefill: { type: "Fantasy", era: "Medieval", tone: "Dark" },
  },
  {
    id: "post-magic",
    category: "world",
    title: "Post-Magic World",
    description: "Magic vanished three generations ago. The world rebuilt itself around that absence — and now something is returning.",
    tags: ["Fantasy", "Mysterious", "Modern"],
    icon: Globe2,
    color: "text-gold",
    route: "/dashboard/worlds",
    prefill: { type: "Fantasy", era: "Modern", tone: "Mysterious" },
  },
  {
    id: "generation-ship",
    category: "world",
    title: "Generation Ship",
    description: "A self-contained civilization hurtling through the void. The original mission long forgotten by those now born aboard.",
    tags: ["Sci-Fi", "Social", "Claustrophobic"],
    icon: Globe2,
    color: "text-gold",
    route: "/dashboard/worlds",
    prefill: { type: "Science Fiction", era: "Far Future", tone: "Political" },
  },
  // Dialogues
  {
    id: "villain-monologue",
    category: "dialogue",
    title: "The Villain's Reveal",
    description: "The antagonist finally explains their plan — and why they're not entirely wrong.",
    tags: ["Dramatic", "Tense", "Reveal"],
    icon: MessageSquare,
    color: "text-blue-400",
    route: "/dashboard/dialogues",
    prefill: { emotion: "Suspenseful / Tense", length: "medium" },
  },
  {
    id: "reunion-after-betrayal",
    category: "dialogue",
    title: "Reunion After Betrayal",
    description: "Two former allies meet for the first time since one betrayed the other. Everything unsaid hangs between them.",
    tags: ["Emotional", "Tense", "Character"],
    icon: MessageSquare,
    color: "text-blue-400",
    route: "/dashboard/dialogues",
    prefill: { emotion: "Angry / Heated", length: "medium" },
  },
  // Interactive
  {
    id: "dungeon-delve",
    category: "interactive",
    title: "Dungeon Delve",
    description: "A classic crawl through ancient ruins — traps, monsters, treasure, and moral dilemmas at every turn.",
    tags: ["Fantasy", "Adventure", "Classic"],
    icon: GitBranch,
    color: "text-orange-400",
    route: "/dashboard/interactive",
    prefill: { genre: "Fantasy", choices_per_node: 3, depth: "medium" },
  },
  {
    id: "first-contact",
    category: "interactive",
    title: "First Contact",
    description: "You're humanity's first ambassador to an alien civilization. Every word you say shapes the future of two species.",
    tags: ["Sci-Fi", "Diplomatic", "Consequential"],
    icon: GitBranch,
    color: "text-orange-400",
    route: "/dashboard/interactive",
    prefill: { genre: "Science Fiction", choices_per_node: 3, depth: "deep" },
  },
  // Comics
  {
    id: "origin-story",
    category: "comic",
    title: "Origin Story",
    description: "The moment an ordinary person becomes something more. Told in six iconic panels.",
    tags: ["Superhero", "Action", "Origin"],
    icon: Wand2,
    color: "text-purple-400",
    route: "/dashboard/comics",
    prefill: { art_style: "Superhero", panel_count: 6 },
  },
  // Audiobooks
  {
    id: "campfire-tale",
    category: "audiobook",
    title: "Campfire Tale",
    description: "A ghost story meant to be heard in the dark — slow burns, whispered revelations, and a chill at the end.",
    tags: ["Horror", "Atmospheric", "Short"],
    icon: Mic,
    color: "text-pink-400",
    route: "/dashboard/audiobooks",
    prefill: { narrator_style: "dark", chapter_count: 1 },
  },
];

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "story", label: "Stories" },
  { key: "character", label: "Characters" },
  { key: "world", label: "Worlds" },
  { key: "dialogue", label: "Dialogues" },
  { key: "interactive", label: "Interactive" },
  { key: "comic", label: "Comics" },
  { key: "audiobook", label: "Audiobooks" },
];

function TemplatesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = TEMPLATES.filter((t) => {
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  function useTemplate(template: Template) {
    // Navigate to the appropriate page — the prefill data could be passed via
    // search params or sessionStorage; we use sessionStorage here for simplicity
    sessionStorage.setItem("sf_template_prefill", JSON.stringify(template.prefill));
    navigate({ to: template.route });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Templates</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Start from a template</h1>
        <p className="text-muted-foreground">
          Proven story structures, archetypes, and world concepts — pre-configured for
          one-click generation.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">No templates match your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="glass group relative overflow-hidden rounded-2xl p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              {/* Background glow */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start gap-3 mb-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[image:var(--gradient-primary)] shadow-glow">
                  <template.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-lg leading-tight">{template.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
                {template.description}
              </p>

              <Button
                variant="glass"
                size="sm"
                className="mt-5 w-full"
                onClick={() => useTemplate(template)}
              >
                Use template <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="glass rounded-xl px-5 py-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-gold shrink-0" />
        Templates pre-fill the generation form — you can always adjust before generating.
      </div>
    </div>
  );
}
