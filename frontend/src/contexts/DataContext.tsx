import React, { createContext, useContext, ReactNode } from 'react';
import type {
  Project, Skill, Employee, SkillEmployee, ProjectSkillEmployee,
  ProjectPost, ProjectUpdate,
  SkillPost, SkillUpdate,
  EmployeePost,
  ProjectSkillEmployeePost, ProjectSkillEmployeeUpdate,
} from '@/types';
import {
  useProjects, useSkills, useEmployees, useEmployeeSkills, useProjectSkillEmployees,
  useCreateProject, useUpdateProject, useDeleteProject,
  useCreateProjectSkillEmployee, useUpdateProjectSkillEmployee, useDeleteProjectSkillEmployee,
  useCreateSkill, useUpdateSkill, useDeleteSkill,
  useCreateEmployee, useDeleteEmployee, useAddEmployeeSkill, useRemoveEmployeeSkill,
} from '@/hooks/queries';

interface DataContextType {
  // Data
  projects: Project[];
  skills: Skill[];
  employees: Employee[];
  projectSkillEmployees: ProjectSkillEmployee[];
  employeeSkills: SkillEmployee[];

  // Project mutations
  createProject: (data: ProjectPost) => Promise<Project>;
  updateProject: (id: number, updates: ProjectUpdate) => void;
  deleteProject: (id: number) => void;

  // Project-skill-employee mutations
  createProjectSkillEmployee: (data: ProjectSkillEmployeePost) => Promise<ProjectSkillEmployee>;
  updateProjectSkillEmployee: (id: number, updates: ProjectSkillEmployeeUpdate) => void;
  deleteProjectSkillEmployee: (id: number) => void;

  // Skill mutations
  createSkill: (data: SkillPost) => void;
  updateSkill: (id: number, updates: SkillUpdate) => void;
  deleteSkill: (id: number) => void;

  // Employee mutations
  createEmployee: (data: EmployeePost) => void;
  deleteEmployee: (id: number) => void;
  addEmployeeSkill: (employeeId: number, skillId: number, proficiency: number) => void;
  removeEmployeeSkill: (skillId: number, employeeId: number) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const projectsQ = useProjects();
  const skillsQ = useSkills();
  const employeesQ = useEmployees();
  const employeeSkillsQ = useEmployeeSkills();
  const pseQ = useProjectSkillEmployees();

  const createProjectM = useCreateProject();
  const updateProjectM = useUpdateProject();
  const deleteProjectM = useDeleteProject();
  const createPseM = useCreateProjectSkillEmployee();
  const updatePseM = useUpdateProjectSkillEmployee();
  const deletePseM = useDeleteProjectSkillEmployee();
  const createSkillM = useCreateSkill();
  const updateSkillM = useUpdateSkill();
  const deleteSkillM = useDeleteSkill();
  const createEmployeeM = useCreateEmployee();
  const deleteEmployeeM = useDeleteEmployee();
  const addEmployeeSkillM = useAddEmployeeSkill();
  const removeEmployeeSkillM = useRemoveEmployeeSkill();

  const value: DataContextType = {
    projects: projectsQ.data ?? [],
    skills: skillsQ.data ?? [],
    employees: employeesQ.data ?? [],
    projectSkillEmployees: pseQ.data ?? [],
    employeeSkills: employeeSkillsQ.data ?? [],

    createProject: (data) => createProjectM.mutateAsync(data),
    updateProject: (id, updates) => updateProjectM.mutate({ id, updates }),
    deleteProject: (id) => deleteProjectM.mutate(id),

    createProjectSkillEmployee: (data) => createPseM.mutateAsync(data),
    updateProjectSkillEmployee: (id, updates) => updatePseM.mutate({ id, updates }),
    deleteProjectSkillEmployee: (id) => deletePseM.mutate(id),

    createSkill: (data) => createSkillM.mutate(data),
    updateSkill: (id, updates) => updateSkillM.mutate({ id, input: updates }),
    deleteSkill: (id) => deleteSkillM.mutate(id),

    createEmployee: (data) => createEmployeeM.mutate(data),
    deleteEmployee: (id) => deleteEmployeeM.mutate(id),
    addEmployeeSkill: (employeeId, skillId, proficiency) =>
      addEmployeeSkillM.mutate({ employeeId, skillId, proficiency }),
    removeEmployeeSkill: (skillId, employeeId) =>
      removeEmployeeSkillM.mutate({ skillId, employeeId }),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
