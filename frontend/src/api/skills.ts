/** Skills API - Connected to backend */
import * as types from '@/types';
import { API_ENDPOINTS, apiFetch } from './config';

export async function listSkills(): Promise<types.Skill[]> {
  return apiFetch<types.Skill[]>(API_ENDPOINTS.skills);
}

export async function createSkill(input: types.SkillPost): Promise<types.Skill> {
  return apiFetch<types.Skill>(API_ENDPOINTS.skills, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteSkill(skillId: number): Promise<void> {
  await apiFetch<{ message: string }>(API_ENDPOINTS.skill(skillId), {
    method: 'DELETE',
  });
}

export async function updateSkill(
  skillId: number,
  input: types.SkillUpdate,
): Promise<types.Skill> {
  return apiFetch<types.Skill>(API_ENDPOINTS.skill(skillId), {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

/** Get how many active projects use a skill */
export async function getSkillUsageCount(skillId: number): Promise<number> {
  const projects = await apiFetch<types.Project[]>(API_ENDPOINTS.projects);
  const activeProjects = projects.filter(
    p => p.status !== 'completed' && p.status !== 'cancelled',
  );
  const pse = await apiFetch<types.ProjectSkillEmployee[]>(
    API_ENDPOINTS.projectSkillEmployees,
  );
  const count = pse.filter(
    ps => ps.skill_id === skillId && activeProjects.some(p => p.id === ps.project_id),
  ).length;
  return count > 0 ? activeProjects.filter(p =>
    pse.some(ps => ps.skill_id === skillId && ps.project_id === p.id),
  ).length : 0;
}
