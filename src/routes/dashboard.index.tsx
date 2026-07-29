import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Users,
  Globe2,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  GitBranch,
  Wand2,
  Sparkles,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const modules = [
  { title: "Story", desc: "Novel-length fiction from a single idea.", to: "/dashboard/stories", icon: BookOpen },
  { title: "Characters", desc: "Cast with portraits, voices and arcs.", to: "/dashboard/characters", icon: Users },
  { title: "Worlds", desc: "Kingdoms, magic, maps, cultures.", to: "/dashboard/worlds", icon: Globe2 },
  { title: "Images", desc: "Style-locked illustrations.", to: "/dashboard/images", icon: ImageIcon },
  { title: "Dialogues", desc: "Emotion-tuned conversations.", to: "/dashboard/dialogues", icon: MessageSquare },
  { title: "Comics", desc: "Chapters to panels & bubbles.", to: "/dashboard/comics", icon: Wand2 },
  { title: "Audiobooks", desc: "Multi-voice narration.", to: "/dashboard/audiobooks", icon: Mic },
  { title: "Interactive", desc: "Branching stories & endings.", to: "/dashboard/interactive", icon: GitBranch },
];

function DashboardHome() {
  const { user } = useAuth();
  const name =
    (user?.user_metadata?.display_name as string) ??
    user?.email?.split("@")[0] ??
    "storyteller";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="glass-strong relative overflow-hidden rounded-2xl p-8 shadow-elegant">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-60" />
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
          <Sparkles className="h-3.5 w-3.5" /> Welcome back
        </div>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">
          Hello, <span className="text-gradient">{name}</span>.
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Pick a tool to begin, or start a new story from a single prompt.
        </p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/dashboard/stories">
            <Plus className="mr-1 h-4 w-4" /> New story
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="mb-4 font-display text-2xl">Your studio</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => (
            <Link
              key={m.title}
              to={m.to}
              className="glass group rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-[image:var(--gradient-primary)] shadow-glow">
                <m.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg">{m.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
