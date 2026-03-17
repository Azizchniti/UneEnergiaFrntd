
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Check, 
  Clock, 
  File, 
  FileText, 
  Megaphone, 
  Pencil, 
  Plus, 
  Trash2,
  Calendar,
  UserCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { generateId } from "@/utils/dataUtils";
import { Announcement, AnnouncementType } from "@/types";
import { useAnnouncementContext } from "@/contexts/AnnouncementContext";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { AnnouncementViewService } from "@/services/announcementviews.services";

// Tipos de dados para comunicados e notícias


// Dados simulados para exemplo

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
  const { members } = useData();
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


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentAnnouncement({ ...currentAnnouncement, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setCurrentAnnouncement({ ...currentAnnouncement, [name]: checked });
  };

const handleAddOrUpdateAnnouncement = async () => {
  if (!currentAnnouncement.title || !currentAnnouncement.content) {
    toast.error("Preencha todos os campos obrigatórios");
    return;
  }

  if (isEditing && currentAnnouncement.id) {
    await updateAnnouncement(currentAnnouncement.id, currentAnnouncement);
    toast.success("Comunicado atualizado com sucesso!");
  } else {
    const { id, created_at, updated_at, ...data } = currentAnnouncement;
    const success = await addAnnouncement(data as Omit<Announcement, "id" | "created_at" | "updated_at">);
    if (!success) return;
    toast.success("Comunicado criado com sucesso!");
  }

  resetForm();
  setDialogOpen(false);
};


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

  const resetForm = () => {
    setCurrentAnnouncement({
      title: "",
      content: "",
      type: "news",
      publish_date: new Date(),
      expiry_date: undefined,
      is_published: false,
      is_highlighted: false
    });
    setIsEditing(false);
  };

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
              announcements={announcements} 
              onEdit={handleEditAnnouncement}
              onDelete={handleDeleteAnnouncement}
              onTogglePublish={handleTogglePublish}
              onToggleHighlight={handleToggleHighlight}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="news" className="space-y-4">
            <RenderAnnouncements 
              announcements={announcements.filter(a => a.type === 'news')} 
              onEdit={handleEditAnnouncement}
              onDelete={handleDeleteAnnouncement}
              onTogglePublish={handleTogglePublish}
              onToggleHighlight={handleToggleHighlight}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="notice" className="space-y-4">
            <RenderAnnouncements 
              announcements={announcements.filter(a => a.type === 'notice')} 
              onEdit={handleEditAnnouncement}
              onDelete={handleDeleteAnnouncement}
              onTogglePublish={handleTogglePublish}
              onToggleHighlight={handleToggleHighlight}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="announcement" className="space-y-4">
            <RenderAnnouncements 
              announcements={announcements.filter(a => a.type === 'announcement')} 
              onEdit={handleEditAnnouncement}
              onDelete={handleDeleteAnnouncement}
              onTogglePublish={handleTogglePublish}
              onToggleHighlight={handleToggleHighlight}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="highlighted" className="space-y-4">
            <RenderAnnouncements 
              announcements={announcements.filter(a => a.is_highlighted)} 
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
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleHighlight,
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
