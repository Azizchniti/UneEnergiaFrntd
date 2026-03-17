
import { Lead, LeadStatus } from "@/types";
import { generateId } from "@/utils/dataUtils";
import { toast } from "sonner";

export default class LeadService {
  private leads: Lead[];

  constructor(leads: Lead[]) {
    this.leads = leads;
  }

  addLead(leadData: Omit<Lead, "id" | "createdAt" | "updatedAt">) {
    // Verificar se o telefone já está cadastrado
    if (this.leads.some(l => l.phone === leadData.phone)) {
      toast.error("Telefone já cadastrado no sistema");
      return false;
    }

    const newLead: Lead = {
      ...leadData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.leads.push(newLead);
    toast.success("Lead adicionado com sucesso");
    return true;
  }

  updateLead(id: string, data: Partial<Lead>) {
    // Verificar se o telefone está sendo alterado e se já existe
    if (data.phone && this.leads.some(l => l.phone === data.phone && l.id !== id)) {
      toast.error("Telefone já cadastrado para outro lead");
      return false;
    }

    const index = this.leads.findIndex(lead => lead.id === id);
    if (index === -1) {
      toast.error("Lead não encontrado");
      return false;
    }
    
    this.leads[index] = { 
      ...this.leads[index], 
      ...data, 
      updatedAt: new Date() 
    };
    
    toast.success("Lead atualizado com sucesso");
    return true;
  }

  getMemberLeads(memberId: string) {
    return this.leads.filter(lead => lead.memberId === memberId);
  }

  getActiveLeads() {
    return this.leads.filter(lead => lead.status !== 'closed' && lead.status !== 'lost');
  }

  getClosedLeads() {
    return this.leads.filter(lead => lead.status === 'closed');
  }

  getLostLeads() {
    return this.leads.filter(lead => lead.status === 'lost');
  }

  getMemberActiveLeads(memberId: string) {
    return this.leads.filter(lead => 
      lead.memberId === memberId && 
      lead.status !== 'closed' && 
      lead.status !== 'lost'
    );
  }

  getMemberClosedLeads(memberId: string) {
    return this.leads.filter(lead => 
      lead.memberId === memberId && 
      lead.status === 'closed'
    );
  }

  getMemberLostLeads(memberId: string) {
    return this.leads.filter(lead => 
      lead.memberId === memberId && 
      lead.status === 'lost'
    );
  }

  getLeadCountByStatus() {
    return this.leads.reduce(
      (counts, lead) => {
        counts[lead.status]++;
        return counts;
      },
      { 
        new: 0, 
        contacted: 0, 
        'in-progress': 0, 
        negotiating: 0, 
        closed: 0, 
        lost: 0 
      } as Record<LeadStatus, number>
    );
  }

  getTotalSalesValue() {
    return this.leads
      .filter(lead => lead.status === "closed" && lead.saleValue)
      .reduce((sum, lead) => sum + (lead.saleValue || 0), 0);
  }

  findLead(id: string) {
    return this.leads.find(l => l.id === id);
  }

  addNotes(id: string, notes: string) {
    const lead = this.findLead(id);
    if (!lead) {
      toast.error("Lead não encontrado");
      return false;
    }

    return this.updateLead(id, { notes });
  }

  changeStatus(id: string, status: LeadStatus) {
    const lead = this.findLead(id);
    if (!lead) {
      toast.error("Lead não encontrado");
      return false;
    }

    return this.updateLead(id, { status });
  }
}
