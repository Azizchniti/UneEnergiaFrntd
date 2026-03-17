
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Menu, PanelLeft, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  to: string;
  label: string;
  children?: React.ReactNode;
};

const NavLink: React.FC<NavLinkProps> = ({
  to,
  label,
  children
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return <Link to={to} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-accent hover:text-accent-foreground", isActive && "bg-accent text-accent-foreground font-medium")}>
      {children}
      <span>{label}</span>
    </Link>;
};

const Navbar: React.FC<{
  onMenuToggle?: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}> = ({
  onMenuToggle,
  sidebarCollapsed,
  toggleSidebar
}) => {
  const {
    user,
    logout
  } = useAuth();
  
  return <div className="sticky top-0 z-10 glass border-b border-border/40 backdrop-blur-md">
      <div
          className={cn(
            "flex items-center justify-between h-16 w-full px-4 transition-all duration-300",
            sidebarCollapsed ? "md:pl-20" : "md:pl-72"
          )}
        >

        <div className="flex items-center gap-4">
         
          {onMenuToggle && <Button variant="ghost" size="icon" onClick={onMenuToggle} className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>}
          
          <Link to="/" className="flex items-center gap-2">

                  <img
                  src="/logo_hori.png"
                  alt="Foco Hub Icon"
                  className="w-40 h-10 object-contain ml-7"
                />
              
         
            {/* <span className="text-lg font-semibold tracking-tight">Foco Hub</span> */}
          </Link>
        </div>

        <div className="flex items-center gap-4 bg-transparent">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-10 h-10 p-0 rounded-full">
            <div className="w-full h-full flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
              {user?.first_name?.charAt(0).toUpperCase() || "U"}
            </div>
          </Button>

            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span>{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => logout()}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>;
};

export default Navbar;
