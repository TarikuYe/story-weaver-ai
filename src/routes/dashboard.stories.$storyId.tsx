import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/stories/$storyId")({
  component: StoryViewer,
});

type OutlineJSON = {
  title?: string;
  logline?: string;
  chapters?: { title: string; summary: string }[];
};

function StoryViewer() {
  const { storyId } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      const [{ data: story, error: e1 }, { data: chapters, error: e2 }] = await Promise.all([
        supabase.from("stories").select("*").eq("id", storyId).maybeSingle(),
        supabase
          .from("chapters")
          .select("*")
          .eq("story_id", storyId)
          .order("chapter_number", { ascending: true }),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return { story, chapters: chapters ?? [] };
    },
    refetchInterval: (q) =>
      q.state.data?.story?.status === "generating" ? 3000 : false,
  });

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

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 md:p-10">
      <Link
        to="/dashboard/stories"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to library
      </Link>

      <header className="space-y-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {story.genre} · {story.tone} · {story.language}
        </div>
        <h1 className="font-display text-4xl text-gradient md:text-5xl">{story.title}</h1>
        {outline?.logline && (
          <p className="text-lg italic text-muted-foreground">{outline.logline}</p>
        )}
      </header>

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

      <section className="space-y-10">
        {chapters.map((ch) => (
          <article key={ch.id} className="space-y-3">
            <h2 className="font-display text-3xl">
              Chapter {ch.chapter_number}: {ch.title}
            </h2>
            <div className="prose prose-invert max-w-none prose-p:leading-relaxed">
              <ReactMarkdown>{ch.content}</ReactMarkdown>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
