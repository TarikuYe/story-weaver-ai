import { createFileRoute } from "@tanstack/react-router";
import { Wand2 } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/comics")({
  component: () => (
    <ModulePlaceholder
      icon={Wand2}
      title="Comic Generator"
      description="Turn your chapters into laid-out comic pages with panels and bubbles."
    />
  ),
});
