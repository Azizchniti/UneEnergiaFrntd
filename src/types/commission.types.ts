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