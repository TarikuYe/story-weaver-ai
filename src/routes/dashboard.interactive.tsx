import { createFileRoute } from "@tanstack/react-router";
import { GitBranch } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/interactive")({
  component: () => (
    <ModulePlaceholder
      icon={GitBranch}
      title="Interactive Stories"
      description="Branching narratives with choices, endings and a visual story graph."
    />
  ),
});
