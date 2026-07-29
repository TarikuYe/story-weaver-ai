import { createFileRoute } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/images")({
  component: () => (
    <ModulePlaceholder
      icon={ImageIcon}
      title="Image Studio"
      description="Style-locked illustrations for every scene in your project."
    />
  ),
});
