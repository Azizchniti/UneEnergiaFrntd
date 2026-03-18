// src/services/lead.service.ts

import { BASE_URL } from '@/config/api';
import { profile } from '@/types';
import axios from 'axios';
// Base URL to match Express route: /api/users
//const API_URL = 'https://pfp-backend-0670.onrender.com/api/users';
const API_URL = `${BASE_URL}/api/users`;

export const UserService = {
  // ✅ Get all users
  async getAllUsers(): Promise<profile[]> {
    const response = await axios.get(`${API_URL}/listallusers`);
    return response.data;
  },

  // ✅ Update user by ID
  async updateUser(id: string, updatedData: Partial<profile>): Promise<profile> {
    const response = await axios.put(`${API_URL}/updateuser/${id}`, updatedData);
    return response.data[0]; // Supabase returns an array in `.select()`
  },

  // ✅ Delete user by ID
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_URL}/deleteuser/${id}`);
    return response.data;
  }
};
