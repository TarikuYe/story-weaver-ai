import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/characters")({
  component: () => (
    <ModulePlaceholder
      icon={Users}
      title="Character Studio"
      description="Design characters with backstory, portraits, voices and relationships."
    />
  ),
});
