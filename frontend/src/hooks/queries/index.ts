import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as projectsApi from '@/api/projects';
import * as skillsApi from '@/api/skills';
import * as employeesApi from '@/api/employees';
import type {
  ProjectPost, ProjectUpdate,
  SkillPost, SkillUpdate,
  EmployeePost, EmployeeUpdate,
  ProjectSkillEmployeePost, ProjectSkillEmployeeUpdate,
} from '@/types';

export const queryKeys = {
  projects: ['projects'] as const,
  skills: ['skills'] as const,
  employees: ['employees'] as const,
  projectSkillEmployees: ['projectSkillEmployees'] as const,
  employeeSkills: ['employeeSkills'] as const,
};

// ── Projects ─────────────────────────────────────────────────────────────────

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: projectsApi.listProjects });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectPost) => projectsApi.createProject(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: ProjectUpdate }) =>
      projectsApi.updateProject(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

// ── Project Skill Employees ───────────────────────────────────────────────────

export function useProjectSkillEmployees() {
  return useQuery({
    queryKey: queryKeys.projectSkillEmployees,
    queryFn: projectsApi.listProjectSkillEmployees,
  });
}

export function useCreateProjectSkillEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectSkillEmployeePost) =>
      projectsApi.createProjectSkillEmployee(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projectSkillEmployees });
      qc.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useUpdateProjectSkillEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: ProjectSkillEmployeeUpdate }) =>
      projectsApi.updateProjectSkillEmployee(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projectSkillEmployees });
      qc.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useDeleteProjectSkillEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProjectSkillEmployee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projectSkillEmployees });
      qc.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

// ── Skills ────────────────────────────────────────────────────────────────────

export function useSkills() {
  return useQuery({ queryKey: queryKeys.skills, queryFn: skillsApi.listSkills });
}

export function useCreateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SkillPost) => skillsApi.createSkill(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.skills }),
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SkillUpdate }) =>
      skillsApi.updateSkill(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.skills }),
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => skillsApi.deleteSkill(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.skills }),
  });
}

// ── Employees ─────────────────────────────────────────────────────────────────

export function useEmployees() {
  return useQuery({ queryKey: queryKeys.employees, queryFn: employeesApi.listEmployees });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeePost) => employeesApi.createEmployee(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: EmployeeUpdate }) =>
      employeesApi.updateEmployee(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.deleteEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees }),
  });
}

// ── Employee Skills ───────────────────────────────────────────────────────────

export function useEmployeeSkills() {
  return useQuery({
    queryKey: queryKeys.employeeSkills,
    queryFn: employeesApi.listEmployeeSkills,
  });
}

export function useAddEmployeeSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      skillId,
      proficiency,
    }: {
      employeeId: number;
      skillId: number;
      proficiency: number;
    }) => employeesApi.addEmployeeSkill(employeeId, skillId, proficiency),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employeeSkills }),
  });
}

export function useAvailableEmployeesBySkill(params: {
  skill_id: number | null;
  start: string;
  end: string;
  proficiency: number;
  needed_capacity: number;
}) {
  const enabled = !!(
    params.skill_id &&
    params.start &&
    params.end &&
    params.start < params.end
  );
  return useQuery({
    queryKey: ['availableEmployeesBySkill', params] as const,
    queryFn: () =>
      employeesApi.getAvailableEmployeesBySkill({
        skill_id: params.skill_id!,
        start: `${params.start}T00:00:00`,
        end: `${params.end}T00:00:00`,
        proficiency: params.proficiency,
        needed_capacity: params.needed_capacity,
      }),
    enabled,
    staleTime: 30_000,
  });
}

export function useRemoveEmployeeSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, employeeId }: { skillId: number; employeeId: number }) =>
      employeesApi.removeEmployeeSkill(skillId, employeeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employeeSkills }),
  });
}
