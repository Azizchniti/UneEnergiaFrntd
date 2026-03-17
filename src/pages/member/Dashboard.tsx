import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, CheckSquare, XSquare, DollarSign, Users, Trophy, TrendingUp, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Member, MemberGrade, MonthlyCommission, Squad } from "@/types";
import { MemberService } from "@/services/members.service";
import { CommissionService } from "@/services/commission.service";
import TutorialModal from "@/components/TutorialModal ";

// Define grade colors mapping
const gradeColors = {
  beginner: "bg-slate-500",
  silver: "bg-blue-500",
  gold: "bg-yellow-500",
  platinum: "bg-violet-500",
  diamond: "bg-emerald-500"
};

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    leads, 
    getMemberCommissions, 
    getMemberSquad, 
    getMemberMonthlyCommissions,
    getSquadMetrics 
  } = useData();
    const [squad, setSquad] = useState<Member[]>([]);
  console.log(leads)
  console.log(user)
  const [activeTab, setActiveTab] = useState("personal");
  const [squadMetrics, setSquadMetrics] = useState<Squad | null>(null);
  const [startDate, setStartDate] = useState<string>(""); // e.g., "2024-01-01"
  const [endDate, setEndDate] = useState<string>("");     // e.g., "2024-12-31"
  const [commissionData, setCommissionData] = useState<{ name: string; valor: number }[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);

  // O usuário atual está garantido como sendo um Member pelo layout autenticado
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const getLeadNameById = (leadId: string) => {
  const lead = leads?.find((l) => l.id === leadId);
  return lead ? lead.name : "Lead não encontrado";
};

useEffect(() => {
  const fetchMember = async () => {
    if (user?.id) {
      try {
        const memberData = await MemberService.getMemberById(user.id);
        setCurrentMember(memberData);

        // 👇 If tutorial has not been seen, show modal
        if (!memberData.has_seen_tutorial) {
          setShowTutorial(true);
        }
      } catch (err) {
        console.error("Failed to fetch member:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  fetchMember();
}, [user?.id]);


useEffect(() => {
  const fetchMetrics = async () => {
    if (currentMember?.id) {
      const data = await getSquadMetrics(currentMember.id);
      console.log("Fetched squad metrics:", data);
      setSquadMetrics(data);
    }
  };

  fetchMetrics();
}, [currentMember?.id]);

useEffect(() => {
  const fetchSquad = async () => {
    if (currentMember?.id) {
      try {
        const squadData = await getMemberSquad(currentMember.id);
        setSquad(squadData);
      } catch (error) {
        console.error("Erro ao buscar o squad:", error);
      }
    }
  };

  fetchSquad();
}, [currentMember?.id]);

useEffect(() => {
  const fetchMonthly = async () => {
    try {
      console.log("Fetching monthly commissions for member ID:", currentMember.id);

      const data: MonthlyCommission[] = await CommissionService.getMemberMonthlyCommissions(currentMember.id);

      console.log("Raw monthly commissions response:", data);

      const formatted = data
        .slice(0, 6)
        .map(mc => {
          const monthLabel = `${String(mc.month).padStart(2, '0')}/${String(mc.year).toString().slice(-2)}`;
          const valor = mc.total_commission; // ✅ Correct field
          console.log(`Formatting: month=${monthLabel}, valor=${valor}`);
          return { name: monthLabel, valor };
        })
        .reverse();


      console.log("Formatted data for chart:", formatted);

      setCommissionData(formatted);
    } catch (err) {
      console.error("Erro ao buscar comissões mensais:", err);
    }
  };

  if (currentMember?.id) {
    fetchMonthly();
  }
}, [currentMember]);

  
  if (loading || !currentMember) {
  return <div>Loading member data...</div>;
}

  // Dados do membro
  const memberLeads = leads.filter(lead => lead.member_id === currentMember.id);
  const memberCommissions = getMemberCommissions(currentMember.id);


  // const monthlyCommissions = getMemberMonthlyCommissions(currentMember.id);
  // console.log("monthly",monthlyCommissions);
  //const squadMetrics = getSquadMetrics(currentMember.id);


  
  // Contagem de leads por status
  const leadCounts = memberLeads.reduce(
    (acc, lead) => {
      acc[lead.status]++;
      return acc;
    },
    { new: 0, contacted: 0, closed: 0, lost: 0 } as Record<string, number>
  );
  
  // Total de vendas fechadas
  const closedLeads = memberLeads.filter(lead => lead.status === "closed");
  const totalSalesValue = closedLeads.reduce((sum, lead) => sum + (lead.sale_value || 0), 0);
  
  // Dados para o gráfico de status de leads
  const statusData = [
    { name: "Novos", value: leadCounts.new, color: "#94a3b8" },
    { name: "Contatados", value: leadCounts.contacted, color: "#3b82f6" },
    { name: "Fechados", value: leadCounts.closed, color: "#22c55e" },
    { name: "Perdidos", value: leadCounts.lost, color: "#ef4444" },
  ];
  
  // Dados para o gráfico de comissões mensais
  // const commissionData = monthlyCommissions.slice(0, 6).map(mc => ({
  //   name: `${mc.month.substring(0, 3)}/${mc.year.toString().substring(2)}`,
  //   valor: mc.totalCommission,
  // })).reverse();

const isInRange = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  return (!startDate || date >= new Date(startDate)) &&
         (!endDate || date <= new Date(endDate));
};


const filteredLeads = memberLeads.filter(
  lead => lead.status === "closed" && isInRange(lead.created_at)
);

const filteredCommissions = memberCommissions.filter(
  commission => isInRange(commission.sale_date)
);

const filteredSalesValue = filteredLeads.reduce(
  (sum, lead) => sum + (lead.sale_value || 0),
  0
);

const filteredCommissionTotal = filteredCommissions.reduce(
  (sum, commission) => sum + (commission.commission_value || 0),
  0
);

  
  // Métricas pessoais para os cards
const personalMetrics = [
  {
    title: "Meus Leads",
    value: memberLeads?.length ?? 0,
    description: "Leads cadastrados por você",
    icon: Phone,
    color: "text-indigo-500",
    link: "/member/leads",
  },
  {
    title: "Vendas Fechadas",
    value: leadCounts?.closed ?? 0,
    description:
      leadCounts?.closed > 0 && memberLeads?.length > 0
        ? `${((leadCounts.closed / memberLeads.length) * 100).toFixed(1)}% de conversão`
        : "Nenhuma venda ainda",
    icon: CheckSquare,
    color: "text-green-500",
    link: "/member/leads",
  },
 {
  title: "Volume de Vendas",
  value: new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(filteredSalesValue),
  description: "Valor total de vendas realizadas",
  icon: DollarSign,
  color: "text-emerald-500",
  link: "/member/leads",
},

 {
  title: "Total em Comissões",
  value: new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(filteredCommissionTotal),
  description: "Valor acumulado em comissões",
  icon: TrendingUp,
  color: "text-amber-500",
  link: "/member/commissions",
},

];

const squadMetricsCards = [
  {
    title: "Membros no Squad",
    value: squadMetrics?.memberCount ?? 0,
    description: "Membros sob sua liderança",
    icon: Users,
    color: "text-blue-500",
    link: "/member/squad",
  },
  {
    title: "Vendas do Squad",
    value:
      typeof squadMetrics?.totalSales === "number"
        ? `R$ ${(squadMetrics.totalSales / 1000).toFixed(1)}K`
        : "R$ 0K",
    description: "Volume total de vendas do squad",
    icon: BarChart3,
    color: "text-purple-500",
    link: "/member/squad",
  },
  {
    title: "Contatos do Squad",
    value: squadMetrics?.totalContacts ?? 0,
    description: "Total de leads cadastrados pelo squad",
    icon: Phone,
    color: "text-orange-500",
    link: "/member/squad",
  },
  {
    title: "Comissões do Squad",
    value:
      typeof squadMetrics?.totalCommission === "number"
        ? `R$ ${squadMetrics.totalCommission.toFixed(2)}`
        : "R$ 0.00",
    description: "Total acumulado pelo squad",
    icon: DollarSign,
    color: "text-teal-500",
    link: "/member/squad",
  },
];


// Formatação do valor para o tooltip do gráfico de comissões
const formatCurrency = (value: number) => {
  return typeof value === "number" ? `R$ ${value.toFixed(2)}` : "R$ 0.00";
};

  // Progresso para o próximo nível
  const levelProgress = getNextLevelProgress(currentMember.grade, currentMember.total_sales);

  const filteredStatusData = statusData.filter((entry) => entry.value > 0);
    const handleCloseTutorial = async () => {
      if (currentMember) {
        try {
          await MemberService.markTutorialSeen(currentMember.id);
          setShowTutorial(false);
        } catch (err) {
          console.error("Failed to mark tutorial as seen:", err);
        }
      }
    };


  return (
    <>
      {showTutorial && (
      <TutorialModal onClose={handleCloseTutorial} member={currentMember} />
    )}
    <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
    <p className="text-muted-foreground">
      Bem-vindo, {currentMember.first_name + " " + currentMember.last_name}
    </p>
  </div>

  <div className="flex items-end gap-4 bg-muted/30 p-4 rounded-xl shadow-sm border w-full md:w-auto">
    <div className="space-y-1">
      <label className="text-sm font-medium text-muted-foreground">
        Data Início
      </label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="border border-input bg-background text-sm rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
    <div className="space-y-1">
      <label className="text-sm font-medium text-muted-foreground">
        Data Fim
      </label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border border-input bg-background text-sm rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  </div>
</div>

      {/* Status de graduação */}
      <Card className="neo border-none">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-medium">Seu nível atual: <span className="font-semibold text-primary"> {currentMember.grade 
      ? currentMember.grade.charAt(0).toUpperCase() + currentMember.grade.slice(1) 
      : "Desconhecido"}</span></h3>
              </div>
              
             <div className="space-y-1">
              <div className="flex items-center justify-between text-sm gap-1">
                <span>Progresso para o próximo nível:</span>
                <span className="font-medium">
                  {currentMember.grade === "diamond" 
                    ? "Nível máximo" 
                    : levelProgress.text}
                </span>
                </div>
              <Progress value={levelProgress.percentage} className="h-2.5" />

                <div className="grid grid-cols-4 text-xs text-muted-foreground">
                  {/* <div className="text-center">Beginner</div> */}
                  <div className="text-center">Silver</div>
                  <div className="text-center">Gold</div>
                  <div className="text-center">Platinum</div>
                  <div className="text-center">Diamond</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link to="/member/leads/new">
                <Button>
                  <Phone className="mr-2 h-4 w-4" />
                  Novo Lead
                </Button>
              </Link>
              <Link to="/member/squad">
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Meu Squad
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para alternar entre dados pessoais e dados do squad */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="personal">Meus Resultados</TabsTrigger>
          <TabsTrigger value="squad">Meu Squad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-6">
          {/* Grid de métricas pessoais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {personalMetrics.map((metric, index) => (
              <Card key={index} className="neo border-none hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                  <Link to={metric.link}>
                    <Button variant="ghost" className="p-0 h-auto mt-2 text-xs font-medium hover:underline">
                      Ver detalhes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráficos e tabelas */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status dos Leads */}
            <Card className="neo border-none">
              <CardHeader>
                <CardTitle>Status dos seus Leads</CardTitle>
                <CardDescription>
                  Distribuição de leads por status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredStatusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {filteredStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, "Leads"]} />
          </PieChart>

                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Histórico de Comissões */}
            <Card className="neo border-none">
              <CardHeader>
                <CardTitle>Histórico de Comissões</CardTitle>
                <CardDescription>
                  Comissões recebidas nos últimos meses
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={commissionData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), "Comissão"]} />
                    <Legend />
                    <Bar dataKey="valor" name="Comissão (R$)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Comissões recentes */}
          <Card className="neo border-none">
            <CardHeader>
              <CardTitle>Comissões Recentes</CardTitle>
              <CardDescription>
                Últimas comissões geradas para você
              </CardDescription>
            </CardHeader>
            <CardContent>
              {memberCommissions.length > 0 ? (
                <div className="space-y-4">
                  {memberCommissions.slice(0, 5).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                      <div>
                        <div className="font-medium">{getLeadNameById(commission.lead_id)}</div>
                        <div className="text-xs text-muted-foreground">
                          Venda de R$ {commission.sale_value.toFixed(2)} • {commission.commission_percentage}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          +R$ {commission.commission_value.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(commission.sale_date).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Você ainda não tem comissões geradas.
                  </p>
                  <p className="text-sm mt-2">
                    Cadastre leads e converta vendas para ganhar comissões.
                  </p>
                </div>
              )}

              {memberCommissions.length > 0 && (
                <div className="mt-4">
                  <Link to="/member/commissions">
                    <Button variant="outline" className="w-full">
                      Ver todas as comissões
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="squad" className="space-y-6">
          {/* Grid de métricas do squad */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {squadMetricsCards.map((metric, index) => (
              <Card key={index} className="neo border-none hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                  <Link to={metric.link}>
                    <Button variant="ghost" className="p-0 h-auto mt-2 text-xs font-medium hover:underline">
                      Ver detalhes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Lista de membros do squad */}
          <Card className="neo border-none">
            <CardHeader>
              <CardTitle>Membros do seu Squad</CardTitle>
              <CardDescription>
                {squad.length > 0 
                  ? `Você lidera ${squad.length} ${squad.length === 1 ? 'membro' : 'membros'}`
                  : "Você ainda não tem membros no seu squad"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {squad.length > 0 ? (
                <div className="space-y-4">
                  {squad.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{member.first_name+" "+member.last_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {member.phone} • {member.grade}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          <Badge className={`${gradeColors[member.grade as MemberGrade]}`}>
                            {member.grade 
                              ? member.grade.charAt(0).toUpperCase() + member.grade.slice(1) 
                              : "Desconhecido"}

                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          R$ {member.total_sales.toFixed(2)} em vendas
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Você ainda não tem membros no seu squad.
                  </p>
                  <p className="text-sm mt-2">
                    Convide pessoas para se juntarem ao seu squad para aumentar seus resultados.
                  </p>
                </div>
              )}

              {squad.length > 0 && (
                <div className="mt-4">
                  <Link to="/member/squad">
                    <Button variant="outline" className="w-full">
                      Ver squad completo
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de vendas por membro (top 5) */}
          <Card className="neo border-none">
            <CardHeader>
              <CardTitle>Desempenho do Squad</CardTitle>
              <CardDescription>
                Vendas dos top membros do seu squad
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {squad.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={squad.slice(0, 5).sort((a, b) => b.total_sales - a.total_sales).map(member => ({
                      name: member.first_name.split(' ')[0],
                      vendas: member.total_sales
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Vendas"]} />
                    <Legend />
                    <Bar dataKey="vendas" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Sem dados para exibir
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
};

// Função auxiliar para calcular o progresso para o próximo nível
// Map totalSales into 0–100% spread over 5 levels
function getNextLevelProgress(
  currentGrade: string | undefined,
  totalSales: number
): { percentage: number; text: string } {
  const levels = [
    { key: "silver", min: 0, max: 500000 },
    { key: "gold", min: 500000, max: 1000000 },
    { key: "platinum", min: 1000000, max: 10000000 },
    { key: "diamond", min: 10000000, max: Infinity },
  ];

  if (!currentGrade) {
    return { percentage: 0, text: "Desconhecido" };
  }

  const index = levels.findIndex((level) => level.key === currentGrade);
  if (index === -1) {
    return { percentage: 0, text: "Desconhecido" };
  }

  const currentLevel = levels[index];
  const nextLevel = levels[index + 1];

  if (!nextLevel || totalSales >= currentLevel.max) {
    return { percentage: 100, text: "Nível máximo" };
  }

  const step = 100 / (levels.length - 1); // Now 33.33... for 4 levels
  const levelProgress = (totalSales - currentLevel.min) / (currentLevel.max - currentLevel.min);
  const percentage = Math.round(index * step + levelProgress * step);

  const remaining = currentLevel.max - totalSales;
  const text = `R$ ${(remaining / 1000).toFixed(1)}K para ${capitalize(nextLevel.key)}`;

  return { percentage, text };
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}





export default MemberDashboard;
