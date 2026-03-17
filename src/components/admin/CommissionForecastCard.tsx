
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/dataUtils";

interface CommissionForecastCardProps {
  title: string;
  nextPaymentDate: Date;
  totalPendingAmount: number;
  pendingBatches: number;
  membersWithPending: number;
  className?: string;
}

const CommissionForecastCard: React.FC<CommissionForecastCardProps> = ({
  title,
  nextPaymentDate,
  totalPendingAmount,
  pendingBatches,
  membersWithPending,
  className = ""
}) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Próximo pagamento
            </span>
            <span className="font-medium">{formatDate(nextPaymentDate)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total pendente</span>
            <span className="text-lg font-bold">{formatCurrency(totalPendingAmount)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Lotes pendentes</p>
              <p className="text-xl font-bold">{pendingBatches}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Membros</p>
              <p className="text-xl font-bold">{membersWithPending}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommissionForecastCard;
