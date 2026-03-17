
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { User, UserPlus, PhoneCall, CheckCircle, XCircle, DollarSign, Trophy, Users, FileText, BarChart2 } from "lucide-react";
import { LeadStatus, MemberGrade } from "@/types";
import { MemberService } from "@/services/members.service";
import { Member as MyMember } from '../../types/member.types';
import { Lead  } from '../../types/lead.types';
import { LeadService } from "@/services/leads.service";

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

const AdminDashboard: React.FC = () => {
  const { 
    commissions, 
    getLeadCountByStatus, 
    getTotalSalesValue
  } = useData();
  const [members, setMembers] = useState<MyMember[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [topMembers, setTopMembers] = useState<MyMember[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

   useEffect(() => {
    const fetchMembers = async () => {
      try {
        const allMembers = await MemberService.getAllMembers();
        setMembers(allMembers);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoadingMembers(false);
      }
    };
        const fetchLeads = async () => {
      try {
        const allLeads = await LeadService.getAllLeads();
        setLeads(allLeads);
      } catch (error) {
        console.error("Failed to fetch Leads:", error);
      } finally {
        setLoadingLeads(false);
      }
    };
      const fetchTopMembers = async () => {
    const allMembers = await MemberService.getAllMembers(); // Your data fetching function
    const sorted = allMembers
      .filter(m => m.total_sales > 0) // optional: skip zero-sales members
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, 5); // top 5

    setTopMembers(sorted);
  };

    fetchMembers();
    fetchLeads();
    fetchTopMembers();
  }, []);

  
  // const topMembers = getTopMembers();
  const leadCountsByStatus = getLeadCountByStatus();
  const totalSalesValue = members.reduce((sum, member) => sum + member.total_sales, 0);
  const totalMembers = members.length;
  const totalLeads = leads.length;
  const totalCommissions = commissions.length;
  const paidCommissions = commissions.filter(c => c.is_paid).length;
  
  
  // Calcular estatísticas de leads
  const conversionRate = totalLeads > 0 
    ? (leadCountsByStatus.closed / totalLeads) * 100 
    : 0;
  
  // Gerar dados para gráficos
  const leadStatusData = [
    { name: "Novos", value: leadCountsByStatus.new, color: "#94a3b8" },
    { name: "Contatados", value: leadCountsByStatus.contacted, color: "#3b82f6" },
    { name: "Fechados", value: leadCountsByStatus.closed, color: "#22c55e" },
    { name: "Perdidos", value: leadCountsByStatus.lost, color: "#ef4444" }
  ];
  
  const memberGradeData = members.reduce((acc, member) => {
    const grade = member.grade as MemberGrade;
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<MemberGrade, number>);

  const gradeChartData = [
    // { name: "Beginner", value: memberGradeData. || 0, color: "#94a3b8" },
    { name: "Silver", value: memberGradeData.silver || 0, color: "#3b82f6" },
    { name: "Gold", value: memberGradeData.gold || 0, color: "#eab308" },
    { name: "Platinum", value: memberGradeData.platinum || 0, color: "#8b5cf6" },
    { name: "Diamond", value: memberGradeData.diamond || 0, color: "#10b981" }
  ];

  const isInRange = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  return (!startDate || date >= new Date(startDate)) &&
         (!endDate || date <= new Date(endDate));
};

const filteredCommissions = commissions.filter(c => isInRange(c.sale_date));
const filteredLeads = leads.filter(lead => lead.status === "closed" && isInRange(lead.created_at));

const filteredSalesValue = filteredLeads.reduce(
  (sum, lead) => sum + (lead.sale_value || 0),
  0
);

const paidFilteredCommissionAmount = filteredCommissions
  .filter(c => c.is_paid)
  .reduce((sum, c) => sum + (c.commission_value || 0), 0);



  // Métricas para cartões
  const metrics = [
  {
    title: "Total de Parceiros",
    value: totalMembers,
    subtext: `${topMembers[0]?.grade === "diamond" ? "1" : "0"} Diamond`,
    icon: User,
    color: "text-blue-500",
    link: "/admin/members"
  },
  {
    title: "Total de Leads",
    value: totalLeads,
    subtext: `${conversionRate.toFixed(1)}% de conversão`,
    icon: PhoneCall,
    color: "text-indigo-500",
    link: "/admin/leads"
  },
  {
    title: "Vendas Fechadas",
    value: filteredLeads.length,
    subtext: `R$ ${(filteredSalesValue / 1000).toFixed(1)}k em vendas`,
    icon: CheckCircle,
    color: "text-green-500",
    link: "/admin/leads"
  },
    {
      title: "Comissões Pagas",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(paidFilteredCommissionAmount),
      subtext: `${(
        (paidFilteredCommissionAmount / 
          filteredCommissions.reduce((sum, c) => sum + (c.commission_value || 0), 0) || 0
        ) * 100
      ).toFixed(1)}% do total`,
      icon: DollarSign,
      color: "text-amber-500",
      link: "/admin/commissions"
    }

];


  // Obter os squads principais (cabeças de squad)
  const getTopSquads = () => {
    // Considerar apenas membros que não têm upline (são cabeças de squad)
    const topLevelMembers = members.filter(m => !m.upline_id);
    
    // Para cada cabeça de squad, calcular as métricas do squad
    const squads = topLevelMembers.map(headMember => {
      const squadMembers = getMemberSquad(headMember.id);
      const totalSquadMembers = squadMembers.length + 1; // +1 para incluir o próprio cabeça
      const totalSquadSales = squadMembers.reduce((sum, m) => sum + (m.total_sales || 0), 0) + (headMember.total_sales || 0);
      const totalSquadContacts = squadMembers.reduce((sum, m) => sum + (m.total_contacts || 0), 0) + (headMember.total_contacts || 0);

      
      return {
        id: headMember.id,
        name: headMember.first_name+" "+headMember.last_name,
        grade: headMember.grade,
        members: totalSquadMembers,
        sales: totalSquadSales,
        contacts: totalSquadContacts
      };
    });
    
    // Ordenar por volume de vendas
    return squads.sort((a, b) => b.sales - a.sales);
  };
  
  // Função para obter todos os membros do squad de um membro
  const getMemberSquad = (memberId: string) => {
    // Encontrar todos os membros que têm este membro como upline
    const directDownline = members.filter(m => m.upline_id === memberId);
    
    // Para cada membro, também encontrar o seu downline recursivamente
    return directDownline.reduce(
      (acc, member) => [...acc, member, ...getMemberSquad(member.id)],
      [] as typeof members
    );
  };
  
  // Obter os top squads
  const topSquads = getTopSquads().slice(0, 10);
const filteredStatusData = leadStatusData.filter((entry) => entry.value > 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da plataforma e métricas principais
          </p>
        </div>
      <div className="flex items-end gap-4 bg-muted/30 p-4 rounded-xl shadow-sm border w-full md:w-auto mb-6">
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

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.subtext}
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

       {/* Top Membros */}
      <Card>
        <CardHeader>
          <CardTitle>Top Parceiros</CardTitle>
          <CardDescription>
            Parceiros com maior volume de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {topMembers.map((member, index) => (
              <div key={member.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm w-5 text-center">{index + 1}.</span>
                    <span className="font-medium"><td>{member.first_name+" "+member.last_name}</td></span>
                    <Badge className={`${gradeColors[member.grade as MemberGrade]}`}>
                      {gradeLabels[member.grade as MemberGrade]}
                    </Badge>
                  </div>
                 <span className="text-sm font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(member.total_sales)}
                  </span>
                </div>
                <Progress value={(member.total_sales / (topMembers[0]?.total_sales || 1)) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

     

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de status de leads */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Leads</CardTitle>
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
        
{/* Gráfico de graduação de membros */}
            <Card>
        <CardHeader>
          <CardTitle>Graduação dos Parceiros</CardTitle>
          <CardDescription>
            Distribuição de Parceiros por nível
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gradeChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                labelLine={false} // remove lines to text
                label={false} // or use a custom label if needed
              >
                {gradeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Membros"]} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


         {/* Ranking de Squads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-amber-500" />
            Ranking de Squads
          </CardTitle>
          <CardDescription>
            Desempenho dos principais squads na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSquads.map((squad, index) => (
              <div key={squad.id} className="flex items-center gap-4 p-3 rounded-lg bg-accent/30">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{squad.name}</span>
                    <Badge className={`${gradeColors[squad.grade as MemberGrade]}`}>
                      {gradeLabels[squad.grade as MemberGrade]}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {squad.members} membros
                    </span>
                    <span className="flex items-center gap-1">
                      <PhoneCall className="h-3 w-3" />
                      {squad.contacts} contatos
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">
                    R$ {squad.sales.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    em vendas
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>

     
    </div>
  );
};

export default AdminDashboard;
