// src/services/announcement.service.ts

import axios from 'axios';
import { Announcement } from '../types';
import { BASE_URL } from '@/config/api';

// Only endpoint path here
const ENDPOINT = '/api/announcements';

export const AnnouncementService = {
  // ✅ Get all announcements
  async getAllAnnouncements(): Promise<Announcement[]> {
    const response = await axios.get(`${BASE_URL}${ENDPOINT}`);
    return response.data;
  },

  // ✅ Get a single announcement by ID
  async getAnnouncementById(id: string): Promise<Announcement> {
    const response = await axios.get(`${BASE_URL}${ENDPOINT}/${id}`);
    return response.data;
  },

  // ✅ Create a new announcement
  async createAnnouncement(
    announcementData: Partial<Announcement>
  ): Promise<Announcement> {
    try {
      const response = await axios.post(
        `${BASE_URL}${ENDPOINT}`,
        announcementData
      );
      return response.data;
    } catch (err: any) {
      console.error(
        'Failed to create announcement:',
        err.response?.data || err
      );
      throw err;
    }
  },

  // ✅ Update an announcement by ID
  async updateAnnouncement(
    id: string,
    announcementData: Partial<Announcement>
  ): Promise<Announcement> {
    const response = await axios.put(
      `${BASE_URL}${ENDPOINT}/${id}`,
      announcementData
    );
    return response.data;
  },

  // ✅ Delete an announcement by ID
  async deleteAnnouncement(id: string): Promise<{ message?: string }> {
    const response = await axios.delete(
      `${BASE_URL}${ENDPOINT}/${id}`
    );
    return response.data;
  },
};