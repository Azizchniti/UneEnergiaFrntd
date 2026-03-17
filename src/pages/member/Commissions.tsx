import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthlyCommissionChart } from "@/components/admin/MonthlyCommissionChart";
import {
  getMonthName,
  formatCurrency,
} from "@/utils/dataUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

const MemberCommissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const { user } = useAuth();
  const { commissions } = useData();
  const { leads } = useData();

  const memberId = user?.id;

    const getLeadNameById = (leadId: string) => {
  const lead = leads?.find((l) => l.id === leadId);
  return lead ? lead.name : "Lead não encontrado";
};

  const allCommissions = useMemo(() => {
    return commissions.filter((commission) => commission.member_id === memberId);
  }, [commissions, memberId]);

  const paidCommissions = useMemo(() => {
    return allCommissions.filter((c) => c.is_paid);
  }, [allCommissions]);

  const pendingCommissions = useMemo(() => {
    return allCommissions.filter((c) => !c.is_paid);
  }, [allCommissions]);

  const filteredCommissions = useMemo(() => {
    let filtered = allCommissions;

    if (periodFilter === "year") {
      filtered = filtered.filter(
        (c) => new Date(c.payment_date).getFullYear() === selectedYear
      );
    } else if (periodFilter === "month") {
      filtered = filtered.filter((c) => {
        const date = new Date(c.payment_date);
        return (
          date.getFullYear() === selectedYear &&
          date.getMonth() + 1 === selectedMonth
        );
      });
    }

     if (searchTerm) {
       filtered = filtered.filter((c) =>
         getLeadNameById(c.lead_id)?.toLowerCase().includes(searchTerm.toLowerCase())
       );
     }

    return filtered;
  }, [allCommissions, periodFilter, selectedYear, selectedMonth, searchTerm]);

  const availableYears = [2023, 2024, 2025];
  const availableMonths = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Minhas Comissões</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie suas comissões como membro da equipe.
        </p>
      </div>

      {/* History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Comissões</CardTitle>
          <CardDescription>Visualize comissões agrupadas por período.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="paid">Pagas</TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap gap-2 items-center">
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filtrar por período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos períodos</SelectItem>
                    <SelectItem value="year">Anual</SelectItem>
                    <SelectItem value="month">Mensal</SelectItem>
                  </SelectContent>
                </Select>

                {(periodFilter === "year" || periodFilter === "month") && (
                  <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {periodFilter === "month" && (
                  <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonths.map((month) => (
                        <SelectItem key={month} value={String(month)}>
                          {getMonthName(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="relative ml-auto sm:ml-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por lote..."
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tables */}
            <TabsContent value="all">
              {filteredCommissions.length > 0 ? (
                <ul className="space-y-2">
                  {filteredCommissions.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-xl border p-4 shadow-sm hover:shadow-md transition bg-white dark:bg-muted"
                  >
                    <div className="grid grid-cols-4 gap-4 text-sm sm:text-base">
                      {/* Lote */}
                      <div>
                        <p className="text-muted-foreground">Lote</p>
                        <p className="font-medium truncate">{getLeadNameById(c.lead_id)}</p>
                      </div>

                      {/* Valor */}
                      <div className="text-right">
                        <p className="text-muted-foreground">Valor</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(c.commission_value)}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="text-right">
                        <p className="text-muted-foreground">Status</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            c.is_paid
                              ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100"
                          }`}
                        >
                          {c.is_paid ? "Paga" : "Pendente"}
                        </span>
                      </div>

                      {/* Data */}
                      <div className="text-right">
                        <p className="text-muted-foreground">Data</p>
                        <p className="font-medium">
                          {new Date(c.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>


                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground mt-4">Nenhuma comissão encontrada.</p>
              )}
            </TabsContent>

           <TabsContent value="pending">
  {pendingCommissions.length > 0 ? (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {pendingCommissions.map((c) => (
        <div
          key={c.id}
          className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-muted"
        >
          <div className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">Lote</div>
            <div className="text-base font-medium">
              {getLeadNameById(c.lead_id)}
            </div>

            <div className="text-sm text-muted-foreground">Valor</div>
            <div className="text-base font-semibold text-green-600">
              {formatCurrency(c.commission_value)}
            </div>

            <div className="text-sm text-muted-foreground">Status</div>
            <div className="inline-block w-fit rounded-full px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Pendente
            </div>

            <div className="text-sm text-muted-foreground">Data</div>
            <div className="text-base">
              {new Date(c.payment_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-muted-foreground mt-4">Nenhuma comissão pendente.</p>
  )}
</TabsContent>

<TabsContent value="paid">
  {paidCommissions.length > 0 ? (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {paidCommissions.map((c) => (
        <div
          key={c.id}
          className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-muted"
        >
          <div className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">Lote</div>
            <div className="text-base font-medium">
              {getLeadNameById(c.lead_id)}
            </div>

            <div className="text-sm text-muted-foreground">Valor</div>
            <div className="text-base font-semibold text-green-600">
              {formatCurrency(c.commission_value)}
            </div>

            <div className="text-sm text-muted-foreground">Status</div>
            <div className="inline-block w-fit rounded-full px-3 py-1 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Paga
            </div>

            <div className="text-sm text-muted-foreground">Data</div>
            <div className="text-base">
              {new Date(c.payment_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-muted-foreground mt-4">Nenhuma comissão paga.</p>
  )}
</TabsContent>

          </Tabs>
        </CardContent>
      </Card>

      {/* Monthly Summary Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Mensal de Comissões</CardTitle>
          <CardDescription>
            Acompanhe visualmente suas comissões mensais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <MonthlyCommissionChart commissions={allCommissions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberCommissions;
