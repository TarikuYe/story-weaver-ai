import { createFileRoute } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/worlds")({
  component: () => (
    <ModulePlaceholder
      icon={Globe2}
      title="World Builder"
      description="Design kingdoms, magic, cultures, geography and history."
    />
  ),
});
