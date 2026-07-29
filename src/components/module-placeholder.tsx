import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: string;
}

export function ModulePlaceholder({ icon: Icon, title, description, cta = "Coming soon" }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="glass-strong relative overflow-hidden rounded-2xl p-12 text-center shadow-elegant">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-60" />
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-[image:var(--gradient-primary)] shadow-glow">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="mt-6 font-display text-4xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{description}</p>
        <Button variant="glass" className="mt-8" disabled>
          <Sparkles className="mr-1 h-4 w-4" /> {cta}
        </Button>
      </div>
    </div>
  );
}
