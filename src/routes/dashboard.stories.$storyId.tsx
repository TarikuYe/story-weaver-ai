import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Download,
  FileText,
  FileCode2,
  BookMarked,
  Star,
  StarOff,
  Pencil,
  Check,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/stories/$storyId")({
  component: StoryViewer,
});

type OutlineJSON = {
  title?: string;
  logline?: string;
  chapters?: { title: string; summary: string }[];
};

type ChapterRow = {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  word_count: number;
};

// ─── Export helpers ────────────────────────────────────────────────────────────

function buildMarkdown(
  title: string,
  genre: string | null,
  tone: string | null,
  logline: string | null,
  chapters: ChapterRow[],
): string {
  const lines: string[] = [];
  lines.push(`# ${title}`);
  if (genre || tone) lines.push(`\n*${[genre, tone].filter(Boolean).join(" · ")}*`);
  if (logline) lines.push(`\n> ${logline}`);
  lines.push("");
  for (const ch of chapters) {
    lines.push(`\n## Chapter ${ch.chapter_number}: ${ch.title}\n`);
    lines.push(ch.content);
  }
  return lines.join("\n");
}

function buildHTML(
  title: string,
  genre: string | null,
  tone: string | null,
  logline: string | null,
  chapters: ChapterRow[],
): string {
  const chapterHTML = chapters
    .map(
      (ch) =>
        `<section>\n  <h2>Chapter ${ch.chapter_number}: ${ch.chapter_number === 1 ? ch.title : ch.title}</h2>\n  ${ch.content
          .split("\n")
          .filter(Boolean)
          .map((p) => `<p>${p}</p>`)
          .join("\n  ")}\n</section>`,
    )
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 680px; margin: 2rem auto; line-height: 1.8; color: #1a1a1a; }
    h1 { font-size: 2.4rem; margin-bottom: 0.25rem; }
    .meta { color: #666; margin-bottom: 2rem; }
    blockquote { border-left: 3px solid #999; padding-left: 1rem; color: #555; font-style: italic; }
    h2 { font-size: 1.5rem; margin-top: 3rem; }
    p { margin: 0 0 1rem; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">${[genre, tone].filter(Boolean).join(" · ")}</p>
  ${logline ? `<blockquote>${logline}</blockquote>` : ""}
  ${chapterHTML}
</body>
</html>`;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Inline chapter editor ─────────────────────────────────────────────────────

function ChapterEditor({
  chapter,
  onSave,
}: {
  chapter: ChapterRow;
  onSave: (id: string, title: string, content: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(chapter.id, title, content);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <article className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        {editing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-display text-2xl h-auto py-1 bg-transparent border-white/20"
          />
        ) : (
          <h2 className="font-display text-3xl">
            Chapter {chapter.chapter_number}: {chapter.title}
          </h2>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {editing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSave}
                disabled={saving}
                className="h-8 w-8"
                aria-label="Save"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setTitle(chapter.title);
                  setContent(chapter.content);
                  setEditing(false);
                }}
                className="h-8 w-8"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditing(true)}
              className="h-8 w-8"
              aria-label="Edit chapter"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{words.toLocaleString()} words</span>
        <span>·</span>
        <span>~{Math.ceil(words / 238)} min read</span>
      </div>

      {editing ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="font-mono text-sm leading-relaxed resize-y bg-background/40"
        />
      ) : (
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-[0.9375rem]">
          <ReactMarkdown>{chapter.content}</ReactMarkdown>
        </div>
      )}
    </article>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

function StoryViewer() {
  const { storyId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [isFav, setIsFav] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      const [{ data: story, error: e1 }, { data: chapters, error: e2 }, { data: fav }] =
        await Promise.all([
          supabase.from("stories").select("*").eq("id", storyId).maybeSingle(),
          supabase
            .from("chapters")
            .select("*")
            .eq("story_id", storyId)
            .order("chapter_number", { ascending: true }),
          supabase
            .from("favorites")
            .select("id")
            .eq("item_type", "story")
            .eq("item_id", storyId)
            .maybeSingle(),
        ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setIsFav(!!fav);
      return { story, chapters: chapters ?? [] };
    },
    refetchInterval: (q) =>
      q.state.data?.story?.status === "generating" ? 3000 : false,
  });

  async function toggleFavorite() {
    if (!user) return;
    if (isFav) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("item_type", "story")
        .eq("item_id", storyId);
      setIsFav(false);
      toast.success("Removed from favorites");
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, item_type: "story", item_id: storyId });
      setIsFav(true);
      toast.success("Added to favorites");
    }
  }

  async function handleChapterSave(id: string, title: string, content: string) {
    const { error } = await supabase
      .from("chapters")
      .update({
        title,
        content,
        word_count: content.trim().split(/\s+/).filter(Boolean).length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      toast.error("Failed to save chapter");
      throw error;
    }
    toast.success("Chapter saved");
    qc.invalidateQueries({ queryKey: ["story", storyId] });
  }

  function handleExport(format: "markdown" | "html" | "json") {
    if (!data?.story) return;
    const { story, chapters } = data;
    const outline = story.outline as OutlineJSON | null;
    const slug = slugify(story.title || "story");

    if (format === "markdown") {
      const md = buildMarkdown(
        story.title,
        story.genre,
        story.tone,
        outline?.logline ?? null,
        chapters as ChapterRow[],
      );
      downloadBlob(md, `${slug}.md`, "text/markdown");
    } else if (format === "html") {
      const html = buildHTML(
        story.title,
        story.genre,
        story.tone,
        outline?.logline ?? null,
        chapters as ChapterRow[],
      );
      downloadBlob(html, `${slug}.html`, "text/html");
    } else if (format === "json") {
      const json = JSON.stringify({ story, chapters }, null, 2);
      downloadBlob(json, `${slug}.json`, "application/json");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error || !data?.story) {
    return (
      <div className="mx-auto max-w-3xl p-10">
        <p className="text-muted-foreground">Story not found.</p>
        <Link to="/dashboard/stories" className="mt-4 inline-flex items-center text-accent">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to library
        </Link>
      </div>
    );
  }

  const { story, chapters } = data;
  const outline = story.outline as OutlineJSON | null;
  const totalWords = (chapters as ChapterRow[]).reduce((s, c) => s + (c.word_count ?? 0), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 md:p-10">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          to="/dashboard/stories"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to library
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            {isFav ? (
              <Star className="h-4 w-4 fill-gold text-gold" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>

          {/* Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="sm">
                <Download className="mr-1.5 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Export as</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("markdown")}>
                <FileText className="mr-2 h-4 w-4" /> Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("html")}>
                <FileCode2 className="mr-2 h-4 w-4" /> HTML (.html)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <BookMarked className="mr-2 h-4 w-4" /> JSON (.json)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {[story.genre, story.tone, story.language].filter(Boolean).map((v) => (
            <Badge key={v} variant="secondary" className="text-xs">
              {v}
            </Badge>
          ))}
        </div>
        <h1 className="font-display text-4xl text-gradient md:text-5xl">{story.title}</h1>
        {outline?.logline && (
          <p className="text-lg italic text-muted-foreground">{outline.logline}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span>{totalWords.toLocaleString()} words</span>
          <span>·</span>
          <span>~{Math.ceil(totalWords / 238)} min read</span>
          <span>·</span>
          <span>{(chapters as ChapterRow[]).length} chapters</span>
        </div>
      </header>

      {/* Status banners */}
      {story.status === "generating" && (
        <div className="glass flex items-center gap-3 rounded-xl p-4 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          Forging chapters… this refreshes automatically.
        </div>
      )}
      {story.status === "failed" && (
        <div className="glass rounded-xl p-4 text-sm text-destructive">
          Generation failed. Try creating a new story.
        </div>
      )}

      {/* Outline */}
      {outline?.chapters && (
        <section className="glass space-y-3 rounded-2xl p-6">
          <h2 className="font-display text-2xl">Outline</h2>
          <ol className="space-y-3">
            {outline.chapters.map((c, i) => (
              <li key={i} className="border-l-2 border-accent/40 pl-4">
                <div className="font-medium">
                  Chapter {i + 1}: {c.title}
                </div>
                <div className="text-sm text-muted-foreground">{c.summary}</div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Chapters */}
      <section className="space-y-12">
        {(chapters as ChapterRow[]).map((ch) => (
          <ChapterEditor
            key={ch.id}
            chapter={ch}
            onSave={handleChapterSave}
          />
        ))}
      </section>
    </div>
  );
}
