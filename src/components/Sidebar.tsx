
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  Users,
  Phone,
  UserCircle,
  Crown,
  DollarSign,
  ChevronRight,
  X,
  LineChart,
  Trophy,
  Award,
  PlusCircle,
  PanelLeft,
  PanelRight,
  FileText,
  GraduationCap,
  Megaphone,
  ChevronLeft,
  LucideIcon,
  Calendar
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUnreadAnnouncements } from "@/hooks/useUnreadAnnouncements";
import supabase from "@/integrations/supabase/client";
import { AnnouncementService } from "@/services/announcement.services";
import { AnnouncementViewService } from "@/services/announcementviews.services";
import { Announcement } from "@/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}
type LinkItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  key?: string;
  count?: number;
};

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  isCollapsed, 
  toggleCollapse 
}) => {
  
  const { user } = useAuth();
  
  console.log("Final user object for API calls:", user);

  const location = useLocation();
  
  const isAdmin = user?.role === "admin";
   const unreadCount = useUnreadAnnouncements(user.id);
   const [unseenCount, setUnseenCount] = useState(0);
const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
  const markAllAsViewed = async () => {
    if (!user?.id || announcements.length === 0) return;

    try {
      // Mark each announcement as viewed
      for (const ann of announcements) {
        await AnnouncementViewService.createView(ann.id, user.id);
      }

      // 👇 Fetch unseen count again immediately after marking them all as viewed
      const count = await AnnouncementViewService.getUnseenCount(user.id);
      console.log('Refetched unseen count after marking as viewed:', count);
      setUnseenCount(count);
    } catch (err) {
      console.error("Error in marking viewed or refetching unseen count", err);
    }
  };

  markAllAsViewed();
}, [announcements, user]);

  
useEffect(() => {
  const fetchUnseen = async () => {
    if (!user?.id) return;

    try {
      const count = await AnnouncementViewService.getUnseenCount(user.id);
      setUnseenCount(count);
    } catch (error) {
      console.error("Failed to fetch unseen count", error);
    }
  };

  // Fetch unseen count on login or when route changes
  fetchUnseen();
}, [user, location.pathname]);



  const adminLinks = [
    {
      title: "Parceiros",
      href: "/admin/members",
      icon: Users,
    },
    {
      title: "Treinamentos",
      href: "/admin/graduation",
      icon: GraduationCap,
    },
    {
      title: "Mural",
      href: "/admin/mural",
      icon: Megaphone,
      key: "admin-mural",
    },
    {
      title: "Calendário",
      href: "/admin/calendar",
      icon: Calendar,
    }


  ];

  const memberLinks = [
    {
      title: "Meu Perfil",
      href: "/member/profile",
      icon: UserCircle,
    },
   
    {
      title: "Mural",
      href: "/member/mural",
      icon: Megaphone,
      count: unreadCount,
      key: "community",
    },
    {
       title: "Treinamentos",
      href: "/member/grade",
      icon: GraduationCap,
     },
    {
      title: "Calendário",
      href: "/member/calendar",
      icon: Calendar,
    },
  ];

  const links = isAdmin ? adminLinks : memberLinks;

return (
  <div
    className={cn(
      "fixed inset-y-0 left-0 z-20 flex flex-col transform transition-all duration-300 ease-in-out",
      "backdrop-blur-xl bg-gradient-to-b from-[#0b1f1a] via-[#0f2e27] to-[#071412]",
      "border-r border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.08)]",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      isCollapsed ? "w-20" : "w-64 md:w-72"
    )}
  >
    {/* HEADER */}
    <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="mr-2 text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>

        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2 px-2">
            <img
              src="/Logo2-bg.png"
              alt="Une Energia"
              className="w-36 h-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </Link>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="md:hidden text-white/60 hover:text-white"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>

    {/* NAVIGATION */}
    <ScrollArea className="flex-1 px-3 py-4">
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
              "text-white/70 hover:text-white hover:bg-white/5 hover:translate-x-1",
              "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:bg-emerald-400 before:rounded-r-full before:transition-all before:duration-300",
              location.pathname === link.href
                ? "bg-white/10 text-white before:h-6 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : "before:h-0"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3 relative",
                isCollapsed && "justify-center w-full"
              )}
            >
              <link.icon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />

              {!isCollapsed && <span>{link.title}</span>}

              {/* Notification badge */}
              {!isAdmin && link.title === "Mural" && unseenCount > 0 && (
                <span className="absolute -top-1 left-5 bg-gradient-to-r from-emerald-400 to-green-500 text-black text-xs rounded-full px-2 py-0.5 font-semibold shadow-md">
                  {unseenCount}
                </span>
              )}
            </div>

            {!isCollapsed && (
              <ChevronRight className="w-4 h-4 opacity-0 transition-all group-hover:opacity-70 group-hover:translate-x-1 text-white/60" />
            )}
          </Link>
        ))}
      </nav>

      {/* ADMIN SECTION */}
      {!isCollapsed && isAdmin && (
        <div className="mt-6">
          <div className="px-3 py-2">
            <div className="mt-3 space-y-2"></div>
          </div>
        </div>
      )}
    </ScrollArea>

    {/* USER SECTION */}
    {!isCollapsed ? (
      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3 py-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-black font-bold shadow-lg">
            {user?.first_name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate">
              {user?.first_name + " " + user?.last_name}
            </span>
            <span className="text-xs text-white/50 truncate">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    ) : (
      <div className="p-4 border-t border-white/10 flex justify-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-black font-bold shadow-lg">
          {user?.first_name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    )}
  </div>
);
};

export default Sidebar;
