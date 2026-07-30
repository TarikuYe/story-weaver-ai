import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  BookOpen,
  Users,
  Globe2,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  GitBranch,
  Wand2,
  Star,
  History,
  Settings,
  CreditCard,
  User as UserIcon,
  Sparkles,
  LayoutTemplate,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const create = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Stories", url: "/dashboard/stories", icon: BookOpen },
  { title: "Characters", url: "/dashboard/characters", icon: Users },
  { title: "Worlds", url: "/dashboard/worlds", icon: Globe2 },
  { title: "Images", url: "/dashboard/images", icon: ImageIcon },
  { title: "Dialogues", url: "/dashboard/dialogues", icon: MessageSquare },
  { title: "Comics", url: "/dashboard/comics", icon: Wand2 },
  { title: "Audiobooks", url: "/dashboard/audiobooks", icon: Mic },
  { title: "Interactive", url: "/dashboard/interactive", icon: GitBranch },
];
const library = [
  { title: "Templates", url: "/dashboard/templates", icon: LayoutTemplate },
  { title: "Favorites", url: "/dashboard/favorites", icon: Star },
  { title: "History", url: "/dashboard/history", icon: History },
  { title: "Search", url: "/dashboard/search", icon: Search },
];
const account = [
  { title: "Profile", url: "/dashboard/profile", icon: UserIcon },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(url);

  const Section = ({ label, items }: { label: string; items: typeof create }) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <Link to={item.url} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-primary)] shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg">
              StoryForge <span className="text-gradient">AI</span>
            </span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <Section label="Create" items={create} />
        <Section label="Library" items={library} />
        <Section label="Account" items={account} />
      </SidebarContent>
    </Sidebar>
  );
}
