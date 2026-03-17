
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/dataUtils";
import { DollarSign, Receipt, WalletCards } from "lucide-react";

interface CommissionSummaryCardProps {
  title: string;
  value: number;
  icon: "dollar-sign" | "receipt" | "wallet-cards";
  description: string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const CommissionSummaryCard: React.FC<CommissionSummaryCardProps> = ({
  title,
  value,
  icon,
  description,
  className = "",
  prefix = "",
  suffix = "",
}) => {
  const renderIcon = () => {
    switch (icon) {
      case "dollar-sign":
        return <DollarSign className="h-5 w-5 text-primary" />;
      case "receipt":
        return <Receipt className="h-5 w-5 text-primary" />;
      case "wallet-cards":
        return <WalletCards className="h-5 w-5 text-primary" />;
      default:
        return <DollarSign className="h-5 w-5 text-primary" />;
    }
  };

  const formattedValue = typeof value === 'number' && !suffix ? formatCurrency(value) : `${prefix}${value}${suffix}`;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">{title}</p>
          <div className="rounded-full bg-primary/10 p-1">
            {renderIcon()}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{formattedValue}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommissionSummaryCard;
