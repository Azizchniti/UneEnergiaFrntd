import axios from 'axios';
import { Member } from '../types/member.types'; // Assuming this defines your Member interface
import { Squad } from '@/types';

// Backend API base URL (adjust if needed)
const API_URL = 'https://clinicahumanbcknd.onrender.com/api/members';
const UPLOAD_URL = 'https://clinicahumanbcknd.onrender.com/api/upload';

type TopSquad = {
  leader: Member;
  associates: Member[];
  totalCommission: number;
};
export const MemberService = {
  // ✅ Get all members (basic info)
  async getAllMembers(): Promise<Member[]> {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  },

  // ✅ Get single member by ID (detailed view)
  async getMemberById(id: string): Promise<Member> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // ✅ Update member by ID
  async updateMember(id: string, updatedData: Partial<Omit<Member, 'id'>>): Promise<Member> {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  },

  // ✅ Delete member by ID
  async deleteMember(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
  // ✅ Get the squad (upline + 12 downlines) for a member
  async getMemberSquad(id: string): Promise<Member[]> {
    const response = await axios.get(`${API_URL}/${id}/squad`);
    return response.data;
  },

  // ✅ Get squad metrics (aggregate data about the member's squad)
  async getSquadMetrics(id: string): Promise<Squad> {
    const response = await axios.get(`${API_URL}/${id}/squad-metrics`);
    console.log('Fetched squad metrics:', response);
    return response.data;
  },

  // ✅ Get top members (e.g. top by sales or commissions)
  async getTopMembers(): Promise<Member[]> {
    const response = await axios.get(`${API_URL}/top`);
    return response.data;
  },
  async getTopSquads(): Promise<TopSquad[]> {
    const response = await axios.get(`${API_URL}/top-squads`);
    return response.data;
  },
  getMemberLine(id: string): number {
  // Example logic to determine member line
  if (id.startsWith("1")) return 1;
  return 2;
},

  async uploadProfilePicture(userId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${UPLOAD_URL}/profile-picture/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
    async getMembersByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<Member[]> {
    const response = await axios.get(`${API_URL}/status/${status}`);
    return response.data;
  },

  // Approve a member by id
  async approveMember(id: string): Promise<Member> {
    const response = await axios.put(`${API_URL}/${id}/approve`);
    return response.data;
  },

  // Reject a member by id
  async rejectMember(id: string): Promise<Member> {
    const response = await axios.put(`${API_URL}/${id}/reject`);
    return response.data;
  },
// ✅ Mark tutorial as seen
async markTutorialSeen(id: string): Promise<Member> {
  const response = await axios.put(`${API_URL}/${id}/tutorial-seen`);
  return response.data;
}


};
