export type MemberStatus = 'pending' | 'approved' | 'rejected'
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
  status: MemberStatus;
  has_seen_tutorial: boolean;  // Assuming upline_id can be nullable
  // Add any other fields that might exist in your table if necessary
}
