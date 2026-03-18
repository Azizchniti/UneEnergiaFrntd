// src/services/announcementView.service.ts

import axios from 'axios';

import { BASE_URL } from '../config/api'; // ✅ THIS WAS MISSING

const API_URL = `${BASE_URL}/api/announcementsviews`;
export const AnnouncementViewService = {
  // ✅ Mark an announcement as viewed
  async createView(announcementId: string, userId: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/mark-viewed`, {
        announcementId,
        userId,
      });
    } catch (err: any) {
      console.error('Failed to mark announcement as viewed:', err.response?.data || err);
      throw err;
    }
  },

  // ✅ Get the unseen announcements count for a user
  async getUnseenCount(userId: string): Promise<number> {
    try {
      const response = await axios.get(`${API_URL}/unseen-count/${userId}`);
      console.log('[Service] Response from unseen count endpoint:', response.data);
      return response.data.unseenCount;
    } catch (err: any) {
      console.error('Failed to get unseen announcements count:', err.response?.data || err);
      throw err;
    }
  }
};