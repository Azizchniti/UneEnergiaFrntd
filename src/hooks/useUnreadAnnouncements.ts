import supabase from "@/integrations/supabase/client";
import { useEffect, useState } from "react";


export function useUnreadAnnouncements(userId: string | undefined) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      // Fetch all published announcements
      const { data: announcements, error: announcementsError } = await supabase
        .from("announcements")
        .select("id")
        .eq("is_published", true);

      if (announcementsError) {
        console.error("Error fetching announcements", announcementsError);
        return;
      }

      // Fetch views by this user
      const { data: views, error: viewsError } = await supabase
        .from("announcement_views")
        .select("announcement_id")
        .eq("user_id", userId);

      if (viewsError) {
        console.error("Error fetching views", viewsError);
        return;
      }

      const viewedIds = new Set(views.map((v) => v.announcement_id));
      const unread = announcements.filter(a => !viewedIds.has(a.id));
      setCount(unread.length);
    };

    fetchUnreadCount();
  }, [userId]);

  return count;
}
