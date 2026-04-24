// GET MODELS (from backend)

export type ProjectStatus = 'planned' | 'ongoing' | 'completed' | 'cancelled' | 'on_hold';

export interface Project {
  id: number;
  name: string;
  short_name: string;
  description: string;
  start: Date | string;
  end: Date | string;
  status: ProjectStatus;
  fix_cost: number;
  employee_cost: number;
  employee_actual_cost: number;
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
  location?: string;
}

export interface SkillEmployee {
  skill_id: number;
  employee_id: number;
  skill_name: string;
  employee_name: string;
  proficiency: number;
}

export interface ProjectSkillEmployee {
  id: number;
  project_id: number;
  skill_id: number;
  employee_id: number;
  project_name: string;
  skill_name: string;
  employee_name: string;
  needed_proficiency: number;
  capacity_on_project: number;
  capacity_worked_on_project?: number;
  skill_start: Date | string;
  skill_end: Date | string;
}

export interface EmployeeCapacity {
  id: number;
  name: string;
  base_capacity: number;
  hourly_rate: number;
  allocated_capacity: number;
  planned_capacity: number;
  available_capacity: number;
}

// POST/CREATE MODELS

export interface ProjectPost {
  name: string;
  short_name: string;
  description: string;
  start: string;
  end: string;
  status: ProjectStatus;
  fix_cost: number;
  revenue: number;
}

export interface SkillPost {
  name: string;
  category: string;
}

export interface EmployeePost {
  name: string;
  base_capacity: number;
  hourly_rate: number;
  location?: string;
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
  location?: string;
}

export interface SkillEmployeeUpdate {
  proficiency?: number;
}

export interface ProjectSkillEmployeeUpdate {
  project_id?: number;
  skill_id?: number;
  employee_id?: number;
  needed_proficiency?: number;
  capacity_on_project?: number;
  skill_start?: string;
  skill_end?: string;
  capacity_worked_on_project?: number;
}

// AVAILABLE EMPLOYEES

export interface EmployeeAvailability {
  id: number;
  name: string;
  base_capacity: number;
  hourly_rate: number;
  location?: string;
  proficiency: number;
  available_capacity: number;
  allocated_capacity: number;
  planned_capacity: number;
  availability: 'fully' | 'partially' | 'not';
}

// SUGGEST-TEAM

export interface SuggestTeamSkill {
  skill_id: number;
  start: string;
  end: string;
  needed_proficiency: number;
  needed_capacity: number;
}

export interface SuggestTeamRequest {
  preference: 'cost' | 'capacity';
  skills: SuggestTeamSkill[];
}

export interface SuggestTeamResultItem {
  skill_id: number;
  skill_name: string | null;
  employee_id: number;
  employee_name: string;
  proficiency: number;
  needed_proficiency: number;
  needed_capacity: number;
  available_capacity: number;
  hourly_rate: number;
  estimated_cost: number;
  start: string;
  end: string;
}

export interface SuggestTeamResponse {
  preference: string;
  team: SuggestTeamResultItem[];
}

// GENERAL

export interface ReturnProp {
  onSuccess: () => void;
  onFail: () => void;
  onCancel: () => void;
}
