import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, Users, BarChart3, DollarSign, Hash } from "lucide-react";
import { useMemberContext } from "@/contexts/MemberContext";
import { MemberService } from "@/services/members.service";
import { toast } from "sonner";
import { Member } from "@/types";

const gradeColors: Record<string, string> = {
  beginner: "bg-gray-200 text-gray-800",
  standard: "bg-blue-200 text-blue-800",
  gold: "bg-yellow-300 text-yellow-900",
  platinum: "bg-slate-300 text-slate-800",
  diamond: "bg-purple-300 text-purple-900",
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [member, setCurrentMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState(false);
const [editedCPF, setEditedCPF] = useState('');
const [editedPhone, setEditedPhone] = useState('');

console.log("user.id:", user?.id);
useEffect(() => {
  const fetchMember = async () => {
    if (user?.id) {
      try {
        const memberData = await MemberService.getMemberById(user.id);
        setCurrentMember(memberData);
        setEditedCPF(memberData.cpf || '');
        setEditedPhone(memberData.phone || '');

      } catch (err) {
        console.error("Failed to fetch member:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  fetchMember();
}, [user?.id]);


  if (!member) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Carregando informações do membro...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-2">
      {/* Header */}
    <div className="flex flex-col items-center gap-2">
  <div className="relative w-24 h-24">
    {member.profile_picture ? (
      <img
        src={member.profile_picture}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover"
      />
    ) : (
      <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
        {member.first_name[0]}
      </div>
    )}

    {/* Hidden input */}
    <input
      id="file-upload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={async (e) => {
        if (!e.target.files || e.target.files.length === 0 || !user) return;
        const file = e.target.files[0];
        try {
          const result = await MemberService.uploadProfilePicture(user.id, file);
          toast.success("Foto de perfil atualizada!");
          const updated = await MemberService.getMemberById(user.id);
          setCurrentMember(updated);
        } catch (err) {
          toast.error("Erro ao enviar a imagem.");
          console.error(err);
        }
      }}
    />

    {/* Plus button label */}
    <label
      htmlFor="file-upload"
      className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-lg border-2 border-white"
      title="Alterar foto"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </label>
  </div>

        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">
            {member.first_name} {member.last_name}
          </h1>
          <div className="flex justify-center sm:justify-start gap-2">
            <Badge className={gradeColors[member.grade]}>
              {member.grade.charAt(0).toUpperCase() + member.grade.slice(1)}
            </Badge>
          </div>
          {/* <p className="text-muted-foreground text-sm">ID: {member.id}</p> */}
        </div>
      </div>

      <Separator />

      {/* Info Grid */}
 {/* Info Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <Card>
  <CardHeader className="flex justify-between items-center pb-2">
    <CardTitle className="text-sm font-medium">CPF</CardTitle>
    <Hash className="w-4 h-4 text-muted-foreground" />
  </CardHeader>
  <CardContent className="text-center">
    {editMode ? (
     <div className="flex justify-center">
        <input
          type="text"
          value={editedCPF}
          onChange={(e) => setEditedCPF(e.target.value)}
          placeholder="Digite seu CPF"
          className="text-center w-full max-w-xs px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
        />
  </div>

    ) : (
      <p className="text-lg font-semibold">{member.cpf}</p>
    )}
  </CardContent>
</Card>

<Card>
  <CardHeader className="flex justify-between items-center pb-2">
    <CardTitle className="text-sm font-medium">Telefone</CardTitle>
    <Phone className="w-4 h-4 text-muted-foreground" />
  </CardHeader>
  <CardContent className="text-center">
    {editMode ? (
      <div className="flex justify-center">
        <input
          type="text"
          value={editedPhone}
          onChange={(e) => setEditedPhone(e.target.value)}
          placeholder="Digite seu telefone"
          className="text-center w-full max-w-xs px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
        />
    </div>

    ) : (
      <p className="text-lg font-semibold">{member.phone}</p>
    )}
  </CardContent>
</Card>

</div>

{/* Stats Grid */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <Card className="bg-green-100">
    <CardHeader className="flex justify-between items-center pb-2">
      <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
      <DollarSign className="w-5 h-5 text-green-800" />
    </CardHeader>
    <CardContent className="text-center">
      <p className="text-xl font-bold text-green-900">
        R$ {member.total_sales.toFixed(2)}
      </p>
    </CardContent>
  </Card>

  <Card className="bg-blue-100">
    <CardHeader className="flex justify-between items-center pb-2">
      <CardTitle className="text-sm font-medium">Contatos Totais</CardTitle>
      <Users className="w-5 h-5 text-blue-800" />
    </CardHeader>
    <CardContent className="text-center">
      <p className="text-xl font-bold text-blue-900">{member.total_contacts}</p>
    </CardContent>
  </Card>

  <Card className="bg-purple-100">
    <CardHeader className="flex justify-between items-center pb-2">
      <CardTitle className="text-sm font-medium">Comissões Totais</CardTitle>
      <BarChart3 className="w-5 h-5 text-purple-800" />
    </CardHeader>
    <CardContent className="text-center">
      <p className="text-xl font-bold text-purple-900">
        R$ {member.total_commission.toFixed(2)}
      </p>
    </CardContent>
  </Card>
</div>
<div className="flex justify-end mt-4 gap-2">
  {editMode ? (
    <>
      <button
        onClick={async () => {
          try {
            const updated = await MemberService.updateMember(member.id, {
              cpf: editedCPF,
              phone: editedPhone,
            });
            toast.success("Dados atualizados com sucesso!");
            setCurrentMember(updated);
            setEditMode(false);
          } catch (error) {
            toast.error("Erro ao atualizar dados.");
            console.error(error);
          }
        }}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition"
      >
        💾 Salvar
      </button>
      <button
        onClick={() => {
          setEditedCPF(member.cpf);
          setEditedPhone(member.phone);
          setEditMode(false);
        }}
        className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition"
      >
        ❌ Cancelar
      </button>
    </>
  ) : (
    <button
      onClick={() => setEditMode(true)}
      className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition"
    >
       Editar Dados
    </button>
  )}
</div>


    </div>
  );
};

export default ProfilePage;
