import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/settings")({
  component: () => (
    <ModulePlaceholder
      icon={Settings}
      title="Settings"
      description="Preferences, language and notifications."
    />
  ),
});
