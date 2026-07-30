import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Loader2, Sparkles, Wand2, Download } from "lucide-react";
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

export const Route = createFileRoute("/dashboard/images")({
  component: ImagesPage,
});

type ImageRow = {
  id: string;
  subject: string;
  style: string | null;
  prompt: string;
  image_url: string | null;
  status: string;
  created_at: string;
};

const IMAGE_SUBJECTS = [
  "Character portrait",
  "City / Landscape",
  "Creature / Monster",
  "Weapon / Artifact",
  "Building / Architecture",
  "Map / Location",
  "Magic / Spell effect",
  "Battle scene",
  "Interior scene",
  "Vehicle / Ship",
];

const ART_STYLES = [
  "Fantasy oil painting",
  "Dark fantasy",
  "Anime / Manga",
  "Watercolor",
  "Concept art",
  "Pixel art",
  "Cinematic / Realistic",
  "Comic book",
  "Impressionist",
  "Art Nouveau",
];

// Since we don't have actual image generation wired to an image model yet,
// we store the prompt and show a styled placeholder with the prompt text.
// The API creates the DB row and returns a placeholder URL.
function ImageCard({ img }: { img: ImageRow }) {
  return (
    <div className="glass rounded-2xl overflow-hidden transition-all hover:shadow-elegant group">
      <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
        {img.image_url ? (
          <img
            src={img.image_url}
            alt={img.subject}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="p-6 text-center space-y-3">
            <div className="grid h-12 w-12 mx-auto place-items-center rounded-xl bg-[image:var(--gradient-primary)] shadow-glow">
              <ImageIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">
              {img.prompt}
            </p>
          </div>
        )}
        {img.image_url && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <a
              href={img.image_url}
              download
              className="rounded-lg bg-white/10 p-2 hover:bg-white/20 transition-colors"
              aria-label="Download image"
            >
              <Download className="h-5 w-5" />
            </a>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {img.subject}
          </Badge>
          {img.style && (
            <Badge variant="secondary" className="text-xs text-muted-foreground">
              {img.style}
            </Badge>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{img.prompt}</p>
      </div>
    </div>
  );
}

function ImagesPage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    prompt: "",
    subject: "Character portrait",
    style: "Fantasy oil painting",
  });

  const { data: images, isLoading } = useQuery({
    queryKey: ["generated-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ImageRow[];
    },
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (form.prompt.trim().length < 10) {
      toast.error("Describe what to generate (at least 10 characters).");
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

      // Insert record directly — image generation requires a dedicated image model
      // integration (e.g. DALL-E, Stable Diffusion) which is added via the
      // AI gateway. For now we persist the generation prompt as a ready asset.
      const { error } = await supabase.from("generated_images").insert({
        user_id: session.user.id,
        subject: form.subject,
        style: form.style,
        prompt: `${form.style} style. ${form.prompt}`,
        status: "complete",
      });

      if (error) throw error;

      toast.success("Image prompt saved to your library!");
      qc.invalidateQueries({ queryKey: ["generated-images"] });
      setForm({ prompt: "", subject: "Character portrait", style: "Fantasy oil painting" });
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
          <span>Image Studio</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Generate images</h1>
        <p className="text-muted-foreground">
          Style-locked illustrations for every element of your world — characters, cities,
          creatures, artifacts, and more.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="glass grid gap-5 rounded-2xl p-6 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="image-prompt">Describe the image</Label>
          <Textarea
            id="image-prompt"
            rows={3}
            placeholder="A silver-haired elven assassin perched on a cathedral gargoyle at dusk, city lights below, cloak billowing in the wind…"
            value={form.prompt}
            onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
            disabled={generating}
          />
        </div>

        <div className="space-y-2">
          <Label>Subject Type</Label>
          <Select
            value={form.subject}
            onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMAGE_SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Art Style</Label>
          <Select
            value={form.style}
            onValueChange={(v) => setForm((f) => ({ ...f, style: v }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ART_STYLES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Image generation requires a connected image model (DALL-E 3, Stable Diffusion, etc.).
            Prompts are saved to your library and ready once a model is connected.
          </p>
          <Button
            type="submit"
            variant="hero"
            size="lg"
            disabled={generating}
            className="shrink-0 min-w-44"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Save prompt
              </>
            )}
          </Button>
        </div>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Your gallery</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !images?.length ? (
          <div className="glass rounded-2xl p-10 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              No images yet. Create your first above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((img) => (
              <ImageCard key={img.id} img={img} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
