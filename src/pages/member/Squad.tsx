
import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  UserPlus, 
  Search, 
  PhoneCall, 
  DollarSign,
  BadgePercent,
  UserCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Member, Squad } from "@/types";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { MemberService } from "@/services/members.service";



const gradeColors = {
  start: "bg-slate-500",
  standard: "bg-blue-500",
  gold: "bg-yellow-500",
  platinum: "bg-violet-500",
  diamond: "bg-emerald-500"
};

const gradeLabels = {
  start: "Start",
  standard: "Standard",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond"
};

const SquadPage = () => {
  const { user } = useAuth();
  const { getMemberSquad, getSquadMetrics, addMember } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Member | null;
    direction: 'ascending' | 'descending';
  }>({ key: null, direction: 'ascending' });

  // Formulário para novo membro
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: ""
  });

  // Obter os membros do squad do usuário atual
  const squadMembers = React.useMemo(() => {
    if (!user) return [];
    return getMemberSquad(user.id);
  }, [user, getMemberSquad]);

  // Obter métricas do squad
  const squadMetrics = React.useMemo(() => {
    if (!user) return null;
    return getSquadMetrics(user.id);
  }, [user, getSquadMetrics]);

  // Filtrar membros baseado na busca
  const filteredMembers = squadMembers.filter(member => 
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.cpf.includes(searchTerm)
  );

  // Ordenar membros
  const sortedMembers = React.useMemo(() => {
    let sortableMembers = [...filteredMembers];
    if (sortConfig.key !== null) {
      sortableMembers.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableMembers;
  }, [filteredMembers, sortConfig]);

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
      phone: ""
    });
  };
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

useEffect(() => {
  const fetchCurrentMember = async () => {
    if (!user) return;
    try {
      const member = await MemberService.getMemberById(user.id);
      setCurrentMember(member);
    } catch (err) {
      console.error("Erro ao buscar membro:", err);
    }
  };

  fetchCurrentMember();
}, [user]);


  // Adicionar um novo membro
  const handleAddMember = () => {
    if (!user) return;
    
    try {
      addMember({
        first_name: formData.name,
        last_name: formData.email,
        cpf: formData.cpf,
        phone: formData.phone,
        upline_id: user.id,
        total_sales: 0,
        total_contacts: 0,
        total_commission: 0
      });
      setAddDialogOpen(false);
      resetForm();
      toast.success("Membro adicionado com sucesso ao seu squad!");
    } catch (error) {
      toast.error("Erro ao adicionar membro");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meu Squad</h1>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Adicionar Membro</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Membro</DialogTitle>
              <DialogDescription>
                Preencha os dados para cadastrar um novo membro no seu squad.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
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
                <Label htmlFor="cpf" className="text-right">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
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
      
      {/* Estatísticas do Squad */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{squadMetrics?.totalMembers || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{squadMetrics?.totalContacts || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(squadMetrics?.totalSales || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
            <BadgePercent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(squadMetrics?.totalSales || 0)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Lista de membros */}
      <Card>
        <CardHeader>
          <CardTitle>Membros do Squad</CardTitle>
          <CardDescription>
            Visualize todos os membros que fazem parte do seu squad.
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
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {sortedMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="h-10 w-10 mb-2" />
                        <p>Você ainda não tem membros no seu squad</p>
                        <Button 
                          variant="link" 
                          className="mt-2"
                          onClick={() => setAddDialogOpen(true)}
                        >
                          Adicionar um membro agora
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.first_name}</TableCell>
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Total: {sortedMembers.length} membros no squad
          </div>
        </CardFooter>
      </Card>
      
      {/* Sua Evolução no Squad */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Sua Evolução</CardTitle>
            <CardDescription>
              Acompanhe sua progressão nos níveis de graduação.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto">
                    <UserCircle2 className="w-24 h-24 text-primary/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-20 h-20 rounded-full ${gradeColors[(user as unknown as Member).grade]} flex items-center justify-center text-white font-semibold`}>
                        {gradeLabels[(user as unknown as Member).grade].charAt(0)}
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-2 font-bold text-lg">
                    {gradeLabels[(user as unknown as Member).grade]}
                  </h3>
                </div>
              </div>
              
              <div className="space-y-2">
                {(user as unknown as Member).grade !== "diamond" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>
                        Nível atual: {gradeLabels[(user as unknown as Member).grade]}
                      </span>
                      <span>
                        Próximo nível: {
                          (user as unknown as Member).grade === "start" ? "Standard" :
                          (user as Member).grade === "standard" ? "Gold" :
                          (user as Member).grade === "gold" ? "Platinum" : "Diamond"
                        }
                      </span>
                    </div>
                    
                    <Progress 
                      value={
                        (user as Member).grade === "start" 
                          ? Math.min(100, ((user as Member).totalSales / 100000) * 100)
                          : (user as Member).grade === "standard"
                          ? Math.min(100, (((user as Member).totalSales - 100000) / 400000) * 100)
                          : (user as Member).grade === "gold"
                          ? Math.min(100, (((user as Member).totalSales - 500000) / 500000) * 100)
                          : (user as Member).grade === "platinum"
                          ? Math.min(100, (((user as Member).totalSales - 1000000) / 9000000) * 100)
                          : 100
                      } 
                      className="h-2" 
                    />
                    
                    <div className="text-sm text-muted-foreground">
                      {(user as Member).grade === "start" && (
                        `Vendas: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((user as Member).totalSales)} / R$ 100.000,00`
                      )}
                      {(user as Member).grade === "standard" && (
                        `Vendas: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((user as Member).totalSales)} / R$ 500.000,00`
                      )}
                      {(user as Member).grade === "gold" && (
                        `Vendas: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((user as Member).totalSales)} / R$ 1.000.000,00`
                      )}
                      {(user as Member).grade === "platinum" && (
                        `Vendas: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((user as Member).totalSales)} / R$ 10.000.000,00`
                      )}
                    </div>
                  </>
                )}
                
                {(user as Member).grade === "diamond" && (
                  <div className="text-center py-3">
                    <p className="text-lg font-medium">Parabéns! Você alcançou o nível máximo!</p>
                    <p className="text-sm text-muted-foreground">
                      Total de vendas: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((user as Member).totalSales)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SquadPage;
