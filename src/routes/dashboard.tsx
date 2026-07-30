import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, Search, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth-context";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  head: () => ({
    meta: [
      { title: "Studio — StoryForge AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function DashboardLayout() {
  const { session, user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile-credits", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("credits, subscription")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as { credits: number; subscription: string } | null;
    },
  });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="glass sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/5 px-4 gap-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="font-display text-lg">Studio</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Credits display */}
              <Link
                to="/dashboard/billing"
                className="hidden sm:flex items-center gap-1.5 glass rounded-full px-3 py-1.5 text-xs hover:shadow-elegant transition-all"
              >
                <Zap className="h-3.5 w-3.5 text-gold" />
                <span className="font-semibold">{profile?.credits?.toLocaleString() ?? 0}</span>
                <span className="text-muted-foreground">credits</span>
              </Link>

              {/* Search button */}
              <Button variant="ghost" size="icon" asChild className="shrink-0">
                <Link to="/dashboard/search" aria-label="Search">
                  <Search className="h-4 w-4" />
                </Link>
              </Button>

              <UserMenu />
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
