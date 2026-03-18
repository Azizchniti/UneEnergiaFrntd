
import { Member, Commission, MonthlyCommission } from "@/types";

export default class MemberCommissionService {
  private members: Member[];
  private commissions: Commission[];

  constructor(members: Member[], commissions: Commission[]) {
    this.members = members;
    this.commissions = commissions;
  }

  getMemberMonthlyCommissions(memberId: string): MonthlyCommission[] {
    // Filter commissions for the member
    const memberCommissions = this.commissions.filter(
      (commission) => commission.member_id === memberId
    );

    // Group commissions by month and year
    const monthlyCommissionsMap = new Map<string, MonthlyCommission>();

    memberCommissions.forEach((commission) => {
      const date = new Date(commission.sale_date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (!monthlyCommissionsMap.has(key)) {
        const monthNames = [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];

        monthlyCommissionsMap.set(key, {
          month: monthNames[month - 1],
          year: year,
          total_commission: 0,
          isPaid: true, // Will be updated
          details: [],
        });
      }

      const monthlyCommission = monthlyCommissionsMap.get(key)!;
      monthlyCommission.total_commission += commission.commission_value;
      monthlyCommission.details.push(commission);
      
      // If any commission in this month is not paid, the whole month is considered unpaid
      if (!commission.is_paid) {
        monthlyCommission.isPaid = false;
      }
    });

    // Convert map to array and sort by date (newest first)
    return Array.from(monthlyCommissionsMap.values()).sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Sort by year in descending order
      }
      // Extract month index from month name
      const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      const aMonthIndex = monthNames.indexOf(a.month);
      const bMonthIndex = monthNames.indexOf(b.month);
      return bMonthIndex - aMonthIndex; // Sort by month in descending order
    });
  }
}
