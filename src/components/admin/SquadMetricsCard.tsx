import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/dataUtils";
import { Squad } from "@/types";
import { Users, User, Phone, DollarSign } from "lucide-react";

interface SquadMetricsCardProps {
  squad: Squad;
}

const SquadMetricsCard: React.FC<SquadMetricsCardProps> = ({ squad }) => {
  console.log("Squad data:", squad);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Squad de {squad.memberName}
        </CardTitle>
        <CardDescription>Visão geral do desempenho do squad</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Membros</p>
            <p className="text-lg font-semibold">{squad.memberCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Contatos</p>
            <p className="text-lg font-semibold">{squad.totalContacts}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vendas</p>
            <p className="text-lg font-semibold">{formatCurrency(squad.totalSales)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Comissão Total</p>
            <p className="text-lg font-semibold">{formatCurrency(squad.totalCommission)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SquadMetricsCard;
