
import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Clock, 
  File, 
  FileText, 
  Megaphone, 
  Calendar,
  UserCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Announcement, AnnouncementType } from "@/types";
import { useAnnouncementContext } from "@/contexts/AnnouncementContext";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { AnnouncementViewService } from "@/services/announcementviews.services";

const typeLabels: Record<AnnouncementType, { label: string, icon: React.ElementType, color: string }> = {
  news: { 
    label: "Notícia", 
    icon: FileText, 
    color: "bg-green-100 text-green-800 border-green-300" 
  },
  notice: { 
    label: "Aviso", 
    icon: Megaphone, 
    color: "bg-yellow-100 text-yellow-800 border-yellow-300" 
  },
  announcement: { 
    label: "Comunicado", 
    icon: File, 
    color: "bg-blue-100 text-blue-800 border-blue-300" 
  }
};

const AdminMural: React.FC = () => {
const {
  announcements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  findAnnouncement,
} = useAnnouncementContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement>>({
    title: "",
    content: "",
    type: "news",
    publish_date: new Date(),
    expiry_date: undefined,
    is_published: false,
    is_highlighted: false
  });


const { user } = useAuth(); // 👈 get current user

useEffect(() => {
  const markAllAsViewed = async () => {
    if (!user || !announcements.length) return;

    try {
      await Promise.all(
        announcements.map((announcement) =>
          AnnouncementViewService.createView(announcement.id, user.id)
        )
      );
      console.log('Marked all as viewed');
    } catch (err) {
      console.error('Failed to mark some announcements as viewed', err);
    }
  };

  markAllAsViewed();
}, [user, announcements]);



  const handleEditAnnouncement = (announcement: Announcement) => {
    setCurrentAnnouncement({
      ...announcement,
      publish_date: new Date(announcement.publish_date),
      expiry_date: announcement.expiry_date ? new Date(announcement.expiry_date) : undefined
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDeleteAnnouncement = (id: string) => {
    deleteAnnouncement(id);
    toast.success("Comunicado excluído com sucesso!");
  };

const handleTogglePublish = (id: string) => {
  const announcement = announcements.find(a => a.id === id);
  if (!announcement) return;

  updateAnnouncement(id, { is_published: !announcement.is_published });
  toast.success(`Comunicado ${announcement.is_published ? 'despublicado' : 'publicado'} com sucesso!`);
};

const handleToggleHighlight = (id: string) => {
  const announcement = announcements.find(a => a.id === id);
  if (!announcement) return;

  updateAnnouncement(id, { is_highlighted: !announcement.is_highlighted });
  const action = announcement.is_highlighted ? 'removido dos' : 'adicionado aos';
  toast.success(`Comunicado ${action} destaques com sucesso!`);
};

function parseUTCDate(date: string | Date | undefined): Date | null {
  if (!date) return null;

  if (date instanceof Date) return date; // already a Date, return as is

  // if string, replace space with T to parse correctly
  return new Date(date.replace(" ", "T"));
}

function getActiveAnnouncements(announcements: Announcement[]) {
  const now = new Date();

  return announcements.filter(a => {
    if (!a.is_published) return false;

    const publishDate = parseUTCDate(a.publish_date);
    const expiryDate = parseUTCDate(a.expiry_date);

    if (!publishDate) return false;

    return publishDate <= now && (!expiryDate || expiryDate > now);
  });
}

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mural</h2>
        <p className="text-muted-foreground">
          Comunicados, notícias e avisos
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="news">Notícias</TabsTrigger>
              <TabsTrigger value="notice">Avisos</TabsTrigger>
              <TabsTrigger value="announcement">Comunicados</TabsTrigger>
              <TabsTrigger value="highlighted">Destacados</TabsTrigger>
            </TabsList>
            
           
          </div>
          
          <TabsContent value="all" className="space-y-4">
            <RenderAnnouncements 
              announcements={getActiveAnnouncements(announcements).filter(a =>  a.is_published)} 
              onEdit={handleEditAnnouncement}
              onDelete={handleDeleteAnnouncement}
              onTogglePublish={handleTogglePublish}
              onToggleHighlight={handleToggleHighlight}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="news" className="space-y-4">
            <RenderAnnouncements 
              announcements={getActiveAnnouncements(announcements).filter(a => a.type === 'news' && a.is_published)} 
              onEdit={handleEditAnnouncement}
              onDelete={handleDeleteAnnouncement}
              onTogglePublish={handleTogglePublish}
              onToggleHighlight={handleToggleHighlight}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="notice" className="space-y-4">
            <RenderAnnouncements 
              announcements={getActiveAnnouncements(announcements).filter(a => a.type === 'notice' && a.is_published)} 
              onEdit={handleEditAnnouncement}
              onDelete={handleDeleteAnnouncement}
              onTogglePublish={handleTogglePublish}
              onToggleHighlight={handleToggleHighlight}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="announcement" className="space-y-4">
            <RenderAnnouncements 
              announcements={getActiveAnnouncements(announcements).filter(a => a.type === 'announcement' && a.is_published)} 
              onEdit={handleEditAnnouncement}
              onDelete={handleDeleteAnnouncement}
              onTogglePublish={handleTogglePublish}
              onToggleHighlight={handleToggleHighlight}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="highlighted" className="space-y-4">
            <RenderAnnouncements 
              announcements={getActiveAnnouncements(announcements).filter(a => a.is_highlighted && a.is_published)} 
              onEdit={handleEditAnnouncement}
              onDelete={handleDeleteAnnouncement}
              onTogglePublish={handleTogglePublish}
              onToggleHighlight={handleToggleHighlight}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface RenderAnnouncementsProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onToggleHighlight: (id: string) => void;
  formatDate: (date: Date | undefined) => string;
}

const RenderAnnouncements: React.FC<RenderAnnouncementsProps> = ({
  announcements,
  formatDate,
}) => {
  if (announcements.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">Nenhum comunicado encontrado</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Crie um novo comunicado clicando no botão acima.
        </p>
      </div>
    );
  }
  
  return (
    <>
      {announcements.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).map((announcement) => {
        const TypeIcon = typeLabels[announcement.type].icon;
        
        return (
          <Card key={announcement.id} className={`border-l-4 ${announcement.is_highlighted ? 'border-l-primary' : 'border-l-border'}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-center">
                  <Badge className={typeLabels[announcement.type].color}>
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {typeLabels[announcement.type].label}
                  </Badge>
                  {announcement.is_highlighted && (
                    <Badge className="bg-primary/10 text-primary border-primary/30">
                      Destacado
                    </Badge>
                  )}
                </div>
               
              </div>
              <CardTitle className="text-xl mt-2">{announcement.title}</CardTitle>
              
              <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Publicado em: {formatDate(announcement.publish_date)}
                </div>
                {announcement.expiry_date && (
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Expira em: {formatDate(announcement.expiry_date)}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="text-sm whitespace-pre-line">
                {announcement.content}
              </div>
            </CardContent>
            
            <CardFooter className="pt-0">
              <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center">
                  <UserCircle className="h-3 w-3 mr-1" />
                  Por Administrador
                </div>
                <div>
                  Última atualização: {formatDate(announcement.updated_at)}
                </div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </>
  );
};

export default AdminMural;
