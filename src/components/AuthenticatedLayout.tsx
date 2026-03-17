
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "member" | undefined;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentPath = location.pathname;
  const isAdminPath = currentPath.startsWith("/admin");
  const isMemberPath = currentPath.startsWith("/member");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

   if (!user) {
     return <Navigate to="/login" replace />;
   }

  //  if (requiredRole && user.role !== requiredRole) {
  //  //   Redirecionar para o dashboard apropriado baseado no papel
  //    return <Navigate to={user.role === "admin" ? "/admin" : "/member"} replace />;
  //  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCollapseSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Overlay que aparece quando o sidebar está aberto em dispositivos móveis
  const SidebarOverlay = () => (
    <div
      className={cn(
        "fixed inset-0 z-10 bg-background/80 backdrop-blur-sm md:hidden transition-opacity duration-300",
        sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={() => setSidebarOpen(false)}
    />
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        onMenuToggle={toggleSidebar} 
        sidebarCollapsed={sidebarCollapsed} 
        toggleSidebar={handleCollapseSidebar} 
      />
      
      <div className="flex flex-1">
        <SidebarOverlay />
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          toggleCollapse={handleCollapseSidebar}
        />
        
        <main className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "md:pl-20" : "md:pl-72"
        )}>
          <div className="container p-4 mx-auto max-w-7xl animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
