import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/dialogues")({
  component: () => (
    <ModulePlaceholder
      icon={MessageSquare}
      title="Dialogue Generator"
      description="Emotion-tuned conversations between your characters."
    />
  ),
});
