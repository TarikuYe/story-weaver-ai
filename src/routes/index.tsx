import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  Globe2,
  Image as ImageIcon,
  Mic,
  GitBranch,
  Sparkles,
  MessageSquare,
  Wand2,
  ArrowRight,
  Check,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "StoryForge AI — Craft entire worlds with AI" },
      {
        name: "description",
        content:
          "Generate stories, characters, worlds, comics, audiobooks and interactive adventures with StoryForge AI.",
      },
    ],
  }),
});

const features = [
  { icon: BookOpen, title: "Story Generator", desc: "Turn a spark of an idea into a full novel — outline, chapters, plot twists and ending." },
  { icon: Users, title: "Characters", desc: "Deep, consistent characters with backstory, portrait, voice and relationships." },
  { icon: Globe2, title: "World Builder", desc: "Design kingdoms, cultures, magic systems, maps and climates that hang together." },
  { icon: ImageIcon, title: "AI Illustrations", desc: "On-brand imagery for characters, cities, weapons and creatures — style locked per project." },
  { icon: MessageSquare, title: "Dialogue Studio", desc: "Emotion-tuned conversations: romance, suspense, humor, fear." },
  { icon: GitBranch, title: "Interactive Adventures", desc: "Branching narratives with choices, endings and a visual story graph." },
  { icon: Mic, title: "Audiobooks", desc: "Studio-quality narration with multiple voices and ambient scoring." },
  { icon: Wand2, title: "Comic Generator", desc: "Turn any chapter into laid-out comic pages — panels, angles, bubbles." },
];

const steps = [
  { n: "01", title: "Describe your idea", desc: "A sentence, a mood, a title — that's enough to begin." },
  { n: "02", title: "Forge the world", desc: "AI drafts the story, casts characters and paints scenes to match." },
  { n: "03", title: "Edit & publish", desc: "Refine in the editor. Export to PDF, EPUB, comic or audio." },
];

const plans = [
  { name: "Free", price: "$0", tag: "Start writing today", credits: "100 credits / mo", features: ["3 stories", "Basic image gen", "PDF export"], cta: "Get started" },
  { name: "Basic", price: "$9", tag: "For hobbyists", credits: "1,500 credits / mo", features: ["Unlimited stories", "HD images", "EPUB + comic export"], cta: "Choose Basic" },
  { name: "Pro", price: "$29", tag: "Most popular", credits: "6,000 credits / mo", features: ["Audiobooks", "Interactive stories", "Priority AI models", "Style-locked images"], cta: "Choose Pro", featured: true },
  { name: "Studio", price: "$79", tag: "Teams & authors", credits: "20,000 credits / mo", features: ["Everything in Pro", "Team seats", "Commercial license", "API access"], cta: "Choose Studio" },
];

const faqs = [
  { q: "Who owns the work I create?", a: "You do. All content you generate is yours. Paid tiers include a commercial license." },
  { q: "Which AI models power StoryForge?", a: "We combine best-in-class frontier models for text, images, and speech behind a unified creative studio." },
  { q: "Can I import my existing manuscript?", a: "Yes — paste or upload your draft and continue with any tool: character extraction, world building, illustration, etc." },
  { q: "How do credits work?", a: "Each generation consumes credits depending on model and length. Unused credits roll over one month." },
];

function Landing() {
  const { session } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* NAV */}
      <header
        className={`fixed top-0 z-50 w-full transition-all ${
          scrolled ? "glass-strong" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-primary)] shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              StoryForge <span className="text-gradient">AI</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            {session ? (
              <Button asChild variant="hero" size="sm">
                <Link to="/dashboard">Open studio</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild variant="hero" size="sm">
                  <Link to="/auth">Start free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative px-6 pt-40 pb-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="glass mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_theme(colors.gold)]"></span>
            <span className="text-muted-foreground">
              Premium AI storytelling studio · Now in early access
            </span>
          </div>
          <h1 className="font-display text-6xl leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
            Craft entire <span className="text-gradient">worlds</span>
            <br />
            with a single sentence.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Stories, characters, worlds, comics, audiobooks, interactive adventures — all forged
            by AI, kept consistent across every scene.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="hero" className="min-w-[180px]">
              <Link to={session ? "/dashboard" : "/auth"}>
                Start forging <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass" className="min-w-[180px]">
              <a href="#features">See what's inside</a>
            </Button>
          </div>
          <div className="mt-16 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
              ))}
            </div>
            <span>Loved by 12,000+ authors, DMs & creators</span>
          </div>
        </div>

        {/* floating glow orb */}
        <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-gold">The Studio</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Nine tools. One universe.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Every generator is aware of your world's canon — characters stay in character,
              cities stay on the map, art stays on-style.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass group relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-[image:var(--gradient-primary)] shadow-glow">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-gold">Workflow</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">From spark to saga.</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="glass rounded-2xl p-8">
                <div className="font-display text-5xl text-gradient-primary">{s.n}</div>
                <h3 className="mt-4 font-display text-2xl">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-gold">Voices</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Storytellers on StoryForge.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { q: "I wrote three novellas in the time it used to take me to outline one.", a: "Elena V.", r: "Fantasy author" },
              { q: "My tabletop campaigns feel like published sourcebooks now.", a: "Marcus T.", r: "Dungeon Master" },
              { q: "The character consistency is honestly uncanny. Everything just fits.", a: "Priya S.", r: "Comic writer" },
            ].map((t) => (
              <blockquote key={t.a} className="glass rounded-2xl p-8">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="font-display text-lg leading-snug">"{t.q}"</p>
                <footer className="mt-4 text-sm">
                  <div className="font-medium">{t.a}</div>
                  <div className="text-muted-foreground">{t.r}</div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-gold">Plans</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Simple, credit-based pricing.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Every plan includes every tool. Higher tiers unlock more monthly credits and faster models.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl p-8 ${
                  p.featured
                    ? "glass-strong ring-2 ring-primary shadow-glow"
                    : "glass"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[image:var(--gradient-gold)] px-3 py-1 text-xs font-semibold text-gold-foreground">
                    Most popular
                  </div>
                )}
                <h3 className="font-display text-2xl">{p.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{p.tag}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-5xl">{p.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-1 text-xs text-gold">{p.credits}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={p.featured ? "hero" : "glass"}
                  className="mt-8 w-full"
                >
                  <Link to="/auth">{p.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-gold">FAQ</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Questions, answered.</h2>
          </div>
          <Accordion type="single" collapsible className="glass rounded-2xl px-6">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
                <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="glass-strong relative overflow-hidden rounded-3xl p-12 text-center shadow-elegant">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-60" />
            <h2 className="font-display text-4xl md:text-5xl">
              Your first world is <span className="text-gradient">one prompt away.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Sign up free — no credit card. Keep everything you make.
            </p>
            <Button asChild size="lg" variant="hero" className="mt-8">
              <Link to="/auth">
                Enter the studio <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-[image:var(--gradient-primary)]">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-display">StoryForge AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StoryForge AI. Made for storytellers.
          </p>
        </div>
      </footer>
    </div>
  );
}
