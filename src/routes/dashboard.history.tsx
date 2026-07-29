import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/history")({
  component: () => (
    <ModulePlaceholder
      icon={History}
      title="History"
      description="Everything you've generated, searchable."
    />
  ),
});
