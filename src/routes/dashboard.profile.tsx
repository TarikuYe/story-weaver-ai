import { createFileRoute } from "@tanstack/react-router";
import { User as UserIcon } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/profile")({
  component: () => (
    <ModulePlaceholder
      icon={UserIcon}
      title="Profile"
      description="Manage your display name, avatar and public info."
    />
  ),
});
