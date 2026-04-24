/** API Configuration */

// Update this to match your backend URL
export const API_BASE_URL = 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  // Projects
  projects: `${API_BASE_URL}/projects`,
  project: (id: number) => `${API_BASE_URL}/projects/${id}`,

  // Skills
  skills: `${API_BASE_URL}/skills`,
  skill: (id: number) => `${API_BASE_URL}/skills/${id}`,

  // Employees
  employees: `${API_BASE_URL}/employees`,
  employee: (id: number) => `${API_BASE_URL}/employees/${id}`,

  // Skill-Employee relationships
  skillEmployees: `${API_BASE_URL}/skills-employees`,
  skillEmployee: (skillId: number, employeeId: number) =>
    `${API_BASE_URL}/skills-employees/${skillId}/${employeeId}`,

  // Project-Skill-Employee relationships
  projectSkillEmployees: `${API_BASE_URL}/project-skills-employees`,
  projectSkillEmployee: (id: number) =>
    `${API_BASE_URL}/project-skills-employees/${id}`,

  // Available employees by skill
  availableEmployeesBySkill: `${API_BASE_URL}/get-available-employee-by-skill`,

  // Team suggestion
  suggestTeam: `${API_BASE_URL}/suggest-team`,

  // Employee Capacities
  employeeCapacities: `${API_BASE_URL}/employee-capacities`,
  employeeCapacity: (employeeId: number) =>
    `${API_BASE_URL}/employee-capacity/${employeeId}`,
};

/** Fetch helper with error handling */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API Error ${response.status}: ${errorData.detail || response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
}
