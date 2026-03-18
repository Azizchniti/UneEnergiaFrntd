export type ContentType = 'course' | 'class' | 'certification' | 'path';

export interface EducationalContent {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course  {
   id: string;
  title: string;
  description: string;
  classes: string[];
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  image_url?: string;
}

export interface Class {
  id: string;
  title: string;
  video_url?: string;
  duration: number;
  materials: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: string;
  title: string;
  description: string;
  required_courses: string[];
  max_attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPath  {
  id: string;
  title: string;
  description: string;
  steps: {
    contentId: string;
    contentType: 'course' | 'certification';
    order: number;
  }[];
}
export type MaterialType = "file" | "link";

export interface LearningMaterial {
  id: string;
  learning_path_id: string; // links to a LearningPath
  title: string;
  description?: string;
  url: string; // Google Drive link or any file URL
  type: MaterialType;
  created_at: string;
  updated_at: string;
}