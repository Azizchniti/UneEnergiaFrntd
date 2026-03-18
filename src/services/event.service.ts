// src/services/event.service.ts

import axios from 'axios';
import { BASE_URL } from '@/config/api';

const API_URL = `${BASE_URL}/api/calendar`;

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  created_by?: string;
}

export const EventService = {
  // ✅ Get all events
  async getAllEvents(): Promise<Event[]> {
    const response = await axios.get(API_URL);
    return response.data;
  },

  async getEventsByRange(start: string, end: string): Promise<Event[]> {
  const response = await axios.get(`${API_URL}?start=${start}&end=${end}`);
  return response.data;
},
  // ✅ Create event
  async createEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
    const response = await axios.post(API_URL, eventData);
    return response.data[0]; // because of Supabase `.select()`
  },

  // ✅ Update event
  async updateEvent(id: string, updatedData: Partial<Event>): Promise<Event> {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data[0];
  },

  // ✅ Delete event
  async deleteEvent(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }
};