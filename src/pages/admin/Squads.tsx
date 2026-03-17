
import React, { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Member } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";
import SquadMetricsCard from "@/components/admin/SquadMetricsCard";
import SquadMemberTree from "@/components/admin/SquadMemberTree";
import { MemberService } from "@/services/members.service";
import { toast } from "sonner";
import { useMemberContext } from "@/contexts/MemberContext";

const AdminSquads: React.FC = () => {
  const { getSquadMetrics } = useMemberContext();
  const [members, setMembers] = useState<Member[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedSquadMetrics, setSelectedSquadMetrics] = useState<any>(null);

  
  // Filtrar membros que são raízes (não têm upline) - Linha 1
  const line1Members = members.filter(member => member.upline_id === null);
  
  // Filtrar membros da Linha 2 (upline é um membro da Linha 1)
  const line2Members = members.filter(member => {
    if (!member.upline_id) return false;
    const uplineMember = members.find(m => m.id === member.upline_id);
    return uplineMember && uplineMember.upline_id === null;
  });

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
  
  // Filtrar por termo de busca
  const filteredMembers = members.filter(member => 
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  // Selecionar membro
const handleSelectMember = async (memberId: string) => {
  setSelectedMemberId(memberId);
  try {
    const metrics = await getSquadMetrics(memberId);
    setSelectedSquadMetrics(metrics);
  } catch (error) {
    toast.error("Erro ao buscar métricas do squad");
  }
};


  console.log("selectedSquadMetrics:", selectedSquadMetrics);
  // Membro selecionado
  const selectedMember = selectedMemberId 
    ? members.find(m => m.id === selectedMemberId) 
    : null;

    const leader = selectedMember
  ? members.find(m =>
      m.id === selectedMember.upline_id // if Line 2, find their upline
    ) ?? selectedMember // fallback to self if already Line 1
  : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Squads</h2>
        <p className="text-muted-foreground">
          Visualize e gerencie os squads de todos os membros do sistema.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membros
            </CardTitle>
            <CardDescription>Selecione um membro para ver seu squad</CardDescription>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar membros..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">Linha 1</TabsTrigger>
                <TabsTrigger value="line2">Linha 2</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-2 space-y-1">
                {line1Members.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum membro da Linha 1 encontrado
                  </p>
                ) : (
                  line1Members
                    .filter(member => 
                      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      member.phone.includes(searchTerm)
                    )
                    .map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                          selectedMemberId === member.id ? "bg-primary/10" : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSelectMember(member.id)}
                      >
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {member.first_name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.first_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.last_name}
                          </p>
                        </div>
                        <div className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                          {member.grade}
                        </div>
                      </div>
                    ))
                )}
              </TabsContent>
              <TabsContent value="line2" className="mt-2 space-y-1">
                {line2Members.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum membro da Linha 2 encontrado
                  </p>
                ) : (
                  line2Members
                    .filter(member => 
                      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      member.phone.includes(searchTerm)
                    )
                    .map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                          selectedMemberId === member.id ? "bg-primary/10" : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSelectMember(member.id)}
                      >
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {member.first_name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.first_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.last_name}
                          </p>
                        </div>
                        <div className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                          {member.grade}
                        </div>
                      </div>
                    ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2 space-y-6">
          {selectedMemberId ? (
            <>
            {selectedSquadMetrics && (
              <SquadMetricsCard
                squad={{
                  ...selectedSquadMetrics,
                  memberName: `${leader?.first_name} ${leader?.last_name}`,
                }}
              />
            )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Estrutura do Squad</CardTitle>
                  <CardDescription>
                    Visualize todos os membros deste squad em formato de árvore
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedMember && (
                    <div className="overflow-x-auto">
                      <div className="min-w-[600px] pb-4">
                        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md mb-2">
                          <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {selectedMember.first_name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{selectedMember.first_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedMember.last_name}
                            </p>
                          </div>
                          <div className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                            {selectedMember.grade}
                          </div>
                        </div>
                        <SquadMemberTree 
                          rootMember={selectedMember} 
                          allMembers={members}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Nenhum squad selecionado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Selecione um membro para visualizar o squad dele.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSquads;
