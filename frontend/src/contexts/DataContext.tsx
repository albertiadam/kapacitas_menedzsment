import React, { createContext, useContext, ReactNode } from 'react';
import {
  Project,
  PROJECTS,
  SKILLS,
  EMPLOYEES,
  Skill,
  Employee,
  EmployeeSkill,
  ProjectStatus,
  ProjectSkill,
} from '@/data/mockData';
import {
  useProjects,
  useSkills,
  useEmployees,
  useCreateProject,
  useUpdateProjectStatus,
  useUpdateProject,
  useAddProjectSkill,
  useRemoveProjectSkill,
  useUpdateProjectSkill,
  useReorderProjectSkills,
  useAutoAssignSkill,
  useAutoAssignAllEmptySkills,
  useCreateSkill,
  useDeleteSkill,
  useUpdateSkill,
  useCreateEmployee,
  useAddEmployeeSkill,
  useRemoveEmployeeSkill,
} from '@/hooks/queries';

/**
 * DataContext keeps the same public API as before so consumers (ProjectCard,
 * NewProjectPage, ResourcesPage, SkillsManagementPage…) don't need to change.
 *
 * Under the hood it now reads from TanStack Query (useProjects/useSkills/
 * useEmployees) and writes via mutation hooks. The actual data-access lives in
 * src/api/*.ts — swap those for fetch() calls when wiring up the real backend.
 *
 * Note: mutations like addProject / addEmployee return a synthesized ID
 * synchronously to preserve the existing 2-step "create then assign" flow used
 * by NewProjectPage. The mutation runs in the background and React Query
 * invalidates the relevant cache on success.
 */
interface DataContextType {
  projects: Project[];
  skills: Skill[];
  employees: Employee[];
  addProject: (project: Omit<Project, 'id' | 'progress' | 'remainingCapacity' | 'skills'>) => string;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  updateProject: (projectId: string, updates: Partial<Pick<Project, 'description' | 'startDate' | 'endDate' | 'spentCost' | 'netProfitMargin' | 'profitMarginExclEmployee' | 'fixedCost' | 'revenue' | 'status'>>) => void;
  addProjectSkill: (projectId: string, skill: Omit<ProjectSkill, 'id'>) => void;
  removeProjectSkill: (projectId: string, skillRowId: string) => void;
  updateProjectSkill: (projectId: string, skillRowId: string, updates: Partial<ProjectSkill>) => void;
  reorderProjectSkills: (projectId: string, orderedSkillRowIds: string[]) => void;
  autoAssignSkill: (projectId: string, skillRowId: string, preference: 'cost' | 'capacity') => void;
  autoAssignAllEmptySkills: (projectId: string, preference: 'cost' | 'capacity') => void;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  deleteSkill: (skillId: string) => void;
  updateSkill: (skill: Skill) => void;
  getSkillUsageCount: (skillId: string) => number;
  addEmployee: (employee: Omit<Employee, 'id' | 'skills' | 'plannedCapacity' | 'allocatedCapacity' | 'totalCapacity'>) => string;
  addEmployeeSkill: (employeeId: string, skill: EmployeeSkill) => void;
  removeEmployeeSkill: (employeeId: string, skillId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  // Reads — TanStack Query handles caching, loading, and refetch on invalidate.
  // Fall back to seed data while the first fetch is in flight so the UI never
  // shows an empty state on initial render.
  const projectsQuery = useProjects();
  const skillsQuery = useSkills();
  const employeesQuery = useEmployees();

  const projects = projectsQuery.data ?? PROJECTS;
  const skills = skillsQuery.data ?? SKILLS;
  const employees = employeesQuery.data ?? EMPLOYEES;

  // Writes — each mutation invalidates its query so the UI auto-refreshes.
  const createProject = useCreateProject();
  const updateProjectStatusM = useUpdateProjectStatus();
  const updateProjectM = useUpdateProject();
  const addProjectSkillM = useAddProjectSkill();
  const removeProjectSkillM = useRemoveProjectSkill();
  const updateProjectSkillM = useUpdateProjectSkill();
  const reorderProjectSkillsM = useReorderProjectSkills();
  const autoAssignSkillM = useAutoAssignSkill();
  const autoAssignAllEmptySkillsM = useAutoAssignAllEmptySkills();
  const createSkill = useCreateSkill();
  const deleteSkillM = useDeleteSkill();
  const updateSkillM = useUpdateSkill();
  const createEmployee = useCreateEmployee();
  const addEmployeeSkillM = useAddEmployeeSkill();
  const removeEmployeeSkillM = useRemoveEmployeeSkill();

  const addProject = (project: Omit<Project, 'id' | 'progress' | 'remainingCapacity' | 'skills'>) => {
    // Pre-generate the ID so the caller (NewProjectPage step 1 → step 2) can
    // immediately seed the mandatory PM skill assignment without waiting for
    // the mutation to resolve. The API accepts an optional `id` and will use
    // it instead of generating its own, keeping client and server in sync.
    const id = `p${Date.now()}`;
    createProject.mutate({ ...project, id });
    return id;
  };

  const addEmployee = (employee: Omit<Employee, 'id' | 'skills' | 'plannedCapacity' | 'allocatedCapacity' | 'totalCapacity'>) => {
    const id = `e${Date.now()}`;
    createEmployee.mutate({ ...employee, id });
    return id;
  };

  const getSkillUsageCount = (skillId: string) =>
    projects.filter(
      p =>
        p.status !== 'Canceled' &&
        p.status !== 'Finished' &&
        p.skills.some(s => s.skillId === skillId),
    ).length;

  const value: DataContextType = {
    projects,
    skills,
    employees,
    addProject,
    updateProjectStatus: (projectId, status) =>
      updateProjectStatusM.mutate({ projectId, status }),
    updateProject: (projectId, updates) =>
      updateProjectM.mutate({ projectId, updates }),
    addProjectSkill: (projectId, skill) =>
      addProjectSkillM.mutate({ projectId, skill }),
    removeProjectSkill: (projectId, skillRowId) =>
      removeProjectSkillM.mutate({ projectId, skillRowId }),
    updateProjectSkill: (projectId, skillRowId, updates) =>
      updateProjectSkillM.mutate({ projectId, skillRowId, updates }),
    reorderProjectSkills: (projectId, orderedSkillRowIds) =>
      reorderProjectSkillsM.mutate({ projectId, orderedSkillRowIds }),
    autoAssignSkill: (projectId, skillRowId, preference) =>
      autoAssignSkillM.mutate({ projectId, skillRowId, preference }),
    autoAssignAllEmptySkills: (projectId, preference) =>
      autoAssignAllEmptySkillsM.mutate({ projectId, preference }),
    addSkill: skill => createSkill.mutate(skill),
    deleteSkill: skillId => deleteSkillM.mutate(skillId),
    updateSkill: skill => updateSkillM.mutate(skill),
    getSkillUsageCount,
    addEmployee,
    addEmployeeSkill: (employeeId, skill) =>
      addEmployeeSkillM.mutate({ employeeId, skill }),
    removeEmployeeSkill: (employeeId, skillId) =>
      removeEmployeeSkillM.mutate({ employeeId, skillId }),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
