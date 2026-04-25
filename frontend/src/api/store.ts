import {
  Project,
  Skill,
  Employee,
  PROJECTS,
  SKILLS,
  EMPLOYEES,
} from '@/data/mockData';

// Deep-clone the seed so mutations don't mutate the module-level constants.
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export const store = {
  projects: clone(PROJECTS) as Project[],
  skills: clone(SKILLS) as Skill[],
  employees: clone(EMPLOYEES) as Employee[],
};

/** Simulate network latency. Tweak to 0 for instant, 100–300ms to feel real. */
const NETWORK_DELAY_MS = 80;

export const delay = <T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(value), ms));
