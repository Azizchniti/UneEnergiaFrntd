import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Announcement } from "@/types/index";
import { AnnouncementService } from "@/services/announcement.services";
import { toast } from "sonner";

type AnnouncementContextType = {
  announcements: Announcement[];
  addAnnouncement: (data: Omit<Announcement, "id" | "created_at" | "updated_at">) => Promise<boolean>;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  findAnnouncement: (id: string) => Announcement | undefined;
};

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export const AnnouncementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const refreshAnnouncements = async () => {
    try {
      const fetched = await AnnouncementService.getAllAnnouncements();
      setAnnouncements(fetched);
    } catch (err) {
      toast.error("Erro ao carregar os comunicados");
    }
  };

  useEffect(() => {
    refreshAnnouncements();
  }, []);

  const addAnnouncement = async (
    data: Omit<Announcement, "id" | "created_at" | "updated_at">
  ): Promise<boolean> => {
    try {
      await AnnouncementService.createAnnouncement(data);
      await refreshAnnouncements();
      toast.success("Comunicado criado com sucesso");
      return true;
    } catch (err) {
      toast.error("Erro ao criar o comunicado");
      return false;
    }
  };

  const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    try {
      await AnnouncementService.updateAnnouncement(id, data);
      await refreshAnnouncements();
      toast.success("Comunicado atualizado");
    } catch (err) {
      toast.error("Erro ao atualizar o comunicado");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await AnnouncementService.deleteAnnouncement(id);
      await refreshAnnouncements();
      toast.success("Comunicado deletado");
    } catch (err) {
      toast.error("Erro ao deletar o comunicado");
    }
  };

  const findAnnouncement = (id: string) => announcements.find(a => a.id === id);

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        findAnnouncement,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncementContext = (): AnnouncementContextType => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error("useAnnouncementContext deve ser usado dentro de um AnnouncementProvider");
  }
  return context;
};
