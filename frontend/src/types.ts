export interface Project {
  id: number;
  name: string;
  description: string;
  start: Date;
  end: Date;
  revenue: number;
}

export interface ProjectForm {
  name: string
  description: string
  start: string
  end: string
  revenue: number
}