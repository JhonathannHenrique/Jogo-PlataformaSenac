import { useState } from "react";
import { BarChart3, Home, Users, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavigationItem {
  title: string;
  view: string;
  icon: any;
}

const navigationItems: NavigationItem[] = [
  { title: "Dashboard", view: "dashboard", icon: Home },
  { title: "Relatórios", view: "reports", icon: BarChart3 },
  { title: "Usuários", view: "users", icon: Users },
];

interface AppSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const { user, setUser } = useUser();
  const collapsed = state === "collapsed";

  const handleLogout = () => {
    setUser(null);
  };

  const isActive = (view: string) => currentView === view;

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-bold">
            {!collapsed && "Jogo de Pontuação"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`transition-smooth ${
                      isActive(item.view) 
                        ? "bg-primary text-primary-foreground glow-primary" 
                        : "hover:bg-primary/20"
                    }`}
                  >
                    <button
                      onClick={() => onViewChange(item.view)}
                      className="w-full flex items-center"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  className="hover:bg-destructive/20 text-destructive"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Sair</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}