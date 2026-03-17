import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { Member } from "@/types";
import { motion } from "framer-motion";
import { MemberService } from "@/services/members.service";

const gradeColors: Record<string, string> = {
  beginner: "bg-slate-500",
  silver: "bg-blue-500",
  gold: "bg-yellow-500",
  platinum: "bg-violet-500",
  diamond: "bg-emerald-500",
};

const medalIcons = ["🥇", "🥈", "🥉"];

type TopSquad = {
  leader: Member;
  associates: Member[];
  totalCommission: number;
};

const RankingPage = () => {
  const [ranking, setRanking] = useState<Member[]>([]);
  const [topSquads, setTopSquads] = useState<TopSquad[]>([]);
  const { getTopMembers } = useData();

useEffect(() => {
  const fetchData = async () => {
    const members = await getTopMembers();
    const squads = await MemberService.getTopSquads();

    if (members) setRanking(members);
    if (squads) setTopSquads(squads);
  };
  fetchData();
}, [getTopMembers]);


  return (
    <div className="max-w-6xl mx-auto p-6 space-y-20">
      {/* Top Members */}
      <section>
        <h1 className="text-4xl font-extrabold mb-10 text-center bg-gradient-to-r from-yellow-400 via-violet-500 to-green-400 bg-clip-text text-transparent">
          🏆 Ranking de Comissões
        </h1>

        <div className="space-y-6">
          {ranking.slice(0, 5).map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="flex items-center justify-between p-6 rounded-2xl shadow-xl bg-white/80 backdrop-blur-lg border border-slate-200 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-5">
                  <div className="text-3xl font-bold w-10 text-center">
                    {index < 3 ? medalIcons[index] : index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-slate-800">
                      {member.first_name} {member.last_name}
                    </p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 text-xs font-bold rounded-full shadow-sm text-white capitalize ${gradeColors[member.grade]}`}
                    >
                      {member.grade}
                    </span>
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(member.total_commission)}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Squads */}
      <section>
        <h2 className="text-4xl font-extrabold mb-10 text-center bg-gradient-to-r from-green-400 via-violet-500 to-yellow-400 bg-clip-text text-transparent">
          👥 Top Squads
        </h2>

        <div className="space-y-8">
          {topSquads.slice(0, 3).map((squad, index) => (
            <motion.div
              key={squad.leader.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="p-6 rounded-2xl shadow-xl bg-white/90 backdrop-blur border border-slate-200 hover:shadow-2xl transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{medalIcons[index] || index + 1}</div>
                    <div>
                      <p className="font-bold text-lg">
                        Leader: {squad.leader.first_name} {squad.leader.last_name}
                      </p>
                      <span
                        className={`inline-block mt-1 px-3 py-1 text-xs font-bold rounded-full text-white capitalize ${gradeColors[squad.leader.grade]}`}
                      >
                        {squad.leader.grade}
                      </span>
                    </div>
                  </div>
                  <div className="text-green-600 text-lg font-semibold">
                    Total Comissão:{" "}
                    {Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(squad.totalCommission)}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t">
                  {squad.associates.map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-100 p-3 rounded-xl text-sm shadow-sm text-center"
                    >
                      <p className="font-medium">
                        {m.first_name} {m.last_name}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full text-white ${gradeColors[m.grade]}`}
                      >
                        {m.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RankingPage;
