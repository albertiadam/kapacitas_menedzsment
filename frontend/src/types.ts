export interface Project {
  id: number;
  name: string;
  description: string;
  start: Date;
  end: Date;
  revenue: number;
}

export interface ProjectFormType {
  name: string
  description: string
  start: string
  end: string
  revenue: number
}

export interface ReturnProp {
  onSuccess: () => void
  onFail: () => void
  onCancel: () => void
}