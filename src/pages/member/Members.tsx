
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Member } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Edit, Trash2, User } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MemberService } from "@/services/members.service";

// Define grade colors mapping
const gradeColors = {
  beginner: "bg-slate-500",
  standard: "bg-blue-500",
  gold: "bg-yellow-500",
  platinum: "bg-violet-500",
  diamond: "bg-emerald-500"
};

const gradeLabels = {
  beginner: "Beginner",
  standard: "Standard",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond"
};

const MemberMembersPage = () => {
  const { user } = useAuth();
  const {  updateMember, deleteMember } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });
;

    useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await MemberService.getAllMembers();
        setMembers(data);
      } catch (error) {
        toast.error("Erro ao buscar membros");
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);
    console.log("All members:", members)

  // Get members in user's squad (where uplineId is the user's id)
  const squadMembers = members.filter(member => 
    member.upline_id === user?.id
  );
  
  // Filter based on search
  const filteredMembers = squadMembers.filter(member => 
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.cpf.includes(searchTerm)
  );

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      cpf: "",
      phone: "",
    });
  };

  // Add a new member


  // Edit an existing member
  const handleEditMember = () => {
    if (!selectedMember) return;
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.cpf || !formData.phone) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      updateMember(selectedMember.id, {
        first_name: formData.name,
        last_name: formData.email,
        cpf: formData.cpf,
        phone: formData.phone,
      });
      setEditDialogOpen(false);
      setSelectedMember(null);
      resetForm();
      toast.success("Membro atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar membro");
    }
  };

  // Delete a member
  const handleDeleteMember = () => {
    if (!selectedMember) return;
    
    try {
      deleteMember(selectedMember.id);
      setDeleteDialogOpen(false);
      setSelectedMember(null);
      toast.success("Membro excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao excluir membro");
    }
  };

  // Prepare to edit a member
  const handleEditDialogOpen = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      name: member.first_name,
      email: member.last_name,
      cpf: member.cpf,
      phone: member.phone,
    });
    setEditDialogOpen(true);
  };

  // Prepare to delete a member
  const handleDeleteDialogOpen = (member: Member) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const handleGenerateInvite = () => {
  if (!user) return;

  const baseUrl = window.location.origin;
  const inviteLink = `${baseUrl}/signup?upline_id=${user.id}`;
  
  navigator.clipboard.writeText(inviteLink);
  toast.success("Link copiado! Envie este link para seu associado.");
};


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meu Squad</h1>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="space-x-2" onClick={handleGenerateInvite}>
              <UserPlus className="h-4 w-4" />
              <span>Gerar link de convite</span>
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Membros do Meu Squad</CardTitle>
          <CardDescription>
            Gerencie os membros que fazem parte do seu squad.
          </CardDescription>
          
          <div className="flex items-center space-x-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome, email ou CPF..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Sobrenome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Graduação</TableHead>
                  <TableHead className="text-right">Vendas (R$)</TableHead>
                  <TableHead className="text-right">Contatos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <User className="h-10 w-10 mb-2" />
                        <p>Nenhum membro encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.first_name}</TableCell>
                      <TableCell>{member.last_name}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>
                        <Badge className={`${gradeColors[member.grade]}`}>
                          {gradeLabels[member.grade]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(member.total_sales)}
                      </TableCell>
                      <TableCell className="text-right">{member.total_contacts}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditDialogOpen(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteDialogOpen(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
            <DialogDescription>
              Atualize os dados do membro selecionado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nome
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-cpf" className="text-right">
                CPF
              </Label>
              <Input
                id="edit-cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Telefone
              </Label>
              <Input
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleEditMember}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Membro</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {selectedMember?.first_name}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Se este membro tiver outros membros no seu squad, eles serão transferidos para você.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteMember}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberMembersPage;
