import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/dashboard/billing")({
  component: () => (
    <ModulePlaceholder
      icon={CreditCard}
      title="Billing"
      description="Manage your plan, credits and payment methods."
    />
  ),
});
