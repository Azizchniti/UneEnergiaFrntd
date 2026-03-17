import React, { useState, useMemo, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CommissionSummaryCard from "@/components/admin/CommissionSummaryCard";
import { MonthlyCommissionChart } from "@/components/admin/MonthlyCommissionChart";
import { Search, CalendarRange } from "lucide-react";
import CommissionGroupTable from "@/components/admin/CommissionGroupTable";
import CommissionForecastCard from "@/components/admin/CommissionForecastCard";
import { 
  groupCommissionsByMemberAndMonth, 
  filterCommissionsByPeriod, 
  getAvailableYears, 
  getAvailableMonths, 
  getMonthName 
} from "@/utils/dataUtils";
import { Member } from "@/types";
import { MemberService } from "@/services/members.service";
import { toast } from "sonner";
import { CommissionService } from "@/services/commission.service";

const AdminCommissions = () => {
  const { commissions, getNextPaymentDate, getCommissionsForecast } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState<"all" | "year" | "month">("all");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [forecastPeriod, setForecastPeriod] = useState<"next" | "year" | "month">("next");
  const [forecastYear, setForecastYear] = useState<number>(new Date().getFullYear());
  const [forecastMonth, setForecastMonth] = useState<number>(new Date().getMonth() + 1);
  const [members, setMembers] = useState<Member[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const { leads } = useData();
   
  // Get the forecast data based on selected period
  const forecast = useMemo(() => {
    if (forecastPeriod === "next") {
      return getCommissionsForecast(); // Use next payment date
    } else if (forecastPeriod === "year") {
      // Calculate forecast for the entire year
      const startDate = new Date(forecastYear, 0, 1); // January 1st
      const endDate = new Date(forecastYear, 11, 31); // December 31st
      return getCommissionsForecast(startDate, endDate);
    } else if (forecastPeriod === "month") {
      // Calculate forecast for the specific month
      const startDate = new Date(forecastYear, forecastMonth - 1, 1); // First day of month
      const endDate = new Date(forecastYear, forecastMonth, 0); // Last day of month
      return getCommissionsForecast(startDate, endDate);
    }
    return getCommissionsForecast();
  }, [forecastPeriod, forecastYear, forecastMonth, getCommissionsForecast]);

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
  useEffect(() => {
  const loadCommissions = async () => {
    try {
      await CommissionService.getAll(); // This populates the local commissions array
    } catch (error) {
      toast.error("Erro ao buscar comissões");
    }
  };
  loadCommissions();
}, []);


  // Agrupar comissões por membro e mês
  const commissionGroups = useMemo(() => 
    groupCommissionsByMemberAndMonth(commissions,members,leads),
    [commissions,members,leads]
  );
  
  // Anos e meses disponíveis para filtro
  const availableYears = useMemo(() => getAvailableYears(commissionGroups), [commissionGroups]);
  const availableMonths = useMemo(
    () => getAvailableMonths(commissionGroups, selectedYear), 
    [commissionGroups, selectedYear]
  );

  // Filtragem por período
  const filteredCommissionGroups = useMemo(() => 
    filterCommissionsByPeriod(commissionGroups, periodFilter, selectedYear, selectedMonth),
    [commissionGroups, periodFilter, selectedYear, selectedMonth]
  );
  
  // Filtrar por membro (busca)
  const searchFilteredGroups = useMemo(() => 
    searchTerm
      ? filteredCommissionGroups.filter(group => 
          group.memberName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : filteredCommissionGroups,
    [filteredCommissionGroups, searchTerm]
  );

  // Separar grupos pagos e pendentes para as tabs
  const paidGroups = useMemo(() => 
    searchFilteredGroups.filter(group => group.isPaid),
    [searchFilteredGroups]
  );
  
  const pendingGroups = useMemo(() => 
    searchFilteredGroups.filter(group => !group.isPaid),
    [searchFilteredGroups]
  );

  // Calcular valores totais para cards de resumo
  const totalCommissionValue = useMemo(() => 
    commissionGroups.reduce((sum, group) => sum + group.totalValue, 0),
    [commissionGroups]
  );
  console.log("total commission value : ",totalCommissionValue);
  console.log("commissionGroups:", commissionGroups);


  const paidCount = useMemo(() => 
    commissionGroups.filter(g => g.isPaid).length,
    [commissionGroups]
  );
  
  const pendingCount = useMemo(() => 
    commissionGroups.length - paidCount,
    [commissionGroups, paidCount]
  );

  const handlePeriodChange = (value: string) => {
    setPeriodFilter(value as "all" | "year" | "month");
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(Number(value));
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(Number(value));
  };

  const handleForecastPeriodChange = (value: string) => {
    setForecastPeriod(value as "next" | "year" | "month");
  };

  const handleForecastYearChange = (value: string) => {
    setForecastYear(Number(value));
  };

  const handleForecastMonthChange = (value: string) => {
    setForecastMonth(Number(value));
  };

  // Generate the forecast card title based on selected period
  const getForecastTitle = () => {
    if (forecastPeriod === "next") {
      return "Próximo Pagamento";
    } else if (forecastPeriod === "year") {
      return `Comissões de ${forecastYear}`;
    } else if (forecastPeriod === "month") {
      return `Comissões de ${getMonthName(forecastMonth)} ${forecastYear}`;
    }
    return "Previsão de Pagamentos";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Comissões</h1>
        <p className="text-muted-foreground">
          Gerencie todas as comissões da plataforma
        </p>
      </div>

      {/* Forecast Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl">Previsão de Pagamentos</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={forecastPeriod} onValueChange={handleForecastPeriodChange}>
                <SelectTrigger className="w-[180px] bg-white">
                  <CalendarRange className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Próximo pagamento</SelectItem>
                  <SelectItem value="year">Anual</SelectItem>
                  <SelectItem value="month">Mensal</SelectItem>
                </SelectContent>
              </Select>

              {forecastPeriod === "year" && (
                <Select value={String(forecastYear)} onValueChange={handleForecastYearChange}>
                  <SelectTrigger className="w-[100px] bg-white">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {forecastPeriod === "month" && (
                <>
                  <Select value={String(forecastYear)} onValueChange={handleForecastYearChange}>
                    <SelectTrigger className="w-[100px] bg-white">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={String(forecastMonth)} onValueChange={handleForecastMonthChange}>
                    <SelectTrigger className="w-[130px] bg-white">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <SelectItem key={month} value={String(month)}>
                          {getMonthName(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4">
            <CommissionForecastCard
              title={getForecastTitle()}
              nextPaymentDate={forecast.nextPaymentDate}
              totalPendingAmount={forecast.totalPendingAmount}
              pendingBatches={forecast.pendingBatches}
              membersWithPending={forecast.membersWithPending}
              className="md:col-span-2 sm:col-span-2"
            />

            <CommissionSummaryCard 
              title="Total de Comissões"
              value={totalCommissionValue}
              icon="dollar-sign"
              description="Valor total de comissões geradas"
              className="md:col-span-1"
            />
            
            <CommissionSummaryCard 
              title="Comissões Pendentes"
              value={pendingCount}
              icon="wallet-cards"
              suffix=" lotes"
              description="Total de lotes de comissões pendentes"
              className="md:col-span-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Comissões</CardTitle>
          <CardDescription>
            Visualização e gerenciamento de comissões agrupadas por membro e período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="paid">Pagas</TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap gap-2 items-center">
                <div>
                  <Select 
                    value={periodFilter} 
                    onValueChange={handlePeriodChange}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filtrar por período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos períodos</SelectItem>
                      <SelectItem value="year">Anual</SelectItem>
                      <SelectItem value="month">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {periodFilter === "year" || periodFilter === "month" ? (
                  <div>
                    <Select 
                      value={String(selectedYear)} 
                      onValueChange={handleYearChange}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                {periodFilter === "month" ? (
                  <div>
                    <Select 
                      value={String(selectedMonth)} 
                      onValueChange={handleMonthChange}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Mês" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMonths.map(month => (
                          <SelectItem key={month} value={String(month)}>
                            {getMonthName(month)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                <div className="relative ml-auto sm:ml-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por membro..."
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <TabsContent value="all">
                <CommissionGroupTable commissionGroups={searchFilteredGroups} />
              </TabsContent>
              
              <TabsContent value="pending">
                <CommissionGroupTable commissionGroups={pendingGroups} />
              </TabsContent>
              
              <TabsContent value="paid">
                <CommissionGroupTable commissionGroups={paidGroups} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Mensal de Comissões</CardTitle>
          <CardDescription>
            Visualize as comissões geradas por mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <MonthlyCommissionChart commissions={commissions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommissions;
