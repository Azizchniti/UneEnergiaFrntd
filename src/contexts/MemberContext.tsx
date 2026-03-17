
import React, { createContext, useContext, useState } from "react";
import { Member } from "@/types";
import { toast } from "sonner";
import { MOCK_MEMBERS } from "@/data/mockData";
import { findMemberPath } from "@/utils/dataUtils";
import { MemberService } from "@/services/members.service";

// Member context type definition
type MemberContextType = {
  members: Member[];
  updateMember: (id: string, data: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  getMemberSquad: (memberId: string) => Promise<Member[]>; // <-- updated
  getSquadMetrics: (memberId: string) => Promise<import("@/types").Squad>; 
  getTopMembers: () => Promise<Member[]>;
  findMemberPath: (memberId: string) => Member[];
  getMemberLine: (memberId: string) => number; 
};

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const MemberProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  
  // Instantiate the service
  const memberService = MemberService;

  // Member management functions

  const updateMember = async (id: string, data: Partial<Member>) => {
    try {
      const updated = await MemberService.updateMember(id, data);
      setMembers((prev) => prev.map(m => (m.id === id ? updated : m)));
      toast.success("Member updated");
    } catch (error) {
      toast.error("Failed to update member");
    }
  };

  // Delete member
  const deleteMember = async (id: string) => {
    try {
      await MemberService.deleteMember(id);
      setMembers((prev) => prev.filter(m => m.id !== id));
      toast.success("Member deleted");
    } catch (error) {
      toast.error("Failed to delete member");
    }
  };

  // Squad and metrics functions
  const getMemberSquad = (memberId: string) => {
    return memberService.getMemberSquad(memberId);
  };

  const getSquadMetrics = (memberId: string) => {
    return memberService.getSquadMetrics(memberId);
  };

  const getTopMembers = () => {
    return memberService.getTopMembers();
  };

  const isLine1Member = (memberId: string) => {
  const member = members.find(m => m.id === memberId);
  return member ? member.upline_id === null : false;
};

const isLine2Member = (memberId: string) => {
  const member = members.find(m => m.id === memberId);
  if (!member) return false;
  if (member.upline_id) {
    const upline = members.find(m => m.id === member.upline_id);
    return upline ? upline.upline_id === null : false;
  }
  return false;
};

const getMemberLine = (memberId: string): number => {
  if (isLine1Member(memberId)) return 1;
  if (isLine2Member(memberId)) return 2;
  return 0;
};
  return (
    <MemberContext.Provider
      value={{
        members,
        updateMember,
        deleteMember,
        getMemberSquad,
        getSquadMetrics,
        getTopMembers,
        findMemberPath: (memberId: string) => findMemberPath(members, memberId),
         getMemberLine, 
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};

export const useMemberContext = (): MemberContextType => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error("useMemberContext deve ser usado dentro de um MemberProvider");
  }
  return context;
};
