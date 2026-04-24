/**
 * In-memory store backing the mock API.
 *
 * This isolates the seed data + mutations behind an async boundary so the rest
 * of the app talks to "the API" via src/api/*.ts. When you're ready to swap to
 * the real REST backend at http://127.0.0.1:8000, replace the function bodies
 * in projects.ts / skills.ts / employees.ts with fetch() calls — no consumer
 * code (hooks, context, components) needs to change.
 */
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
