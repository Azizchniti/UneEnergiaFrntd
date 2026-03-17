
import React, { useState } from "react";
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
function formatDateForInputLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // getMonth() is zero-based
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


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
          Gerencie comunicados, notícias e avisos para os membros
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
            
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? "Editar Comunicado" : "Adicionar Novo Comunicado"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditing 
                      ? "Edite as informações do comunicado abaixo"
                      : "Preencha as informações para criar um novo comunicado."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Título
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      className="col-span-3"
                      placeholder="Título do comunicado"
                      value={currentAnnouncement.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Tipo
                    </Label>
                    <select
                      id="type"
                      name="type"
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={currentAnnouncement.type}
                      onChange={(e) => setCurrentAnnouncement({
                        ...currentAnnouncement, 
                        type: e.target.value as AnnouncementType
                      })}
                    >
                      <option value="news">Notícia</option>
                      <option value="notice">Aviso</option>
                      <option value="announcement">Comunicado</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="content" className="text-right pt-2">
                      Conteúdo
                    </Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Conteúdo do comunicado"
                      className="col-span-3 min-h-[120px]"
                      value={currentAnnouncement.content}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="publish_date" className="text-right">
                      Data de Publicação
                    </Label>
                    <Input
                      id="publish_date"
                      name="publish_date"
                      type="datetime-local"
                      className="col-span-3"
                     value={currentAnnouncement.publish_date 
  ? formatDateForInputLocal(new Date(currentAnnouncement.publish_date))
  : ""}

                      onChange={(e) => setCurrentAnnouncement({
                        ...currentAnnouncement, 
                        publish_date: new Date(e.target.value)
                      })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiry_date" className="text-right">
                      Data de Expiração
                    </Label>
                    <Input
                      id="expiry_date"
                      name="expiry_date"
                      type="datetime-local"
                      className="col-span-3"
                      value={currentAnnouncement.expiry_date 
                        ? new Date(currentAnnouncement.expiry_date)
                            .toISOString()
                            .slice(0, 16) 
                        : ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCurrentAnnouncement({
                          ...currentAnnouncement, 
                          expiry_date: value ? new Date(value) : undefined
                        });
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Publicado</Label>
                    <div className="flex items-center space-x-2 col-span-3">
                      <Switch
                        checked={currentAnnouncement.is_published}
                        onCheckedChange={(checked) => handleSwitchChange("is_published", checked)}
                      />
                      <Label>
                        {currentAnnouncement.is_published ? "Sim" : "Não"}
                      </Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Destacado</Label>
                    <div className="flex items-center space-x-2 col-span-3">
                      <Switch
                        checked={currentAnnouncement.is_highlighted}
                        onCheckedChange={(checked) => handleSwitchChange("is_highlighted", checked)}
                      />
                      <Label>
                        {currentAnnouncement.is_highlighted ? "Sim" : "Não"}
                      </Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddOrUpdateAnnouncement}>
                    {isEditing ? "Atualizar" : "Adicionar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                <div className="space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onToggleHighlight(announcement.id)}
                    title={announcement.is_highlighted ? "Remover destaque" : "Destacar"}
                  >
                    {announcement.is_highlighted ? (
                      <Megaphone className="h-4 w-4" />
                    ) : (
                      <Megaphone className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onTogglePublish(announcement.id)}
                    title={announcement.is_published ? "Despublicar" : "Publicar"}
                  >
                    {announcement.is_published ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(announcement)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(announcement.id)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
