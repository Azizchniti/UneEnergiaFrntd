
export type UserRole = 'admin' | 'member';

export type MemberGrade = 'silver' | 'gold' | 'platinum' | 'diamond';

export type LeadStatus = 'new' | 'contacted' | 'in-progress' | 'negotiating' | 'closed' | 'lost';

export type AnnouncementType = 'news' | 'notice' | 'announcement';


export interface profile {
  id: string;
  first_name:string;
  last_name:string;
  email: string;
  role: UserRole;
  createdAt: Date;
  cpf: string;
  phone: string;
}

export interface Member {
  id: string;
  cpf: string;
  phone: string;
  grade: string;
  total_sales: number;
  total_contacts: number;
  total_commission: number;
  first_name: string;
  last_name: string;
  upline_id: string | null; 
  profile_picture?: string;// Assuming upline_id can be nullable
  // Add any other fields that might exist in your table if necessary
}


// export interface Lead {
//   id: string;
//   name: string;
//   phone: string;
//   source: string;
//   status: LeadStatus;
//   memberId: string; // ID do membro que cadastrou o lead
//   memberName?: string; // Nome do membro que cadastrou o lead
//   createdAt: Date;
//   updatedAt: Date;
//   saleValue?: number; // Valor da venda se o lead foi convertido
//   notes?: string; // Observações sobre o lead
// }
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
  notes?: string;
}

export interface Squad {
  memberCount?: number;
  totalContacts: number;
  totalSales: number;
  totalCommission: number;
}

export interface Commission {
  id: string;
  member_id: string;
  lead_id: string;
  sale_value: number;
  commission_percentage: number;
  commission_value: number;
  sale_date: Date;
  payment_date: Date | null;
  is_paid: boolean;
}

export interface MonthlyCommission {
  month: string;
  year: number;
  total_commission: number;
  isPaid: boolean;
  details: Commission[];
}

export interface CommissionGroup {
  id: string;
  memberId: string;
  memberName: string;
  month: number;
  year: number;
  commissions: Commission[];
  totalValue: number;
  isPaid: boolean;
  dueDate: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  publish_date: Date;
  expiry_date?: Date;
  is_published: boolean;
  is_highlighted: boolean;
  author_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface AnnouncementView {
  id: string;
  user_id: string;
  announcement_id: string;
  viewed_at: string; // use string since Supabase returns ISO timestamps
}
