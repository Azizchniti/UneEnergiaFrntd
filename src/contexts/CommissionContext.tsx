
import React, { createContext, useContext, useEffect, useState } from "react";
import { Commission, MonthlyCommission } from "@/types";
import { toast } from "sonner";
import { MOCK_COMMISSIONS } from "@/data/mockData";
import {CommissionService} from "@/services/commission.service";

// Commission context type definition
type CommissionContextType = {
  commissions: Commission[];
  getMemberCommissions: (memberId: string) => Commission[];
  getMemberMonthlyCommissions: (memberId: string) => MonthlyCommission[];
  updateCommissionPaymentStatus: (id: string, isPaid: boolean, paymentDate: Date | null) => boolean;
  updateMemberMonthlyCommissions: (memberId: string, isPaid: boolean) => Promise<boolean>;
  getNextPaymentDate: () => Date;
  calculateCommission: (saleValue: number, memberLine: number, uplineGrade?: string | null) => {
    memberCommission: number;
    uplineCommission: number;
  };
  getCommissionsForecast: (startDate?: Date, endDate?: Date) => {
    nextPaymentDate: Date;
    totalPendingAmount: number;
    pendingBatches: number;
    membersWithPending: number;
  };
};

const CommissionContext = createContext<CommissionContextType | undefined>(undefined);

export const CommissionProvider: React.FC<{ 
  children: React.ReactNode, 
  memberCommissionService?: any 
}> = ({
  children,
  memberCommissionService = null,
}) => {
  //const [commissions, setCommissions] = useState<Commission[]>(MOCK_COMMISSIONS);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  
  // Instantiate the service
  
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await CommissionService.getAll();
      setCommissions(data);
    } catch (error) {
      toast.error("Failed to fetch commissions");
      console.error(error);
    }
  };

  fetchData();
}, []);

  // Commission management functions
  const getMemberCommissions = (memberId: string) => {
    return commissions.filter(commission => commission.member_id === memberId);
  };

const getMemberMonthlyCommissions = (memberId: string): MonthlyCommission[] => {
  // This needs to be asynchronous if you're calling the API
  throw new Error("This function must be called asynchronously.");
};


  const updateCommissionPaymentStatus = (id: string, isPaid: boolean, paymentDate: Date | null) => {
    if (CommissionService.updateCommissionPaymentStatus(id, isPaid, paymentDate)) {
      setCommissions([...CommissionService["commissions"]]);
      return true;
    }
    return false;
  };

const updateMemberMonthlyCommissions = async (
  memberId: string,
  isPaid: boolean
): Promise<boolean> => {
  const success = await CommissionService.updateMemberMonthlyCommissions(memberId, isPaid);

  if (success) {
    const updated = await CommissionService.getAll(); // Refetch from backend
    setCommissions(updated);
    return true;
  }

  return false;
};


  // New function to calculate commission based on the new rules
  const calculateCommission = (saleValue: number, memberLine: number, uplineGrade?: string | null) => {
    return CommissionService.calculateCommission(saleValue, memberLine, uplineGrade);
  };

  // Forecast functions
  const getNextPaymentDate = () => {
    return CommissionService.getNextPaymentDate();
  };

  const getCommissionsForecast = (startDate?: Date, endDate?: Date) => {
    return CommissionService.getCommissionsForecast(startDate, endDate);
  };

  return (
    <CommissionContext.Provider
      value={{
        commissions,
        getMemberCommissions,
        getMemberMonthlyCommissions,
        updateCommissionPaymentStatus,
        updateMemberMonthlyCommissions,
        calculateCommission,
        getNextPaymentDate,
        getCommissionsForecast,
      }}
    >
      {children}
    </CommissionContext.Provider>
  );
};

export const useCommissionContext = (): CommissionContextType => {
  const context = useContext(CommissionContext);
  if (!context) {
    throw new Error("useCommissionContext deve ser usado dentro de um CommissionProvider");
  }
  return context;
};
