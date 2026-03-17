// utils/memberUtils.ts
import { Member } from "@/types";

export function getMemberLine(memberId: string, allMembers: Member[]): number {
  const member = allMembers.find(m => m.id === memberId);
  if (!member) return 0;

  if (member.upline_id === null) return 1;

  const upline = allMembers.find(m => m.id === member.upline_id);
  if (upline && upline.upline_id === null) return 2;

  return 0;
}
