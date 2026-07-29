import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/favorites")({
  component: () => (
    <ModulePlaceholder
      icon={Star}
      title="Favorites"
      description="Your saved stories, characters and worlds."
    />
  ),
});
