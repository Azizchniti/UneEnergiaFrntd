import { Certification, Class, Course, LearningPath } from '@/types/education.types';
import axios from 'axios';

const BASE_URL = 'https://clinicahumanbcknd.onrender.com/api/education';
//const BASE_URL = 'hhttp://localhost:3000/api/education';


export const EducationService = {
  // === COURSES ===
  async getCourses(): Promise<Course[]> {
    const res = await axios.get(`${BASE_URL}/courses`);
    console.log("res data",res.data);
    return res.data;
  },

  async createCourse(data: Partial<Course>): Promise<Course> {
    const res = await axios.post(`${BASE_URL}/courses`, data);
    console.log("res data",res.data);
    return res.data;
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    const res = await axios.put(`${BASE_URL}/courses/${id}`, data);
    return res.data;
  },

  async deleteCourse(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/courses/${id}`);
  },

  // === CLASSES ===
  async getClasses(): Promise<Class[]> {
    const res = await axios.get(`${BASE_URL}/classes`);
    return res.data;
  },

  async createClass(data: Partial<Class>): Promise<Class> {
    const res = await axios.post(`${BASE_URL}/classes`, data);
    return res.data;
  },

  async updateClass(id: string, data: Partial<Class>): Promise<Class> {
    const res = await axios.put(`${BASE_URL}/classes/${id}`, data);
    return res.data;
  },

  async deleteClass(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/classes/${id}`);
  },

  // === CERTIFICATIONS ===
  async getCertifications(): Promise<Certification[]> {
    const res = await axios.get(`${BASE_URL}/certifications`);
    return res.data;
  },

  async createCertification(data: Partial<Certification>): Promise<Certification> {
    const res = await axios.post(`${BASE_URL}/certifications`, data);
    return res.data;
  },

  async updateCertification(id: string, data: Partial<Certification>): Promise<Certification> {
    const res = await axios.put(`${BASE_URL}/certifications/${id}`, data);
    return res.data;
  },

  async deleteCertification(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/certifications/${id}`);
  },

  // === PATHS ===
  async getPaths(): Promise<LearningPath[]> {
    const res = await axios.get(`${BASE_URL}/paths`);
    return res.data;
  },

  async createPath(data: Partial<LearningPath>): Promise<LearningPath> {
    const res = await axios.post(`${BASE_URL}/paths`, data);
    return res.data;
  },

  async updatePath(id: string, data: Partial<LearningPath>): Promise<LearningPath> {
    const res = await axios.put(`${BASE_URL}/paths/${id}`, data);
    return res.data;
  },

  async deletePath(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/paths/${id}`);
  },
    // === COURSES ===
  async getCourseById(id: string): Promise<Course> {
    const res = await axios.get(`${BASE_URL}/courses/${id}`);
    return res.data;
  },

  // === CLASSES ===
  async getClassById(id: string): Promise<Class> {
    const res = await axios.get(`${BASE_URL}/classes/${id}`);
    return res.data;
  },
  async getClassesByIds(ids: string[]): Promise<Class[]> {
  const res = await axios.post(`${BASE_URL}/classes/by-ids`, { ids });
  return res.data;
}
,

  // === CERTIFICATIONS ===
  async getCertificationById(id: string): Promise<Certification> {
    const res = await axios.get(`${BASE_URL}/certifications/${id}`);
    return res.data;
  },

  // === PATHS ===
  async getPathById(id: string): Promise<LearningPath> {
    const res = await axios.get(`${BASE_URL}/paths/${id}`);
    return res.data;
  }

};