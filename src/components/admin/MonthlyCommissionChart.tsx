
import React from "react";
import { Commission } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from "recharts";
import { formatCurrency } from "@/utils/dataUtils";

interface MonthlyCommissionChartProps {
  commissions: Commission[];
}

export const MonthlyCommissionChart: React.FC<MonthlyCommissionChartProps> = ({ commissions }) => {
  // Processar dados para o gráfico
  const processChartData = () => {
    const monthlyData: Record<string, { month: string, total: number, paid: number, pending: number }> = {};
    
    // Mapear os meses em português
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    
    // Agrupar comissões por mês
    commissions.forEach(commission => {
      const date = new Date(commission.sale_date);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          total: 0,
          paid: 0,
          pending: 0
        };
      }
      
      monthlyData[monthYear].total += commission.commission_value;
      
      if (commission.is_paid) {
        monthlyData[monthYear].paid += commission.commission_value;
      } else {
        monthlyData[monthYear].pending += commission.commission_value;
      }
    });
    
    // Converter para array e ordenar por data
    return Object.values(monthlyData).sort((a, b) => {
      // Extrair mês e ano
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      
      // Comparar anos primeiro
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }
      
      // Se os anos são iguais, comparar meses
      return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
    });
  };
  
  const chartData = processChartData();

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border rounded-md shadow-md">
          <p className="font-medium">{payload[0].payload.month}</p>
          <p className="text-sm">
            <span className="font-medium">Total: </span>
            {formatCurrency(payload[0].payload.total)}
          </p>
          <p className="text-sm text-green-600">
            <span className="font-medium">Pago: </span>
            {formatCurrency(payload[0].payload.paid)}
          </p>
          <p className="text-sm text-amber-600">
            <span className="font-medium">Pendente: </span>
            {formatCurrency(payload[0].payload.pending)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Não há dados suficientes para exibir o gráfico.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="month" 
          angle={-45} 
          textAnchor="end"
          height={70} 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={(value) => `${value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: 15 }} />
        <Bar name="Pago" dataKey="paid" fill="#22c55e" />
        <Bar name="Pendente" dataKey="pending" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
};
