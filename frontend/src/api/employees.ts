/** Employees API - Connected to backend */
import * as types from '@/types';
import { API_ENDPOINTS, apiFetch } from './config';

export async function listEmployees(): Promise<types.Employee[]> {
  return apiFetch<types.Employee[]>(API_ENDPOINTS.employees);
}

export async function createEmployee(
  input: types.EmployeePost,
): Promise<types.Employee> {
  return apiFetch<types.Employee>(API_ENDPOINTS.employees, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateEmployee(
  employeeId: number,
  input: types.EmployeeUpdate,
): Promise<types.Employee> {
  return apiFetch<types.Employee>(API_ENDPOINTS.employee(employeeId), {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteEmployee(employeeId: number): Promise<void> {
  await apiFetch<{ message: string }>(API_ENDPOINTS.employee(employeeId), {
    method: 'DELETE',
  });
}

// Skill-Employee operations
export async function addEmployeeSkill(
  employeeId: number,
  skillId: number,
  proficiency: number,
): Promise<types.SkillEmployee> {
  return apiFetch<types.SkillEmployee>(API_ENDPOINTS.skillEmployees, {
    method: 'POST',
    body: JSON.stringify({
      skill_id: skillId,
      employee_id: employeeId,
      proficiency,
    }),
  });
}

export async function removeEmployeeSkill(
  skillId: number,
  employeeId: number,
): Promise<void> {
  await apiFetch<{ message: string }>(
    API_ENDPOINTS.skillEmployee(skillId, employeeId),
    {
      method: 'DELETE',
    },
  );
}

export async function updateEmployeeSkill(
  skillId: number,
  employeeId: number,
  proficiency: number,
): Promise<types.SkillEmployee> {
  return apiFetch<types.SkillEmployee>(
    API_ENDPOINTS.skillEmployee(skillId, employeeId),
    {
      method: 'PUT',
      body: JSON.stringify({ proficiency }),
    },
  );
}

export async function listEmployeeSkills(): Promise<types.SkillEmployee[]> {
  return apiFetch<types.SkillEmployee[]>(API_ENDPOINTS.skillEmployees);
}

// Available employees by skill + date range
export async function getAvailableEmployeesBySkill(params: {
  skill_id: number;
  start: string;
  end: string;
  proficiency?: number;
  needed_capacity?: number;
}): Promise<types.EmployeeAvailability[]> {
  const p = new URLSearchParams({
    skill_id: String(params.skill_id),
    start: params.start,
    end: params.end,
  });
  if (params.proficiency !== undefined) p.set('proficiency', String(params.proficiency));
  if (params.needed_capacity !== undefined) p.set('needed_capacity', String(params.needed_capacity));
  return apiFetch<types.EmployeeAvailability[]>(
    `${API_ENDPOINTS.availableEmployeesBySkill}?${p}`,
  );
}

// Employee Capacity
export async function getEmployeeCapacities(
  startDate: string,
  endDate: string,
): Promise<types.EmployeeCapacity[]> {
  const params = new URLSearchParams({ start: startDate, end: endDate });
  return apiFetch<types.EmployeeCapacity[]>(
    `${API_ENDPOINTS.employeeCapacities}?${params}`,
  );
}
