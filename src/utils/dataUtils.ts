
import { Member, MemberGrade, LeadStatus, Commission, CommissionGroup, Lead } from "@/types";


// Funções auxiliares
export const generateId = () => `id-${Math.random().toString(36).substr(2, 9)}`;


export const calculateMemberGrade = (totalSales: number): MemberGrade => {
  if (totalSales >= 10000000) return "diamond";
  if (totalSales >= 1000000) return "platinum";
  if (totalSales >= 500000) return "gold";
  if (totalSales >= 100000) return "standard";
  return "beginner";
};
   
export const findMemberPath = (members: Member[], memberId: string): Member[] => {
  const result: Member[] = [];
  let currentId = memberId;
  
  // Evitar loops infinitos
  const maxIterations = members.length;
  let iterations = 0;
  
  while (currentId && iterations < maxIterations) {
    const member = members.find(m => m.id === currentId);
    if (!member) break;
    
    result.push(member);
    currentId = member.upline_id || "";
    iterations++;
  }
  
  return result;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

// Função para agrupar comissões por mês/ano
export const groupCommissionsByMonth = (commissions: any[]) => {
  const monthlyGroups: Record<string, any[]> = {};
  
  commissions.forEach(commission => {

    const date = new Date(commission.saleDate);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!monthlyGroups[key]) {
      monthlyGroups[key] = [];
    }
    
    monthlyGroups[key].push(commission);
  });
  
  return monthlyGroups;
};

// Função para agrupar comissões por membro e por mês
export const groupCommissionsByMemberAndMonth = (
  commissions: Commission[],
  members: Member[],
  leads: Lead[]
): CommissionGroup[] => {
  const groupedByMemberAndMonth: Record<string, Commission[]> = {};

  commissions.forEach(commission => {
    const date = new Date(commission.sale_date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${commission.member_id}|${year}|${month}`;


    if (!groupedByMemberAndMonth[key]) {
      groupedByMemberAndMonth[key] = [];
    }

    groupedByMemberAndMonth[key].push(commission);
  });


  return Object.entries(groupedByMemberAndMonth).map(([key, commissions]) => {

  const [memberId, year, month] = key.split('|');


    const totalValue = commissions.reduce((sum, commission) => sum + commission.commission_value, 0);
    const isPaid = commissions.every(commission => commission.is_paid);
    const member = members.find(m => m.id === memberId);
 
    const memberName = member ? `${member.first_name} ${member.last_name}` : memberId;
    const dueDate = new Date(Number(year), Number(month), 10);

    return {
      id: key,
      memberId,
      memberName,
      month: Number(month),
      year: Number(year),
      commissions,
      totalValue,
      isPaid,
      dueDate
    };
  });
};


// Função para filtrar comissões por período
export const filterCommissionsByPeriod = (
  commissionGroups: CommissionGroup[], 
  period: string, 
  year?: number, 
  month?: number
): CommissionGroup[] => {
  if (period === 'all') {
    return commissionGroups;
  } else if (period === 'year' && year) {
    return commissionGroups.filter(group => group.year === year);
  } else if (period === 'month' && year && month) {
    return commissionGroups.filter(group => group.year === year && group.month === month);
  }
  return commissionGroups;
};

// Função para obter anos disponíveis nas comissões
export const getAvailableYears = (commissionGroups: CommissionGroup[]): number[] => {
  const years = new Set(commissionGroups.map(group => group.year));
  return Array.from(years).sort((a, b) => b - a); // Ordenar decrescente
};

// Função para obter meses disponíveis nas comissões para um ano específico
export const getAvailableMonths = (commissionGroups: CommissionGroup[], year: number): number[] => {
  const months = new Set(
    commissionGroups
      .filter(group => group.year === year)
      .map(group => group.month)
  );
  return Array.from(months).sort((a, b) => a - b); // Ordenar crescente
};

// Nome dos meses em português
export const getMonthName = (month: number): string => {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return monthNames[month - 1];
};

