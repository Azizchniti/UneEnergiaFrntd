
import React, { createContext, useContext } from "react";
import { Member, Lead, Commission, Squad, MonthlyCommission, LeadStatus } from "@/types";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { MemberProvider, useMemberContext } from "./MemberContext";
import { LeadProvider, useLeadContext } from "./LeadContext";
import { CommissionProvider, useCommissionContext } from "./CommissionContext";
import { MemberService } from "@/services/members.service";
import MemberCommissionService from "@/services/memberCommissionService";
type TopSquad = {
  leader: Member;
  associates: Member[];
  totalCommission: number;
};
// Combined context type definition
type DataContextType = {
  members: Member[];
  leads: Lead[];
  commissions: Commission[];
  //addMember: (member: Omit<Member, "id" | "createdAt" | "grade" | "totalSales" | "totalContacts" | "totalCommission">) => void;
  updateMember: (id: string, data: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addLead: (lead: Omit<Lead, "id" | "created_at" | "updated_at">) => Promise<boolean>;
  fetchLeads: () => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  closeLead: (id: string, sale_value: number) => void;
  getMemberCommissions: (memberId: string) => Commission[];
  getMemberSquad: (memberId: string) => Promise<Member[]>;
  getSquadMetrics: (memberId: string) => Promise<import("@/types").Squad>; 
  getMemberMonthlyCommissions: (memberId: string) => MonthlyCommission[];
  getTopMembers: () => Member[];
  getTopSquads: () => TopSquad[];
  getLeadCountByStatus: () => Record<LeadStatus, number>;
  getTotalSalesValue: () => number;
  findMemberPath: (memberId: string) => Member[];
  getMemberLeads: (memberId: string) => Lead[];
  getActiveLeads: () => Lead[];
  getClosedLeads: () => Lead[];
  getLostLeads: () => Lead[];
  getMemberActiveLeads: (memberId: string) => Lead[];
  getMemberClosedLeads: (memberId: string) => Lead[];
  getMemberLostLeads: (memberId: string) => Lead[];
  addNotes: (id: string, notes: string) => Promise<boolean>;
  changeStatus: (id: string, status: LeadStatus, saleValue: number | null) => Promise<boolean>;
  findLead: (id: string) => Lead | undefined;
  updateCommissionPaymentStatus: (id: string, isPaid: boolean, paymentDate: Date | null) => boolean;
  updateMemberMonthlyCommissions: (memberId: string, isPaid: boolean) => Promise<boolean>;
  getNextPaymentDate: () => Date;
  getCommissionsForecast: (startDate?: Date, endDate?: Date) => {
    nextPaymentDate: Date;
    totalPendingAmount: number;
    pendingBatches: number;
    membersWithPending: number;
  };
};

// Create the actual React context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Create a composite provider that will wrap all our individual providers
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <MemberProvider>
      <MemberConsumer>
        {(memberContext) => (
          <CommissionProvider memberCommissionService={new MemberCommissionService(memberContext.members, [])}>
            <LeadProvider>
              <DataContextBridge>
                {children}
              </DataContextBridge>
            </LeadProvider>
          </CommissionProvider>
        )}
      </MemberConsumer>
    </MemberProvider>
  );
};

// Helper component to consume the MemberContext and pass it down
const MemberConsumer: React.FC<{ 
  children: (context: ReturnType<typeof useMemberContext>) => React.ReactNode 
}> = ({ children }) => {
  const context = useMemberContext();
  return <>{children(context)}</>;
};

// Bridge component to combine all contexts and provide a single DataContext
const DataContextBridge = ({ children }: { children: React.ReactNode }) => {
  const memberContext = useMemberContext();
  const leadContext = useLeadContext();
  const commissionContext = useCommissionContext();

  // Create commissionService for member calculations

const getMemberSquad = (memberId: string): Promise<Member[]> => {
  return MemberService.getMemberSquad(memberId);
};

  // Implement closeLead which needs to coordinate between contexts
  const closeLead = (id: string, sale_value: number) => {
    // Find the lead
    const lead = leadContext.findLead(id);
    if (!lead) {
      toast.error("Lead não encontrado");
      return;
    }
    

    // Update the lead
    leadContext.updateLead(id, { status: "closed" as LeadStatus, sale_value });

    // Find the member that owns the lead
    const member = memberContext.members.find(m => m.id === lead.member_id);
    if (!member) {
      toast.error("Membro responsável não encontrado");
      return;
    }


    // Determine the member's line (1 or 2)
    const memberLine = MemberService.getMemberLine(member.id);
    
    // Process the sale for the member
    const { memberCommission, uplineCommission } = commissionContext.calculateCommission(
      sale_value, 
      memberLine,
      memberLine === 2 ? memberContext.members.find(m => m.id === member.upline_id)?.grade : null
    );
    
    // Add commission for the member
    const newCommission = {
      memberId: member.id,
      memberName: member.first_name,
      leadId: lead.id,
      leadName: lead.name,
      sale_value,
      commissionPercentage: 3, // Fixed at 3%
      commissionValue: memberCommission,
      saleDate: new Date(),
      paymentDate: null,
      isPaid: false,
    };
    
    // Update member metrics
    memberContext.updateMember(member.id, {
      total_sales: member.total_sales + sale_value,
      total_commission: member.total_commission + memberCommission
    });
    
    // If member is in Line 2 and has an upline with Gold+ grade, add commission for upline
    if (memberLine === 2 && member.upline_id) {
      const uplineMember = memberContext.members.find(m => m.id === member.upline_id);
      if (uplineMember && ["gold", "platinum", "diamond"].includes(uplineMember.grade)) {
        // Add upline commission
        const uplineCommissionPercentage = uplineMember.grade === "gold" ? 0.5 : 1;
        
        const uplineCommissionEntry = {
          memberId: uplineMember.id,
          memberName: uplineMember.first_name,
          leadId: lead.id,
          leadName: lead.name,
          sale_value,
          commissionPercentage: uplineCommissionPercentage,
          commissionValue: uplineCommission,
          saleDate: new Date(),
          paymentDate: null,
          isPaid: false,
        };
        
        // Update upline metrics
        memberContext.updateMember(uplineMember.id, {
          total_sales: uplineMember.total_sales + sale_value,
          total_commission: uplineMember.total_commission + uplineCommission
        });
      }
    }
    
    toast.success("Lead fechado e comissões calculadas com sucesso");
  };
  type SquadSummary = Pick<Squad, 'totalSales' | 'totalContacts' | 'totalCommission'>;

  const getSquadMetrics = async (memberId: string): Promise<Squad> => {
  try {
    const metrics = await MemberService.getSquadMetrics(memberId); // this must hit your backend
    return metrics;
  } catch (error) {
    console.error("Failed to fetch squad metrics:", error);
    return {
      totalSales: 0,
      totalContacts: 0,
      totalCommission: 0,
    }; // or whatever your Squad type requires as defaults
  }
};
const changeStatus = async (id: string, status: LeadStatus, saleValue: number | null): Promise<boolean> => {
  const lead = leadContext.findLead(id);
  if (!lead) {
    toast.error("Lead não encontrado");
    return false;
  }

  // Update the lead with new status and sale value
  leadContext.updateLead(id, { status, sale_value: saleValue ?? 0 });

  // Optionally, show a toast
  toast.success("Status do lead atualizado");

  return true;
};


  // The combined DataContext value
  const dataContextValue: DataContextType = {
    ...memberContext,
    ...leadContext,
    closeLead,
    commissions: commissionContext.commissions,
    getMemberCommissions: commissionContext.getMemberCommissions,
    getMemberMonthlyCommissions: commissionContext.getMemberMonthlyCommissions,
    updateCommissionPaymentStatus: commissionContext.updateCommissionPaymentStatus,
    updateMemberMonthlyCommissions: commissionContext.updateMemberMonthlyCommissions,
    getNextPaymentDate: commissionContext.getNextPaymentDate,
    getCommissionsForecast: commissionContext.getCommissionsForecast,
    getMemberSquad, 
    getSquadMetrics,
    changeStatus,
    fetchLeads: leadContext.fetchLeads,
    
  };
  
  return (
    <DataContext.Provider value={dataContextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Export the useData hook to access the combined context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData deve ser usado dentro de um DataProvider");
  }
  return context;
};
