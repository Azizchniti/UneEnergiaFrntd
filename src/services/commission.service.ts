// src/services/commission.service.ts

import axios from "axios";
import { Commission, MonthlyCommission } from "@/types";
import { BASE_URL } from "@/config/api";

const API_URL = `${BASE_URL}/api/commissions`; // Adjust if needed
//const API_URL = 'http://localhost:3000/api/commissions';
let commissions: Commission[] = [];

export const CommissionService = {
async getAll(): Promise<Commission[]> {
  const res = await axios.get(API_URL);
  commissions = res.data; // <-- store in memory
  return commissions;
},

  async getById(id: string): Promise<Commission> {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  async create(data: Partial<Commission>): Promise<Commission> {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  async update(id: string, data: Partial<Commission>): Promise<Commission> {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },
   updateCommissionPaymentStatus: (id: string, is_paid: boolean, payment_date: Date | null): boolean => {
    const index = commissions.findIndex(c => c.id === id);
    if (index !== -1) {
      commissions[index] = { ...commissions[index], is_paid, payment_date };
      return true;
    }
    return false;
  },

updateMemberMonthlyCommissions: async (
  memberId: string,
  isPaid: boolean
): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/member/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_paid: isPaid }),
    });

    if (!res.ok) {
      console.error("Failed to update commissions", await res.json());
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error updating commissions:", err);
    return false;
  }
}

,

  calculateCommission: (saleValue: number, memberLine: number, uplineGrade?: string | null) => {
    const baseRate = 0.1;
    const uplineRate = uplineGrade === "A" ? 0.05 : 0.03;
    return {
      memberCommission: saleValue * baseRate,
      uplineCommission: saleValue * uplineRate,
    };
  },

  getNextPaymentDate: (): Date => {
    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
    return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
  },

getCommissionsForecast: (startDate?: Date, endDate?: Date) => {
  console.log("All commissions:", commissions.length);

  const filtered = commissions.filter(c => {
    const saleDate = new Date(c.sale_date);
    console.log('Filtering commission', c.id, 'saleDate:', saleDate);

    if (startDate && saleDate < startDate) return false;
    if (endDate && saleDate > endDate) return false;
    return !c.is_paid;
  });

  console.log("Filtered commissions:", filtered.length);

  return {
    nextPaymentDate: CommissionService.getNextPaymentDate(),
    totalPendingAmount: filtered.reduce((sum, c) => sum + c.commission_value, 0),
    pendingBatches: 0, // since no batchId
    membersWithPending: new Set(filtered.map(c => c.member_id)).size,
  };
},
async getMemberMonthlyCommissions(memberId: string): Promise<MonthlyCommission[]> {
  const res = await axios.get(`${API_URL}/monthly/${memberId}`);
  return res.data;
},



};
