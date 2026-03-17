import React, { useEffect, useState } from "react";
import SquadMetricsCard from "./SquadMetricsCard";
import { Member, Squad } from "@/types";
import { MemberService } from "@/services/members.service";
import { toast } from "sonner";

const SquadsDashboard: React.FC = () => {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data: Member[] = await MemberService.getAllMembers();

                    const squadsData: Squad[] = data
                    .filter(member => member.upline_id === null) // Leaders (Line 1)
                    .map(leader => {
                        const line2Members = data.filter(m => m.upline_id === leader.id);

                        const squadMembers = [leader, ...line2Members];

                        const totalContacts = squadMembers.reduce((sum, m) => sum + (m.total_contacts || 0), 0);
                        const totalSales = squadMembers.reduce((sum, m) => sum + (m.total_sales || 0), 0);
                        const totalCommission = squadMembers.reduce((sum, m) => sum + (m.total_commission || 0), 0);

                        return {
                        memberId: leader.id, // ✅ this should match the Squad interface
                        memberName: `${leader.first_name} ${leader.last_name}`,
                        memberCount: squadMembers.length,
                        totalContacts,
                        totalSales,
                        totalCommission,
                        };
                    });


        setSquads(squadsData);
        console.log("SquadsData:", squadsData);

      } catch (error) {
        toast.error("Erro ao buscar membros");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  if (loading) return <div>Carregando squads...</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {squads.map((squad) => (
        <SquadMetricsCard key={squad.memberId} squad={squad} />

      ))}
    </div>
  );
};

export default SquadsDashboard;
