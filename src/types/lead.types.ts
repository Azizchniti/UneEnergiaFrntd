export type LeadStatus = 'new' | 'contacted' | 'in-progress' | 'negotiating' | 'closed' | 'lost';
export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  status: LeadStatus
  member_id: string;
  sale_value: number;
  created_at: string;
  updated_at: string;
  observations?: string;
}
