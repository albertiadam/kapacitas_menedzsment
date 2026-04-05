// GET MODELS

export type ProjectStatus = 'planned' | 'ongoing' | 'completed' | 'cancelled' | 'on_hold';

export interface Project {
  id: number;
  name: string;
  short_name: string;
  description: string;
  start: Date;
  end: Date;
  status: ProjectStatus;
  fix_cost: number;
  employee_cost: number;
  revenue: number;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
}

export interface Employee {
  id: number;
  name: string;
  base_capacity: number;
  hourly_rate: number;
}

export interface SkillEmployee {
  skill_id: number;
  employee_id: number;
  skill_name: string;
  employee_name: string;
  proficiency: number;
}

export interface ProjectSkillEmployee {
  project_id: number;
  skill_id: number;
  employee_id: number;
  project_name: string;
  skill_name: string;
  employee_name: string;
  needed_proficiency: number;
  capacity_on_project: number;
  skill_start: Date;
  skill_end: Date;
}

// POST/CREATE MODELS

export interface ProjectPost {
  name: string
  short_name: string
  description: string
  start: string
  end: string
  status: ProjectStatus
  fix_cost: number
  employee_cost: number
  revenue: number
}

export interface SkillPost {
  name: string;
  category: string;
}

export interface EmployeePost {
  name: string;
  base_capacity: number;
  hourly_rate: number;
}

export interface SkillEmployeePost {
  skill_id: number;
  employee_id: number;
  proficiency: number;
}

export interface ProjectSkillEmployeePost {
  project_id: number;
  skill_id: number;
  employee_id: number;
  needed_proficiency: number;
  capacity_on_project: number;
  skill_start: string;
  skill_end: string;
}

// UPDATE MODELS

export interface ProjectUpdate {
  name?: string;
  short_name?: string;
  description?: string;
  start?: string;
  end?: string;
  status?: ProjectStatus;
  fix_cost?: number;
  revenue?: number;
}

export interface SkillUpdate {
  name?: string;
  category?: string;
}

export interface EmployeeUpdate {
  name?: string;
  base_capacity?: number;
  hourly_rate?: number;
}

export interface SkillEmployeeUpdate {
  proficiency?: number;
}

export interface ProjectSkillEmployeeUpdate {
  needed_proficiency?: number;
  capacity_on_project?: number;
  skill_start?: string;
  skill_end?: string;
}

// GENERAL

export interface ReturnProp {
  onSuccess: () => void
  onFail: () => void
  onCancel: () => void
}