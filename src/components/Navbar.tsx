
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
  
return (
<div
  className={cn(
    "sticky top-0 z-30 h-16 backdrop-blur-xl bg-gradient-to-r from-[#071412]/90 via-[#0b1f1a]/80 to-[#071412]/90 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]",
    sidebarCollapsed
      ? "md:left-20 md:w-[calc(100%-5rem)]"
      : "md:left-72 md:w-[calc(100%-18rem)]"
  )}
>   <div className="flex items-center justify-between h-full px-4">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="md:hidden text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

  
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-10 h-10 p-0 rounded-full hover:bg-white/10 transition-all"
            >
              <div className="w-full h-full flex items-center justify-center rounded-full 
              bg-gradient-to-br from-emerald-400 to-green-600 text-black text-sm font-bold shadow-lg">
                {user?.first_name?.charAt(0).toUpperCase() || "U"}
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-[#0b1f1a]/95 backdrop-blur-xl border border-white/10 text-white shadow-xl"
          >
            <DropdownMenuLabel className="flex flex-col space-y-1">
              <span className="font-medium">
                {user?.first_name + " " + user?.last_name}
              </span>
              <span className="text-xs text-white/50 truncate">
                {user?.email}
              </span>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuItem
              className="flex items-center cursor-pointer hover:bg-white/10 focus:bg-white/10 transition-all"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-2 text-emerald-400" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    {/* ✨ Optional subtle glow line */}
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
  </div>
);
};

export default Navbar;
