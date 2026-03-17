
import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Plus, 
  Search, 
  Trash2, 
  User, 
  UserPlus 
} from "lucide-react";
import { MemberService } from "@/services/members.service";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Member } from "@/types/member.types";
import { MemberGrade, profile } from "@/types";
import axios from "axios";
import { signUp } from "@/services/auth-service";
import { UserService } from "@/services/user.service";

const gradeColors = {
  beginner: "bg-slate-500",
  silver: "bg-blue-500",
  gold: "bg-yellow-500",
  platinum: "bg-violet-500",
  diamond: "bg-emerald-500"
};

const gradeLabels = {
  beginner: "Beginner",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond"
};

const MembersPage = () => {
const [members, setMembers] = useState<Member[]>([]);
const [users, setUsers] = useState<profile[]>([]);
 const [loading, setLoading] = useState<boolean>(true);
  const {  updateMember, deleteMember } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Member | null;
    direction: 'ascending' | 'descending';
  }>({ key: null, direction: 'ascending' });


  const loadMembersAndUsers = async () => {
    setLoading(true); // optional: only set once
    try {
      const [memberData, userData] = await Promise.all([
        MemberService.getAllMembers(),
        UserService.getAllUsers(),
      ]);

      setMembers(memberData);
      setUsers(userData);
    } catch (error) {
      toast.error("Erro ao buscar membros ou usuários");
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  loadMembersAndUsers();
}, []);
const admins = users.filter(u => u.role !== "member");

 const loadPendingMembers = async () => {
    setLoading(true);
    try {
      const data = await MemberService.getMembersByStatus("pending");
      setPendingMembers(data);
    } catch (error) {
      toast.error("Erro ao buscar membros pendentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingMembers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await MemberService.approveMember(id);
       toast.success("Membro aprovado com sucesso", { duration: 4000 });
      loadPendingMembers(); // refresh list
    } catch (error) {
      toast.error("Erro ao aprovar membro");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await MemberService.rejectMember(id);
      toast.success("Membro rejeitado com sucesso", { duration: 4000 });
      loadPendingMembers(); // refresh list
    } catch (error) {
      toast.error("Erro ao rejeitar membro");
    }
  };



  // Formulário para novo membro
const [formData, setFormData] = useState({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  cpf: "",
  grade: "",  
  phone: "",
  role: "member", // Default
});

  // Filtrar membros baseado na busca
  // const filteredMembers = members.filter(member => 
  //   // member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   // member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   member.cpf.includes(searchTerm)
  // );

  // Ordenar membros
  // const sortedMembers = React.useMemo(() => {
  //   let sortableMembers = [...filteredMembers];
  //   if (sortConfig.key !== null) {
  //     sortableMembers.sort((a, b) => {
  //       if (a[sortConfig.key!] < b[sortConfig.key!]) {
  //         return sortConfig.direction === 'ascending' ? -1 : 1;
  //       }
  //       if (a[sortConfig.key!] > b[sortConfig.key!]) {
  //         return sortConfig.direction === 'ascending' ? 1 : -1;
  //       }
  //       return 0;
  //     });
  //   }
  //   return sortableMembers;
  // }, [filteredMembers, sortConfig]);

  const requestSort = (key: keyof Member) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName: keyof Member) => {
    if (sortConfig.key !== columnName) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  // Funções para lidar com os formulários
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
      console.log(`Updating ${name}: ${value}`);
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData
    });
  };

  const resetForm = () => {
    setFormData({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  cpf: "",
  grade:"",
  phone: "",
  role: "member", // Default
    });
  };

  // Adicionar um novo membro
const handleAddMember = async () => {
  
  const { first_name, last_name, email, password, role, cpf, phone } = formData;

  if (!first_name || !last_name || !email || !password) {
    toast.error("Preencha todos os campos obrigatórios");
    return;
  }
  console.log("Submitting formData:", formData);


  try {
    const newUser = await signUp(
      email,
      password,
      role,
      first_name,
      last_name,
      null,
      cpf,
      phone
    );

    if (newUser) {
      toast.success("Membro criado com sucesso. Verifique o email de ativação.");
      resetForm();
      setAddDialogOpen(false);
        await loadPendingMembers();
    } else {
      toast.error("Erro ao criar membro. Verifique os dados e tente novamente.");
    }
  } catch (error) {
    toast.error("Erro inesperado ao criar membro.");
    console.error(error);
  }
};
const userById = React.useMemo(() => {
  const map = new Map();
  users.forEach(user => map.set(user.id, user));
  return map;
}, [users]);


  // Editar um membro existente
  const handleEditMember = async () => {
  if (!selectedMember) return;

  if (!formData.first_name || !formData.last_name || !formData.cpf || !formData.phone) {
    toast.error("Preencha todos os campos obrigatórios");
    return;
  }

  try {
    // Await update to complete
    await updateMember(selectedMember.id, {
      first_name: formData.first_name,
      last_name: formData.last_name,
      cpf: formData.cpf,
      phone: formData.phone,
      grade: formData.grade
    });

    toast.success("Membro atualizado com sucesso");
    
    // Refresh the members list (you need to expose this function outside useEffect)
    await loadMembersAndUsers();

    setEditDialogOpen(false);
    setSelectedMember(null);
    resetForm();
  } catch (error) {
    toast.error("Erro ao atualizar membro");
    console.error(error);
  }
};

  // Excluir um membro
const handleDeleteMember = async () => {
  if (!selectedMember && !selectedUserId) return;

  try {
    if (selectedMember) {
      await UserService.deleteUser(selectedMember.id);
      toast.success("Membro excluído com sucesso");
    } else if (selectedUserId) {
      await UserService.deleteUser(selectedUserId);
      toast.success("Administrador excluído com sucesso");
    }

    await loadMembersAndUsers(); // Refresh both lists
    setDeleteDialogOpen(false);
    setSelectedMember(null);
    setSelectedUserId(null);
  } catch (error) {
    console.log("Trying to delete ID:", selectedMember?.id || selectedUserId);
    toast.error("Erro ao excluir usuário");
    console.error(error);
  }
};



  // Preparar para editar um membro
  const handleEditDialogOpen = (member: Member) => {
  setSelectedMember(member);
  setFormData({
    first_name: member.first_name,
    last_name: member.last_name,
    email: "",        // default or fetch if available
    password: "",     // keep empty for security
    cpf: member.cpf,
    phone: member.phone,
    role: "member",   // or use member.role if available
    grade: member.grade,
  });
  setEditDialogOpen(true);
};


  // Preparar para excluir um membro
  const handleDeleteDialogOpen = (member: Member) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };


  // Editar um usuário administrador

  const [formPata, setFormPata] = useState({
  first_name: "",
  last_name: "",
  email: "",
  password: "", // keep if you're using it later
  cpf: "",
  grade: "",    // only used for members
  phone: "",
  role: "admin", // member/admin
});

const handleEditAdminDialogOpen = (admin: profile) => {
  setSelectedMember(null); // Clear member
  setSelectedUserId(admin.id); // <-- THIS is missing

  setFormPata({
    first_name: admin.first_name,
    last_name: admin.last_name,
    email: admin.email,
    password: "",       // optional
    cpf: admin.cpf || "",
    grade: "",          // not used for admins
    phone: admin.phone || "",
    role: admin.role,
  });
console.log("Editing admin:", admin);

  setEditDialogOpen(true);
};

const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

const handleEditUser = async () => {
  if (!selectedUserId) return;

  // Validate fields
  if (!formPata.first_name || !formPata.last_name || !formPata.email) {
    toast.error("Preencha todos os campos obrigatórios");
    return;
  }

  try {
    await UserService.updateUser(selectedUserId, {
      first_name: formPata.first_name,
      last_name: formPata.last_name,
      email: formPata.email,
      cpf: formPata.cpf,
      phone: formPata.phone,
    });
    toast.success("Administrador atualizado com sucesso");
    const refreshedUsers = await UserService.getAllUsers();
    setUsers(refreshedUsers);
    setEditDialogOpen(false);
    setSelectedUserId(null);
    resetFormPata();
  } catch (error) {
    toast.error("Erro ao atualizar administrador");
  }
};
const resetFormPata = () => {
  setFormPata({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    cpf: "",
    grade: "",
    phone: "",
    role: "admin",
  });
};

const handleConfirmEdit = () => {
  if (selectedMember) {
    handleEditMember();
  } else {
    handleEditUser();
  }
};


// Excluir um usuário administrador
const handleDeleteUser = async (userId: string) => {
  try {
    await UserService.deleteUser(userId);
    toast.success("Administrador excluído com sucesso");
    setDeleteDialogOpen(false);
  } catch (error) {
    toast.error("Erro ao excluir administrador");
  }
};


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestão de Parceiros</h1>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Novo Membro</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Membro</DialogTitle>
              <DialogDescription>
                Preencha os dados para cadastrar um novo membro na plataforma.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="first_name" className="text-right">Nome</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="last_name" className="text-right">Sobrenome</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>
                <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="cpf" className="text-right">CPF</Label>
          <Input
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>


        <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="role" className="text-right">Role</Label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="col-span-3 rounded-md border p-2"
        >
          <option value="member">Membro</option>
          <option value="admin">Admin</option>
        </select>
      </div>
              
           
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleAddMember}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Parceiros</CardTitle>
          <CardDescription>
            Gerencie todos os Parceiros cadastrados na plataforma.
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
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => requestSort('first_name')}
                  >
                    <div className="flex items-center">
                      Nome
                      {getSortIcon('first_name')}
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => requestSort('grade')}
                  >
                    <div className="flex items-center">
                      Graduação
                      {getSortIcon('grade')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer text-right"
                    onClick={() => requestSort('total_sales')}
                  >
                    <div className="flex items-center justify-end">
                      Vendas (R$)
                      {getSortIcon('total_sales')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer text-right"
                    onClick={() => requestSort('total_contacts')}
                  >
                    <div className="flex items-center justify-end">
                      Contatos
                      {getSortIcon('total_contacts')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <User className="h-10 w-10 mb-2" />
                      <p>Nenhum membro encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => {
                  const user = userById.get(member.id); // find corresponding user/profile
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.first_name + " " + member.last_name}</TableCell>
                      <TableCell>{user ? user.email : '—'}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>
                        <Badge className={`${gradeColors[member.grade]}`}>
                          {gradeLabels[member.grade]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
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
                  );
                })
              )}
            </TableBody>

            </Table>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
  <CardHeader>
    <CardTitle>Administradores</CardTitle>
    <CardDescription>Usuários com funções administrativas na plataforma.</CardDescription>
  </CardHeader>

  <CardContent>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <User className="h-10 w-10 mb-2" />
                  <p>Nenhum administrador encontrado</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            admins.map(admin => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">{admin.first_name + " " + admin.last_name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{admin.role}</Badge>
                </TableCell>
                <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      handleEditAdminDialogOpen(admin);
                      setSelectedUserId(admin.id);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedUserId(admin.id);
                      setDeleteDialogOpen(true);
                    }}
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
  <Card>
      <CardHeader>
        <CardTitle>Membros Pendentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Sobrenome</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Carregando membros...
                </TableCell>
              </TableRow>
            ) : pendingMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Nenhum membro pendente encontrado
                </TableCell>
              </TableRow>
            ) : (
              pendingMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.first_name}</TableCell>
                  <TableCell>{member.last_name}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.status}</TableCell>
                  <TableCell className="text-right space-x-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(member.id)}
                  >
                    Aprovar
                  </Button>

                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleReject(member.id)}
                  >
                    Rejeitar
                  </Button>

                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
      
      {/* Diálogo de Edição */}
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Editar {selectedMember ? "Membro" : "Administrador"}</DialogTitle>
      <DialogDescription>
        Atualize os dados do {selectedMember ? "membro" : "administrador"} selecionado.
      </DialogDescription>
    </DialogHeader>

    <div className="grid gap-4 py-4">
      {/* Nome */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Nome</Label>
        <Input
          name="first_name"
          value={selectedMember ? formData.first_name : formPata.first_name}
          onChange={(e) =>
            selectedMember
              ? setFormData({ ...formData, first_name: e.target.value })
              : setFormPata({ ...formPata, first_name: e.target.value })
          }
        />
      </div>

      {/* Sobrenome */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Sobrenome</Label>
        <Input
          name="last_name"
          value={selectedMember ? formData.last_name : formPata.last_name}
          onChange={(e) =>
            selectedMember
              ? setFormData({ ...formData, last_name: e.target.value })
              : setFormPata({ ...formPata, last_name: e.target.value })
          }
        />
      </div>

      {/* CPF */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">CPF</Label>
        <Input
          name="cpf"
          value={selectedMember ? formData.cpf : formPata.cpf}
          onChange={(e) =>
            selectedMember
              ? setFormData({ ...formData, cpf: e.target.value })
              : setFormPata({ ...formPata, cpf: e.target.value })
          }
        />
      </div>

      {/* Telefone */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Telefone</Label>
        <Input
          name="phone"
          value={selectedMember ? formData.phone : formPata.phone}
          onChange={(e) =>
            selectedMember
              ? setFormData({ ...formData, phone: e.target.value })
              : setFormPata({ ...formPata, phone: e.target.value })
          }
        />
      </div>

      {/* Grau (only for member) */}
      {selectedMember && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Grau</Label>
          <Select
            value={formData.grade}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, grade: value as MemberGrade }))
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Selecione o grau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Start</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>

    <DialogFooter>
      <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
        Cancelar
      </Button>
      <Button type="button" onClick={handleConfirmEdit}>
        Salvar Alterações
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      
      {/* Diálogo de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Membro</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {selectedMember?.first_name+" "+selectedMember?.last_name}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Se este membro tiver outros parceiros no seu squad, eles serão transferidos para o upline deste membro.
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

export default MembersPage;
