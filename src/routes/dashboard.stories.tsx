import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/stories")({
  component: () => (
    <ModulePlaceholder
      icon={BookOpen}
      title="AI Story Generator"
      description="Turn a prompt into a full novel — outline, chapters, cover, ending."
    />
  ),
});
