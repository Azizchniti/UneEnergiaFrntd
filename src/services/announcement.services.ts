// src/services/announcement.service.ts

import axios from 'axios';
import { Announcement } from '../types/index';

// Backend base URL (adjust if needed)
const API_URL = 'https://clinicahumanbcknd.onrender.com/api/announcements';
//const API_URL = 'https://localhost:3000/api/announcements';

export const AnnouncementService = {
  // ✅ Get all announcements
  async getAllAnnouncements(): Promise<Announcement[]> {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  },

  // ✅ Get a single announcement by ID
  async getAnnouncementById(id: string): Promise<Announcement> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // ✅ Create a new announcement
  async createAnnouncement(announcementData: Partial<Announcement>): Promise<Announcement> {
    try {
      const response = await axios.post(`${API_URL}`, announcementData);
      return response.data;
    } catch (err: any) {
      console.error('Failed to create announcement:', err.response?.data || err);
      throw err;
    }
  },

  // ✅ Update an announcement by ID
  async updateAnnouncement(id: string, announcementData: Partial<Announcement>): Promise<Announcement> {
    const response = await axios.put(`${API_URL}/${id}`, announcementData);
    return response.data;
  },

  // ✅ Delete an announcement by ID
  async deleteAnnouncement(id: string): Promise<{ message?: string }> {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};
