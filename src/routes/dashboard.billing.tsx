import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Loader2,
  Sparkles,
  Check,
  Zap,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
});

type Profile = {
  credits: number;
  subscription: string;
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    tag: "Start writing today",
    credits: 100,
    color: "text-muted-foreground",
    features: [
      "100 credits / month",
      "3 active stories",
      "Basic image generation",
      "PDF export",
      "Community support",
    ],
  },
  {
    name: "Basic",
    price: "$9",
    period: "/mo",
    tag: "For hobbyists",
    credits: 1500,
    color: "text-primary",
    features: [
      "1,500 credits / month",
      "Unlimited stories",
      "HD image generation",
      "EPUB + comic export",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    tag: "Most popular",
    credits: 6000,
    featured: true,
    color: "text-gold",
    features: [
      "6,000 credits / month",
      "Audiobooks",
      "Interactive stories",
      "Priority AI models",
      "Style-locked image sets",
      "Priority support",
    ],
  },
  {
    name: "Studio",
    price: "$79",
    period: "/mo",
    tag: "Teams & authors",
    credits: 20000,
    color: "text-accent",
    features: [
      "20,000 credits / month",
      "Everything in Pro",
      "Team seats (5 users)",
      "Commercial license",
      "API access",
      "Dedicated support",
    ],
  },
];

const CREDIT_COSTS = [
  { action: "Short story (3 chapters)", credits: 30 },
  { action: "Medium story (5 chapters)", credits: 50 },
  { action: "Long story (8 chapters)", credits: 80 },
  { action: "Character profile", credits: 8 },
  { action: "World building", credits: 15 },
  { action: "Dialogue scene", credits: 5 },
  { action: "Comic script (6 panels)", credits: 12 },
  { action: "Interactive story (medium)", credits: 25 },
  { action: "Audiobook script (2 chapters)", credits: 20 },
];

function BillingPage() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-billing", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("credits, subscription")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const currentPlan = PLANS.find(
    (p) => p.name.toLowerCase() === (profile?.subscription ?? "free").toLowerCase(),
  ) ?? PLANS[0];

  const creditPercent = Math.min(
    100,
    Math.round(((profile?.credits ?? 0) / currentPlan.credits) * 100),
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Billing</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Plans & credits</h1>
        <p className="text-muted-foreground">
          Manage your subscription and track your monthly credit usage.
        </p>
      </div>

      {/* Current plan summary */}
      <div className="glass-strong relative overflow-hidden rounded-2xl p-6 shadow-elegant">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-30" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Current plan
            </p>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl">{currentPlan.name}</h2>
              <Badge className={`capitalize ${currentPlan.color}`} variant="secondary">
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{currentPlan.tag}</p>
          </div>

          <div className="min-w-64 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-gold" /> Credits remaining
              </span>
              <span className="font-semibold">
                {(profile?.credits ?? 0).toLocaleString()} / {currentPlan.credits.toLocaleString()}
              </span>
            </div>
            <Progress value={creditPercent} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              Resets on the 1st of each month
            </p>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div>
        <h2 className="mb-6 font-display text-2xl">Choose a plan</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrent =
              plan.name.toLowerCase() === (profile?.subscription ?? "free").toLowerCase();
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col transition-all ${
                  plan.featured
                    ? "glass-strong ring-2 ring-primary shadow-glow"
                    : "glass hover:shadow-elegant"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[image:var(--gradient-gold)] px-3 py-1 text-xs font-semibold text-gold-foreground">
                    Most popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Current
                  </div>
                )}

                <h3 className="font-display text-2xl">{plan.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {plan.tag}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-1 text-xs text-gold">
                  {plan.credits.toLocaleString()} credits / mo
                </p>

                <ul className="mt-5 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.featured ? "hero" : isCurrent ? "glass" : "glass"}
                  className="mt-6 w-full"
                  disabled={isCurrent}
                  asChild={!isCurrent}
                >
                  {isCurrent ? (
                    <span>Current plan</span>
                  ) : (
                    <Link to="/dashboard/billing">
                      Upgrade <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credit cost reference */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-4 w-4 text-gold" />
          <h2 className="font-display text-xl">Credit cost reference</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {CREDIT_COSTS.map((item) => (
            <div
              key={item.action}
              className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
            >
              <span className="text-sm text-muted-foreground">{item.action}</span>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Zap className="h-3 w-3 text-gold" />
                {item.credits}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment info notice */}
      <div className="glass rounded-2xl p-5 flex items-start gap-3">
        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Payments are processed securely via Stripe. Your card details are never stored on our
            servers.
          </p>
          <p>All plans renew monthly. Cancel anytime — your content stays yours.</p>
        </div>
      </div>
    </div>
  );
}
