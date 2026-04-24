/** Projects API - Connected to backend */
import * as types from '@/types';
import { API_ENDPOINTS, apiFetch } from './config';

export async function listProjects(): Promise<types.Project[]> {
  return apiFetch<types.Project[]>(API_ENDPOINTS.projects);
}

export async function createProject(
  input: types.ProjectPost,
): Promise<types.Project> {
  return apiFetch<types.Project>(API_ENDPOINTS.projects, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateProject(
  projectId: number,
  updates: types.ProjectUpdate,
): Promise<types.Project> {
  return apiFetch<types.Project>(API_ENDPOINTS.project(projectId), {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteProject(projectId: number): Promise<void> {
  await apiFetch<{ message: string }>(API_ENDPOINTS.project(projectId), {
    method: 'DELETE',
  });
}

// Project-Skill-Employee operations
export async function listProjectSkillEmployees(): Promise<types.ProjectSkillEmployee[]> {
  return apiFetch<types.ProjectSkillEmployee[]>(API_ENDPOINTS.projectSkillEmployees);
}

export async function createProjectSkillEmployee(
  input: types.ProjectSkillEmployeePost,
): Promise<types.ProjectSkillEmployee> {
  return apiFetch<types.ProjectSkillEmployee>(
    API_ENDPOINTS.projectSkillEmployees,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function updateProjectSkillEmployee(
  id: number,
  updates: types.ProjectSkillEmployeeUpdate,
): Promise<types.ProjectSkillEmployee> {
  return apiFetch<types.ProjectSkillEmployee>(
    API_ENDPOINTS.projectSkillEmployee(id),
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
  );
}

export async function deleteProjectSkillEmployee(id: number): Promise<void> {
  await apiFetch<{ message: string }>(
    API_ENDPOINTS.projectSkillEmployee(id),
    {
      method: 'DELETE',
    },
  );
}

export async function suggestTeam(
  req: types.SuggestTeamRequest,
): Promise<types.SuggestTeamResponse> {
  return apiFetch<types.SuggestTeamResponse>(API_ENDPOINTS.suggestTeam, {
    method: 'POST',
    body: JSON.stringify(req),
  });
}
