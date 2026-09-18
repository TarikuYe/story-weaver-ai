import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wand2, Loader2, Sparkles, BookOpen, Volume2, VolumeX, ChevronRight, ChevronLeft, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/kid-stories")({
  component: KidStoriesPage,
});

type Page = {
  page_number: number;
  text: string;
  image_prompt: string;
  image_url: string;
  audio_url: string;
};

type KidStoryRow = {
  id: string;
  title: string;
  prompt: string;
  tone: string;
  pages: Page[] | null;
  status: string;
  created_at: string;
};

const TONES = [
  "Bedtime / Calming",
  "Whimsical and Educational",
  "Adventurous",
  "Funny / Silly",
  "Fairy Tale",
  "Sci-Fi / Space",
];

function KidStoryBook({ story }: { story: KidStoryRow }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAutoReadingRef = useRef(false);
  const pages = (story.pages ?? []) as Page[];

  const handleAudioEnd = () => {
    setIsPlaying(false);
    if (isAutoReadingRef.current) {
      setCurrentPage((p) => {
        if (p < pages.length - 1) return p + 1;
        isAutoReadingRef.current = false;
        return p;
      });
    }
  };

  const playCurrentPageAudio = useCallback(() => {
    if (pages.length === 0) return;
    const page = pages[currentPage];
    
    if (page.audio_url) {
      if (!audioRef.current || audioRef.current.src !== new URL(page.audio_url, window.location.href).href) {
        audioRef.current = new Audio(page.audio_url);
        audioRef.current.onended = handleAudioEnd;
      }
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      const utterance = new SpeechSynthesisUtterance(page.text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes("Google UK English Female") || 
        v.name.includes("Samantha") || 
        v.name.includes("Female")
      );
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onend = handleAudioEnd;
      utterance.onerror = handleAudioEnd;
      
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }, [currentPage, pages]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);

    let timer: NodeJS.Timeout;
    if (isAutoReadingRef.current) {
      // Small delay before reading next page to feel natural
      timer = setTimeout(() => {
        playCurrentPageAudio();
      }, 800);
    }

    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis.cancel();
    };
  }, [currentPage, playCurrentPageAudio]);

  if (pages.length === 0) {
    return null;
  }

  const page = pages[currentPage];
  const isFirst = currentPage === 0;
  const isLast = currentPage === pages.length - 1;

  const toggleAudio = () => {
    if (isPlaying) {
      isAutoReadingRef.current = false;
      if (audioRef.current) audioRef.current.pause();
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      isAutoReadingRef.current = true;
      playCurrentPageAudio();
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden transition-all hover:shadow-elegant">
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl">{story.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {story.tone} · {pages.length} pages · {new Date(story.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="p-6 md:p-10 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white text-slate-900 rounded-xl overflow-hidden shadow-2xl relative border-4 border-slate-200">
          {page.image_url ? (
            <img 
              src={page.image_url} 
              alt={`Page ${page.page_number}`} 
              className="w-full aspect-square object-cover" 
            />
          ) : (
            <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-slate-400">
              <BookOpen className="w-16 h-16 opacity-50 mb-2" />
              <span>Generating Image...</span>
            </div>
          )}
          
          <div className="p-8 text-center bg-white min-h-[160px] flex flex-col justify-center relative">
            <p className="text-xl md:text-2xl font-serif leading-relaxed text-slate-800">
              {page.text}
            </p>
            {/* Always show audio button, use browser TTS as fallback */}
            <Button 
              variant={isPlaying ? "default" : "outline"}
              size="icon" 
              className={`absolute top-4 right-4 rounded-full ${isPlaying ? 'bg-primary text-primary-foreground shadow-glow animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-none'}`}
              onClick={toggleAudio}
              title={isPlaying ? "Pause Audio" : "Play Audio"}
            >
              {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
          <div className="bg-slate-100 text-center py-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
            Page {page.page_number} of {pages.length}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => {
              isAutoReadingRef.current = false;
              setCurrentPage((p) => Math.max(0, p - 1));
            }}
            disabled={isFirst}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            {currentPage + 1} / {pages.length}
          </span>
          <Button
            variant="outline"
            onClick={() => {
              isAutoReadingRef.current = false;
              setCurrentPage((p) => Math.min(pages.length - 1, p + 1));
            }}
            disabled={isLast}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function KidStoriesPage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [pageCount, setPageCount] = useState([5]);
  const [form, setForm] = useState({
    prompt: "",
    tone: "Whimsical and Educational",
    characters: "",
  });

  const { data: stories, isLoading } = useQuery({
    queryKey: ["kid-stories"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("kid_stories")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as KidStoryRow[];
    },
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (form.prompt.trim().length < 5) {
      toast.error("Describe the story idea.");
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
      const res = await fetch("/api/generate-kid-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...form,
          page_count: pageCount[0],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      toast.success(`${json.title ?? "Story"} is ready!`);
      qc.invalidateQueries({ queryKey: ["kid-stories"] });
      setForm({ prompt: "", tone: "Whimsical and Educational", characters: "" });
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
          <span>Kid Stories Generator</span>
        </div>
        <h1 className="font-display text-4xl text-gradient">Create a children's book</h1>
        <p className="text-muted-foreground">
          Generate a magical, illustrated, and narrated short story designed perfectly for kids.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="glass grid gap-5 rounded-2xl p-6 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="story-prompt">Story Idea</Label>
          <Textarea
            id="story-prompt"
            rows={3}
            placeholder="A little bear named Barnaby tries to catch a star to use as a nightlight..."
            value={form.prompt}
            onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
            disabled={generating}
          />
        </div>

        <div className="space-y-2">
          <Label>Tone & Style</Label>
          <Select
            value={form.tone}
            onValueChange={(v) => setForm((f) => ({ ...f, tone: v }))}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>
            Number of Pages:{" "}
            <span className="text-primary font-semibold">{pageCount[0]}</span>
          </Label>
          <Slider
            min={3}
            max={10}
            step={1}
            value={pageCount}
            onValueChange={setPageCount}
            disabled={generating}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3</span>
            <span>10</span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="story-characters">Characters (optional)</Label>
          <Textarea
            id="story-characters"
            rows={2}
            placeholder="Barnaby the bear, Luna the owl."
            value={form.characters}
            onChange={(e) => setForm((f) => ({ ...f, characters: e.target.value }))}
            disabled={generating}
          />
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" /> Create Storybook
              </>
            )}
          </Button>
        </div>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Your Library</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !stories?.length ? (
          <div className="glass rounded-2xl p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              No stories yet. Start by writing an idea above!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {stories.map((s) => (
              <KidStoryBook key={s.id} story={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
