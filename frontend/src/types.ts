
// GET MODELS

export interface Project {
  id: number;
  name: string;
  short_name: string;
  description: string;
  start: Date;
  end: Date;
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

export interface ProjectForm {
  name: string
  short_name: string
  description: string
  start: string
  end: string
  fix_cost: number
  employee_cost: number
  revenue: number
}

export interface SkillForm {
  name: string;
  category: string;
}

export interface EmployeeForm {
  name: string;
  base_capacity: number;
  hourly_rate: number;
}

export interface SkillEmployeeForm {
  skill_id: number;
  employee_id: number;
  proficiency: number;
}

export interface ProjectSkillEmployeeForm {
  project_id: number;
  skill_id: number;
  employee_id: number;
  needed_proficiency: number;
  capacity_on_project: number;
  skill_start: string;
  skill_end: string;
}