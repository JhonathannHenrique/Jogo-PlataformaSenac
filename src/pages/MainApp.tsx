import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardView } from '@/components/DashboardView';
import { ReportsView } from '@/components/ReportsView';
import { UsersView } from '@/components/UsersView';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User } from 'lucide-react';

export const MainApp: React.FC = () => {
  const { user, setUser } = useUser();
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogout = () => {
    setUser(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Global header with trigger */}
        <header className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between bg-background/80 backdrop-blur-sm border-b border-border z-40 px-4">
          <SidebarTrigger className="ml-2" />
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Olá,</span>
              <span className="font-semibold gradient-primary bg-clip-text text-transparent">
                {user?.name}!
              </span>
            </div>
            
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </header>

        {/* Sidebar */}
        <AppSidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />

        {/* Main content */}
        <main className="flex-1 pt-12">
          <div className="p-6">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};