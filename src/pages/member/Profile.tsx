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
import { BASE_URL } from "@/config/api";
import axios from "axios";

const gradeColors: Record<string, string> = {
  "Influenciadores / Celebridades": "bg-gray-200 text-gray-800",
  "Relações públicas": "bg-blue-200 text-blue-800",
  "Empresas": "bg-yellow-300 text-yellow-900",
  "Funcionários e médicos": "bg-slate-300 text-slate-800",
  "Amigos e Familiares": "bg-purple-300 text-purple-900",
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

const handleUploadProfilePicture = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("image", file); // ⚠️ MUST match backend

    const res = await axios.post(
      `${BASE_URL}/api/upload/profile-picture/${member.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // update UI instantly
    setCurrentMember({
      ...member,
      profile_picture: res.data.url,
    });

    toast.success("Foto atualizada com sucesso");
  } catch (err) {
    console.error(err);
    toast.error("Erro ao enviar imagem");
  }
};
  if (!member) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Carregando informações do membro...
      </div>
    );
  }
return (
  <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

    {/* HERO PROFILE */}
    <div className="relative p-8 rounded-3xl 
    bg-gradient-to-br from-[#0b1f1a]/80 to-[#071412]/80 
    backdrop-blur-xl border border-white/10 shadow-xl text-center">

      {/* subtle glow */}
      <div className="absolute inset-0 rounded-3xl 
      bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />

      {/* PROFILE IMAGE */}
      <div className="relative w-32 h-32 mx-auto">

        {member.profile_picture ? (
          <img
            src={member.profile_picture}
            className="w-32 h-32 rounded-full object-cover 
            border-4 border-emerald-500/20 shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full flex items-center justify-center 
          bg-emerald-500/20 text-emerald-400 text-4xl font-semibold">
            {member.first_name?.[0]}
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <label
          htmlFor="file-upload"
          className="absolute bottom-0 right-0 w-10 h-10 rounded-full 
          bg-emerald-500 hover:bg-emerald-600 
          flex items-center justify-center 
          text-black font-bold cursor-pointer shadow-md transition"
        >
          +
        </label>

        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // 🔥 instant preview
            const previewUrl = URL.createObjectURL(file);

            setCurrentMember({
              ...member,
              profile_picture: previewUrl,
            });

            handleUploadProfilePicture(file);
          }}
        />
      </div>

      {/* NAME */}
      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-white">
          {member.first_name} {member.last_name}
        </h1>

        <p className="text-sm text-white/50 mt-1">
          {member.grade || "Membro"}
        </p>
      </div>

      {/* EDIT BUTTON */}
      <div className="mt-6">
        <button
          onClick={() => setEditMode(!editMode)}
          className="text-sm px-5 py-2 rounded-lg 
          bg-white/5 hover:bg-white/10 border border-white/10 
          text-white/70 hover:text-white transition"
        >
          {editMode ? "Cancelar edição" : "Editar perfil"}
        </button>
      </div>
    </div>

    {/* INFO CARD */}
    <div className="p-6 rounded-2xl 
    bg-[#0b1f1a]/60 backdrop-blur-xl 
    border border-white/10 space-y-6">

      <h2 className="text-white text-sm font-semibold">
        Informações pessoais
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* CPF */}
        <div>
          <p className="text-xs text-white/40 mb-1">CPF</p>

          {editMode ? (
            <input
              type="text"
              value={editedCPF}
              onChange={(e) => setEditedCPF(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 
              focus:border-emerald-400 outline-none text-white py-1"
            />
          ) : (
            <p className="text-white font-medium">
              {member.cpf || "Não informado"}
            </p>
          )}
        </div>

        {/* PHONE */}
        <div>
          <p className="text-xs text-white/40 mb-1">Telefone</p>

          {editMode ? (
            <input
              type="text"
              value={editedPhone}
              onChange={(e) => setEditedPhone(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 
              focus:border-emerald-400 outline-none text-white py-1"
            />
          ) : (
            <p className="text-white font-medium">
              {member.phone || "Não informado"}
            </p>
          )}
        </div>

      </div>

      {/* SAVE BUTTON */}
      {editMode && (
        <div className="flex justify-end pt-4">
          <button
            onClick={async () => {
              const updated = await MemberService.updateMember(member.id, {
                cpf: editedCPF,
                phone: editedPhone,
              });

              setCurrentMember(updated);
              setEditMode(false);

              toast.success("Atualizado com sucesso");
            }}
            className="px-6 py-2 rounded-lg 
            bg-emerald-500 hover:bg-emerald-600 
            text-black font-medium transition shadow-md"
          >
            Salvar alterações
          </button>
        </div>
      )}
    </div>

  </div>
);
 }
export default ProfilePage;
