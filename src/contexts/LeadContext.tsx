// src/contexts/LeadContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Lead, LeadStatus } from "@/types";
import { toast } from "sonner";
import { LeadService } from "@/services/leads.service";
import { useMemberContext } from "./MemberContext";

type LeadContextType = {
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id" | "created_at" | "updated_at">) => Promise<boolean>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>; 
  closeLead: (id: string, saleValue: number) => Promise<void>;
  getMemberLeads: (memberId: string) => Lead[];
  getActiveLeads: () => Lead[];
  getClosedLeads: () => Lead[];
  getLostLeads: () => Lead[];
  getMemberActiveLeads: (memberId: string) => Lead[];
  getMemberClosedLeads: (memberId: string) => Lead[];
  getMemberLostLeads: (memberId: string) => Lead[];
  fetchLeads: () => Promise<void>;
  addNotes: (id: string, notes: string) => Promise<boolean>;
  changeStatus: (id: string, status: LeadStatus) => Promise<boolean>;
  findLead: (id: string) => Lead | undefined;
  getLeadCountByStatus: () => Record<LeadStatus, number>;
  getTotalSalesValue: () => number;
};

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const { members } = useMemberContext();

  // Load leads on mount
  useEffect(() => {
    (async () => {
      try {
        const fetchedLeads = await LeadService.getAllLeads();
        setLeads(fetchedLeads);
      } catch (err) {
        toast.error("Erro ao carregar os leads");
      }
    })();
  }, []);

  const refreshLeads = async () => {
    const updated = await LeadService.getAllLeads();
    setLeads(updated);
  };

  const addLead = async (
    leadData: Omit<Lead, "id" | "created_at" | "updated_at">
  ): Promise<boolean> => {
    try {
      await LeadService.createLead(leadData);
      await refreshLeads();
      toast.success("Lead adicionado com sucesso");
      return true;
    } catch (err) {
      toast.error("Erro ao adicionar o lead");
      return false;
    }
  };

  const updateLead = async (id: string, data: Partial<Lead>) => {
    try {
      await LeadService.updateLead(id, data);
      await refreshLeads();
    } catch (err) {
      toast.error("Erro ao atualizar o lead");
    }
  };

  const closeLead = async (id: string, sale_value: number) => {
    try {
      await LeadService.updateLead(id, {
        status: "closed",
        sale_value,
      });
      await refreshLeads();
      toast.success("Lead fechado com sucesso");
    } catch (err) {
      toast.error("Erro ao fechar o lead");
    }
  };
  const deleteLead = async (id: string): Promise<void> => {
  try {
    await LeadService.deleteLead(id);
    await refreshLeads();
    toast.success("Lead deletado com sucesso");
  } catch (err) {
    toast.error("Erro ao deletar o lead");
  }
};


  const getMemberLeads = (memberId: string) => {
    return leads.filter((lead) => lead.member_id === memberId);
  };

  const getActiveLeads = () => leads.filter((lead) => lead.status === "in-progress");
  const getClosedLeads = () => leads.filter((lead) => lead.status === "closed");
  const getLostLeads = () => leads.filter((lead) => lead.status === "lost");

  const getMemberActiveLeads = (memberId: string) =>
    leads.filter((lead) => lead.member_id === memberId && lead.status === "in-progress");

  const getMemberClosedLeads = (memberId: string) =>
    leads.filter((lead) => lead.member_id === memberId && lead.status === "closed");

  const getMemberLostLeads = (memberId: string) =>
    leads.filter((lead) => lead.member_id === memberId && lead.status === "lost");


    const addNotes = async (id: string, newNote: string): Promise<boolean> => {
  try {
    const lead = leads.find((lead) => lead.id === id);
    if (!lead) throw new Error("Lead não encontrado");

    await LeadService.updateLead(id, { notes: newNote }); // ✅ Replace, don't append
    await refreshLeads();
    return true;
  } catch (err) {
    toast.error("Erro ao adicionar nota");
    return false;
  }
};



  const changeStatus = async (id: string, status: LeadStatus): Promise<boolean> => {
    try {
      await LeadService.updateLead(id, { status });
      await refreshLeads();
      return true;
    } catch (err) {
      toast.error("Erro ao mudar o status do lead");
      return false;
    }
  };

  const findLead = (id: string) => leads.find((lead) => lead.id === id);

  const getLeadCountByStatus = () => {
    return leads.reduce(
      (acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      {} as Record<LeadStatus, number>
    );
  };

  const getTotalSalesValue = () => {
    return leads
      .filter((lead) => lead.status === "closed")
      .reduce((acc, lead) => acc + (lead.sale_value || 0), 0);
  };

  // LeadContext.tsx (assumed structure)
const fetchLeads = async () => {
  try {
    const leadsFromApi = await LeadService.getAllLeads();
    setLeads(leadsFromApi); // assuming you're using useState to store leads
  } catch (error) {
    console.error("Erro ao buscar leads:", error);
  }
};


  return (
    <LeadContext.Provider
      value={{
        leads,
        addLead,
        updateLead,
        deleteLead,
        closeLead,
        getMemberLeads,
        getActiveLeads,
        getClosedLeads,
        getLostLeads,
        getMemberActiveLeads,
        getMemberClosedLeads,
        getMemberLostLeads,
        addNotes,
        changeStatus,
        findLead,
        getLeadCountByStatus,
        getTotalSalesValue,
        fetchLeads,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLeadContext = (): LeadContextType => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error("useLeadContext deve ser usado dentro de um LeadProvider");
  }
  return context;
};
