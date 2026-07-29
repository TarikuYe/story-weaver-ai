import { createFileRoute } from "@tanstack/react-router";
import { Mic } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/audiobooks")({
  component: () => (
    <ModulePlaceholder
      icon={Mic}
      title="Audiobook Studio"
      description="Multi-voice narration with background scoring and chapter navigation."
    />
  ),
});
