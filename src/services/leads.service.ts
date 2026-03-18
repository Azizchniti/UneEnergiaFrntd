// src/services/lead.service.ts

import axios from 'axios';
import { Lead } from '../types/index';
import { BASE_URL } from '@/config/api';

// Backend base URL (adjust if needed)
const API_URL = `${BASE_URL}/api/leads`;
//const API_URL = 'http://localhost:3000/api/leads';


export const LeadService = {
  // ✅ Get all leads
  async getAllLeads(): Promise<Lead[]> {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  },

  // ✅ Get single lead by ID
  async getLeadById(id: string): Promise<Lead> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // ✅ Create new lead
  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    try {
    const response = await axios.post(`${API_URL}`, leadData);
    return response.data;
    } catch (err) {
  console.error("Failed to create lead:", err.response?.data || err);
  throw err;
}
  },

  // ✅ Update lead by ID
  async updateLead(id: string, leadData: Partial<Lead>): Promise<Lead> {
    const response = await axios.put(`${API_URL}/${id}`, leadData);
    return response.data;
  },

  // ✅ Delete lead by ID
  async deleteLead(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};
