export interface Skill {
  id: string;
  name: string;
  category: string;
  /** Deprecated — kept optional for back-compat with seed data */
  description?: string;
}

export interface EmployeeSkill {
  skillId: string;
  skillName: string;
  level: number; // 1-3
}

export interface Employee {
  id: string;
  name: string;
  /** Legacy — hidden from card view, kept for back-compat */
  jobTitle?: string;
  salary?: number;
  experience?: number; // years
  /** New fields */
  baseCapacity?: number; // default 1.0 (full-time)
  hourlyRate?: number;
  location?: string;
  skills: EmployeeSkill[];
  plannedCapacity: number;
  allocatedCapacity: number;
  totalCapacity: number;
}

export interface ProjectSkill {
  id: string;
  skillId: string;
  skillName: string;
  level: number; // 1-3
  duration: number; // man-days (legacy total capacity for this skill row)
  capacityOnProject?: number; // 0-1 (fractional allocation)
  startDate: string;
  endDate: string;
  assignedEmployeeId: string | null;
  assignedEmployeeName: string | null;
  fixed: boolean;
}

export type ProjectStatus =
  | 'Planned'
  | 'Ongoing'
  | 'Completed'
  | 'Cancelled'
  | 'On Hold'
  // legacy values kept for backwards compatibility with seed data
  | 'Canceled'
  | 'Finished';

export interface Project {
  id: string;
  shortName: string;
  name: string;
  description: string;
  status: ProjectStatus;
  client: string;
  pmIds: string[];
  pmNames: string[];
  startDate: string;
  endDate: string;
  progress: number;
  overallCapacity: number;
  remainingCapacity: number;
  /** New simplified financials */
  fixedCost?: number;
  revenue?: number;
  /** Legacy financial fields kept for back-compat with existing seed data */
  estimatedCost: number;
  spentCost: number;
  estimatedRevenue: number;
  netProfitMargin: number;
  profitMarginExclEmployee: number;
  skills: ProjectSkill[];
}

// ── Skills (25+) ──────────────────────────────────────────────────────────────

export const SKILLS: Skill[] = [
  // Frontend
  { id: 's1', name: 'React', category: 'Frontend', description: 'React.js library for building UIs' },
  { id: 's2', name: 'TypeScript', category: 'Frontend', description: 'Typed superset of JavaScript' },
  { id: 's3', name: 'Angular', category: 'Frontend', description: 'Google\'s web framework' },
  { id: 's4', name: 'Vue.js', category: 'Frontend', description: 'Progressive JavaScript framework' },
  { id: 's5', name: 'Next.js', category: 'Frontend', description: 'React framework for production' },
  // Backend
  { id: 's6', name: 'Python', category: 'Backend', description: 'General-purpose programming language' },
  { id: 's7', name: 'Node.js', category: 'Backend', description: 'Server-side JavaScript runtime' },
  { id: 's8', name: 'Java', category: 'Backend', description: 'Enterprise-grade OOP language' },
  { id: 's9', name: 'Go', category: 'Backend', description: 'Compiled language by Google' },
  { id: 's10', name: 'GraphQL', category: 'Backend', description: 'API query language' },
  { id: 's11', name: '.NET / C#', category: 'Backend', description: 'Microsoft application framework' },
  // Database
  { id: 's12', name: 'PostgreSQL', category: 'Database', description: 'Advanced open-source RDBMS' },
  { id: 's13', name: 'MongoDB', category: 'Database', description: 'NoSQL document database' },
  { id: 's14', name: 'Redis', category: 'Database', description: 'In-memory data store' },
  { id: 's15', name: 'MySQL', category: 'Database', description: 'Popular relational database' },
  { id: 's16', name: 'Elasticsearch', category: 'Database', description: 'Distributed search & analytics engine' },
  // DevOps
  { id: 's17', name: 'Docker', category: 'DevOps', description: 'Container platform' },
  { id: 's18', name: 'Kubernetes', category: 'DevOps', description: 'Container orchestration system' },
  { id: 's19', name: 'AWS', category: 'DevOps', description: 'Amazon Web Services cloud platform' },
  { id: 's20', name: 'Azure', category: 'DevOps', description: 'Microsoft cloud platform' },
  { id: 's21', name: 'Terraform', category: 'DevOps', description: 'Infrastructure as Code tool' },
  { id: 's22', name: 'CI/CD', category: 'DevOps', description: 'Continuous integration & deployment pipelines' },
  // Design
  { id: 's23', name: 'Figma', category: 'Design', description: 'Collaborative UI/UX design tool' },
  { id: 's24', name: 'Adobe XD', category: 'Design', description: 'Vector-based design & prototyping' },
  { id: 's25', name: 'Sketch', category: 'Design', description: 'Digital design toolkit for macOS' },
  { id: 's26', name: 'UX Research', category: 'Design', description: 'User research methodologies' },
  { id: 's27', name: 'Design Systems', category: 'Design', description: 'Building & maintaining design systems' },
  // Project Management
  { id: 's28', name: 'PM', category: 'Management', description: 'Project Management leadership' },
];

// ── Employees (25+) ───────────────────────────────────────────────────────────

export const EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Alice Johnson', jobTitle: 'Senior Frontend Developer', salary: 85000, experience: 6, location: 'Budapest',
    skills: [{ skillId: 's1', skillName: 'React', level: 3 }, { skillId: 's2', skillName: 'TypeScript', level: 3 }, { skillId: 's5', skillName: 'Next.js', level: 2 }],
    plannedCapacity: 10, allocatedCapacity: 15, totalCapacity: 40 },
  { id: 'e2', name: 'Bob Smith', jobTitle: 'Backend Engineer', salary: 90000, experience: 8, location: 'Berlin',
    skills: [{ skillId: 's6', skillName: 'Python', level: 3 }, { skillId: 's12', skillName: 'PostgreSQL', level: 3 }, { skillId: 's10', skillName: 'GraphQL', level: 2 }],
    plannedCapacity: 5, allocatedCapacity: 20, totalCapacity: 40 },
  { id: 'e3', name: 'Carol Davis', jobTitle: 'DevOps Lead', salary: 95000, experience: 10, location: 'Vienna',
    skills: [{ skillId: 's7', skillName: 'Node.js', level: 3 }, { skillId: 's17', skillName: 'Docker', level: 3 }, { skillId: 's19', skillName: 'AWS', level: 3 }, { skillId: 's18', skillName: 'Kubernetes', level: 2 }],
    plannedCapacity: 8, allocatedCapacity: 12, totalCapacity: 40 },
  { id: 'e4', name: 'Dan Wilson', jobTitle: 'Full Stack Developer', salary: 80000, experience: 5, location: 'Prague',
    skills: [{ skillId: 's1', skillName: 'React', level: 2 }, { skillId: 's2', skillName: 'TypeScript', level: 3 }, { skillId: 's7', skillName: 'Node.js', level: 3 }],
    plannedCapacity: 12, allocatedCapacity: 8, totalCapacity: 40 },
  { id: 'e5', name: 'Eve Martinez', jobTitle: 'Cloud Architect', salary: 110000, experience: 12, location: 'Warsaw',
    skills: [{ skillId: 's6', skillName: 'Python', level: 3 }, { skillId: 's19', skillName: 'AWS', level: 3 }, { skillId: 's17', skillName: 'Docker', level: 3 }, { skillId: 's18', skillName: 'Kubernetes', level: 3 }],
    plannedCapacity: 3, allocatedCapacity: 25, totalCapacity: 40 },
  { id: 'e6', name: 'Frank Lee', jobTitle: 'UI/UX Designer', salary: 70000, experience: 4, location: 'London',
    skills: [{ skillId: 's23', skillName: 'Figma', level: 3 }, { skillId: 's26', skillName: 'UX Research', level: 2 }, { skillId: 's27', skillName: 'Design Systems', level: 2 }],
    plannedCapacity: 0, allocatedCapacity: 10, totalCapacity: 40 },
  { id: 'e7', name: 'Grace Kim', jobTitle: 'Frontend Developer', salary: 72000, experience: 3, location: 'Paris',
    skills: [{ skillId: 's1', skillName: 'React', level: 2 }, { skillId: 's4', skillName: 'Vue.js', level: 3 }, { skillId: 's2', skillName: 'TypeScript', level: 2 }],
    plannedCapacity: 5, allocatedCapacity: 10, totalCapacity: 40 },
  { id: 'e8', name: 'Henry Patel', jobTitle: 'Senior Backend Engineer', salary: 98000, experience: 9, location: 'Amsterdam',
    skills: [{ skillId: 's8', skillName: 'Java', level: 3 }, { skillId: 's12', skillName: 'PostgreSQL', level: 3 }, { skillId: 's14', skillName: 'Redis', level: 2 }],
    plannedCapacity: 10, allocatedCapacity: 18, totalCapacity: 40 },
  { id: 'e9', name: 'Irene Zhang', jobTitle: 'Data Engineer', salary: 92000, experience: 7, location: 'Madrid',
    skills: [{ skillId: 's6', skillName: 'Python', level: 3 }, { skillId: 's12', skillName: 'PostgreSQL', level: 2 }, { skillId: 's16', skillName: 'Elasticsearch', level: 3 }],
    plannedCapacity: 8, allocatedCapacity: 14, totalCapacity: 40 },
  { id: 'e10', name: 'James Brown', jobTitle: 'DevOps Engineer', salary: 88000, experience: 6, location: 'Dublin',
    skills: [{ skillId: 's17', skillName: 'Docker', level: 3 }, { skillId: 's21', skillName: 'Terraform', level: 3 }, { skillId: 's22', skillName: 'CI/CD', level: 3 }],
    plannedCapacity: 6, allocatedCapacity: 16, totalCapacity: 40 },
  { id: 'e11', name: 'Karen Taylor', jobTitle: 'Angular Developer', salary: 78000, experience: 5, location: 'Stockholm',
    skills: [{ skillId: 's3', skillName: 'Angular', level: 3 }, { skillId: 's2', skillName: 'TypeScript', level: 3 }, { skillId: 's11', skillName: '.NET / C#', level: 2 }],
    plannedCapacity: 4, allocatedCapacity: 12, totalCapacity: 40 },
  { id: 'e12', name: 'Liam O\'Connor', jobTitle: 'Platform Engineer', salary: 96000, experience: 8, location: 'Helsinki',
    skills: [{ skillId: 's18', skillName: 'Kubernetes', level: 3 }, { skillId: 's19', skillName: 'AWS', level: 2 }, { skillId: 's20', skillName: 'Azure', level: 3 }],
    plannedCapacity: 7, allocatedCapacity: 20, totalCapacity: 40 },
  { id: 'e13', name: 'Maria Gonzalez', jobTitle: 'Product Designer', salary: 75000, experience: 5, location: 'Munich',
    skills: [{ skillId: 's23', skillName: 'Figma', level: 3 }, { skillId: 's24', skillName: 'Adobe XD', level: 2 }, { skillId: 's27', skillName: 'Design Systems', level: 3 }],
    plannedCapacity: 3, allocatedCapacity: 8, totalCapacity: 40 },
  { id: 'e14', name: 'Nathan Park', jobTitle: 'Go Developer', salary: 94000, experience: 6, location: 'Zurich',
    skills: [{ skillId: 's9', skillName: 'Go', level: 3 }, { skillId: 's17', skillName: 'Docker', level: 2 }, { skillId: 's14', skillName: 'Redis', level: 3 }],
    plannedCapacity: 2, allocatedCapacity: 22, totalCapacity: 40 },
  { id: 'e15', name: 'Olivia White', jobTitle: 'Frontend Lead', salary: 100000, experience: 9, location: 'Brussels',
    skills: [{ skillId: 's1', skillName: 'React', level: 3 }, { skillId: 's5', skillName: 'Next.js', level: 3 }, { skillId: 's2', skillName: 'TypeScript', level: 3 }, { skillId: 's27', skillName: 'Design Systems', level: 2 }],
    plannedCapacity: 10, allocatedCapacity: 15, totalCapacity: 40 },
  { id: 'e16', name: 'Paul Rivera', jobTitle: 'Java Architect', salary: 115000, experience: 14, location: 'Lisbon',
    skills: [{ skillId: 's8', skillName: 'Java', level: 3 }, { skillId: 's11', skillName: '.NET / C#', level: 3 }, { skillId: 's12', skillName: 'PostgreSQL', level: 2 }],
    plannedCapacity: 5, allocatedCapacity: 25, totalCapacity: 40 },
  { id: 'e17', name: 'Quinn Adams', jobTitle: 'QA Engineer', salary: 68000, experience: 4, location: 'Rome',
    skills: [{ skillId: 's6', skillName: 'Python', level: 2 }, { skillId: 's22', skillName: 'CI/CD', level: 2 }, { skillId: 's17', skillName: 'Docker', level: 1 }],
    plannedCapacity: 0, allocatedCapacity: 5, totalCapacity: 40 },
  { id: 'e18', name: 'Rachel Nguyen', jobTitle: 'Database Administrator', salary: 87000, experience: 7, location: 'Copenhagen',
    skills: [{ skillId: 's12', skillName: 'PostgreSQL', level: 3 }, { skillId: 's15', skillName: 'MySQL', level: 3 }, { skillId: 's13', skillName: 'MongoDB', level: 2 }],
    plannedCapacity: 4, allocatedCapacity: 18, totalCapacity: 40 },
  { id: 'e19', name: 'Samuel Clark', jobTitle: 'Solutions Architect', salary: 120000, experience: 15, location: 'Oslo',
    skills: [{ skillId: 's19', skillName: 'AWS', level: 3 }, { skillId: 's20', skillName: 'Azure', level: 3 }, { skillId: 's21', skillName: 'Terraform', level: 3 }, { skillId: 's9', skillName: 'Go', level: 2 }],
    plannedCapacity: 8, allocatedCapacity: 20, totalCapacity: 40 },
  { id: 'e20', name: 'Tina Müller', jobTitle: 'UX Designer', salary: 73000, experience: 4, location: 'Tallinn',
    skills: [{ skillId: 's23', skillName: 'Figma', level: 2 }, { skillId: 's25', skillName: 'Sketch', level: 3 }, { skillId: 's26', skillName: 'UX Research', level: 3 }],
    plannedCapacity: 0, allocatedCapacity: 12, totalCapacity: 40 },
  { id: 'e21', name: 'Umar Hassan', jobTitle: 'Full Stack Developer', salary: 82000, experience: 5, location: 'Riga',
    skills: [{ skillId: 's1', skillName: 'React', level: 2 }, { skillId: 's7', skillName: 'Node.js', level: 2 }, { skillId: 's13', skillName: 'MongoDB', level: 3 }],
    plannedCapacity: 6, allocatedCapacity: 10, totalCapacity: 40 },
  { id: 'e22', name: 'Vera Sokolova', jobTitle: 'Python Developer', salary: 84000, experience: 6, location: 'Vilnius',
    skills: [{ skillId: 's6', skillName: 'Python', level: 3 }, { skillId: 's10', skillName: 'GraphQL', level: 3 }, { skillId: 's16', skillName: 'Elasticsearch', level: 2 }],
    plannedCapacity: 3, allocatedCapacity: 14, totalCapacity: 40 },
  { id: 'e23', name: 'William Chen', jobTitle: 'Site Reliability Engineer', salary: 105000, experience: 10, location: 'Sofia',
    skills: [{ skillId: 's18', skillName: 'Kubernetes', level: 3 }, { skillId: 's22', skillName: 'CI/CD', level: 3 }, { skillId: 's19', skillName: 'AWS', level: 2 }, { skillId: 's17', skillName: 'Docker', level: 3 }],
    plannedCapacity: 10, allocatedCapacity: 22, totalCapacity: 40 },
  { id: 'e24', name: 'Xena Dubois', jobTitle: 'Frontend Developer', salary: 71000, experience: 3, location: 'Bucharest',
    skills: [{ skillId: 's4', skillName: 'Vue.js', level: 2 }, { skillId: 's3', skillName: 'Angular', level: 2 }, { skillId: 's2', skillName: 'TypeScript', level: 2 }],
    plannedCapacity: 0, allocatedCapacity: 6, totalCapacity: 40 },
  { id: 'e25', name: 'Yuki Tanaka', jobTitle: 'Backend Team Lead', salary: 102000, experience: 11, location: 'Athens',
    skills: [{ skillId: 's8', skillName: 'Java', level: 3 }, { skillId: 's9', skillName: 'Go', level: 3 }, { skillId: 's12', skillName: 'PostgreSQL', level: 3 }, { skillId: 's14', skillName: 'Redis', level: 2 }],
    plannedCapacity: 8, allocatedCapacity: 20, totalCapacity: 40 },
  { id: 'e26', name: 'Zara Ivanova', jobTitle: '.NET Developer', salary: 79000, experience: 5, location: 'Zagreb',
    skills: [{ skillId: 's11', skillName: '.NET / C#', level: 3 }, { skillId: 's15', skillName: 'MySQL', level: 2 }, { skillId: 's20', skillName: 'Azure', level: 2 }],
    plannedCapacity: 2, allocatedCapacity: 8, totalCapacity: 40 },
];

// ── Projects (12) ─────────────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
  {
    id: 'p1', shortName: 'CRM', name: 'Customer Relationship Management', description: 'Full CRM system with sales pipeline, customer tracking, and reporting.',
    status: 'Ongoing', client: 'Acme Corp', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2026-01-15', endDate: '2026-06-30', progress: 45, overallCapacity: 120,
    remainingCapacity: 66, estimatedCost: 500000, spentCost: 225000, estimatedRevenue: 800000, netProfitMargin: 37.5, profitMarginExclEmployee: 42.0,
    skills: [
      { id: 'ps1', skillId: 's1', skillName: 'React', level: 3, duration: 30, startDate: '2026-01-15', endDate: '2026-04-15', assignedEmployeeId: 'e1', assignedEmployeeName: 'Alice Johnson', fixed: false },
      { id: 'ps2', skillId: 's6', skillName: 'Python', level: 3, duration: 25, startDate: '2026-02-01', endDate: '2026-05-01', assignedEmployeeId: 'e2', assignedEmployeeName: 'Bob Smith', fixed: false },
      { id: 'ps3', skillId: 's12', skillName: 'PostgreSQL', level: 2, duration: 15, startDate: '2026-03-01', endDate: '2026-05-30', assignedEmployeeId: 'e18', assignedEmployeeName: 'Rachel Nguyen', fixed: true },
    ],
  },
  {
    id: 'p2', shortName: 'ERP', name: 'Enterprise Resource Planning', description: 'ERP module for inventory, procurement, and finance.',
    status: 'Planned', client: 'GlobalTech', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2026-04-01', endDate: '2026-12-31', progress: 0, overallCapacity: 200,
    remainingCapacity: 200, estimatedCost: 1000000, spentCost: 0, estimatedRevenue: 1500000, netProfitMargin: 33.3, profitMarginExclEmployee: 40.0,
    skills: [
      { id: 'ps4', skillId: 's2', skillName: 'TypeScript', level: 3, duration: 40, startDate: '2026-04-01', endDate: '2026-08-01', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
      { id: 'ps5', skillId: 's7', skillName: 'Node.js', level: 3, duration: 35, startDate: '2026-05-01', endDate: '2026-10-01', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
      { id: 'ps6', skillId: 's19', skillName: 'AWS', level: 3, duration: 20, startDate: '2026-06-01', endDate: '2026-11-01', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
    ],
  },
  {
    id: 'p3', shortName: 'MOB', name: 'Mobile App Redesign', description: 'Complete redesign of the mobile application with new UX.',
    status: 'Ongoing', client: 'StartupXYZ', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2026-02-01', endDate: '2026-05-15', progress: 60, overallCapacity: 80,
    remainingCapacity: 32, estimatedCost: 300000, spentCost: 180000, estimatedRevenue: 450000, netProfitMargin: 33.3, profitMarginExclEmployee: 38.0,
    skills: [
      { id: 'ps7', skillId: 's23', skillName: 'Figma', level: 3, duration: 20, startDate: '2026-02-01', endDate: '2026-03-15', assignedEmployeeId: 'e6', assignedEmployeeName: 'Frank Lee', fixed: false },
      { id: 'ps8', skillId: 's1', skillName: 'React', level: 2, duration: 25, startDate: '2026-03-01', endDate: '2026-05-15', assignedEmployeeId: 'e4', assignedEmployeeName: 'Dan Wilson', fixed: false },
    ],
  },
  {
    id: 'p4', shortName: 'API', name: 'API Gateway Platform', description: 'Centralized API gateway with rate limiting, auth, and monitoring.',
    status: 'Finished', client: 'MegaCorp', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2025-09-01', endDate: '2026-01-31', progress: 100, overallCapacity: 90,
    remainingCapacity: 0, estimatedCost: 400000, spentCost: 380000, estimatedRevenue: 600000, netProfitMargin: 33.3, profitMarginExclEmployee: 36.7,
    skills: [
      { id: 'ps9', skillId: 's7', skillName: 'Node.js', level: 3, duration: 30, startDate: '2025-09-01', endDate: '2025-12-15', assignedEmployeeId: 'e3', assignedEmployeeName: 'Carol Davis', fixed: true },
      { id: 'ps10', skillId: 's17', skillName: 'Docker', level: 3, duration: 15, startDate: '2025-11-01', endDate: '2026-01-31', assignedEmployeeId: 'e3', assignedEmployeeName: 'Carol Davis', fixed: true },
    ],
  },
  {
    id: 'p5', shortName: 'DAS', name: 'Data Analytics Suite', description: 'Real-time analytics dashboard with ML-powered insights.',
    status: 'Canceled', client: 'DataDriven Inc', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2025-11-01', endDate: '2026-04-30', progress: 20, overallCapacity: 150,
    remainingCapacity: 120, estimatedCost: 700000, spentCost: 140000, estimatedRevenue: 1200000, netProfitMargin: 41.7, profitMarginExclEmployee: 48.0,
    skills: [
      { id: 'ps11', skillId: 's6', skillName: 'Python', level: 3, duration: 40, startDate: '2025-11-01', endDate: '2026-03-01', assignedEmployeeId: 'e5', assignedEmployeeName: 'Eve Martinez', fixed: false },
      { id: 'ps12', skillId: 's10', skillName: 'GraphQL', level: 2, duration: 20, startDate: '2026-01-01', endDate: '2026-04-30', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
    ],
  },
  {
    id: 'p6', shortName: 'MKT', name: 'Marketing Automation Platform', description: 'Campaign management, email automation, and lead scoring system.',
    status: 'Ongoing', client: 'BrandWave', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2026-02-10', endDate: '2026-07-15', progress: 35, overallCapacity: 100,
    remainingCapacity: 65, estimatedCost: 420000, spentCost: 147000, estimatedRevenue: 650000, netProfitMargin: 35.4, profitMarginExclEmployee: 41.0,
    skills: [
      { id: 'ps13', skillId: 's1', skillName: 'React', level: 2, duration: 20, startDate: '2026-02-10', endDate: '2026-04-20', assignedEmployeeId: 'e7', assignedEmployeeName: 'Grace Kim', fixed: false },
      { id: 'ps14', skillId: 's6', skillName: 'Python', level: 3, duration: 30, startDate: '2026-03-01', endDate: '2026-06-15', assignedEmployeeId: 'e22', assignedEmployeeName: 'Vera Sokolova', fixed: false },
      { id: 'ps15', skillId: 's14', skillName: 'Redis', level: 2, duration: 10, startDate: '2026-04-01', endDate: '2026-05-30', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
    ],
  },
  {
    id: 'p7', shortName: 'SEC', name: 'Security Compliance Portal', description: 'SOC 2 and ISO 27001 compliance tracking with automated audit trails.',
    status: 'Planned', client: 'FinSecure', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2026-05-01', endDate: '2026-10-31', progress: 0, overallCapacity: 130,
    remainingCapacity: 130, estimatedCost: 560000, spentCost: 0, estimatedRevenue: 900000, netProfitMargin: 37.8, profitMarginExclEmployee: 44.0,
    skills: [
      { id: 'ps16', skillId: 's8', skillName: 'Java', level: 3, duration: 35, startDate: '2026-05-01', endDate: '2026-08-15', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
      { id: 'ps17', skillId: 's12', skillName: 'PostgreSQL', level: 3, duration: 20, startDate: '2026-06-01', endDate: '2026-09-01', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
      { id: 'ps18', skillId: 's21', skillName: 'Terraform', level: 2, duration: 15, startDate: '2026-07-01', endDate: '2026-10-31', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
    ],
  },
  {
    id: 'p8', shortName: 'IOT', name: 'IoT Fleet Manager', description: 'Real-time monitoring and control dashboard for industrial IoT devices.',
    status: 'Ongoing', client: 'SmartFactory GmbH', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2026-01-05', endDate: '2026-05-20', progress: 55, overallCapacity: 95,
    remainingCapacity: 43, estimatedCost: 380000, spentCost: 209000, estimatedRevenue: 550000, netProfitMargin: 30.9, profitMarginExclEmployee: 36.0,
    skills: [
      { id: 'ps19', skillId: 's9', skillName: 'Go', level: 3, duration: 25, startDate: '2026-01-05', endDate: '2026-03-30', assignedEmployeeId: 'e14', assignedEmployeeName: 'Nathan Park', fixed: true },
      { id: 'ps20', skillId: 's18', skillName: 'Kubernetes', level: 2, duration: 15, startDate: '2026-02-15', endDate: '2026-04-30', assignedEmployeeId: 'e12', assignedEmployeeName: 'Liam O\'Connor', fixed: false },
      { id: 'ps21', skillId: 's1', skillName: 'React', level: 2, duration: 20, startDate: '2026-03-01', endDate: '2026-05-20', assignedEmployeeId: 'e15', assignedEmployeeName: 'Olivia White', fixed: false },
    ],
  },
  {
    id: 'p9', shortName: 'HCM', name: 'HR & Talent Management', description: 'Employee onboarding, performance reviews, and talent pipeline.',
    status: 'Planned', client: 'PeopleFirst', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2026-06-01', endDate: '2026-11-30', progress: 0, overallCapacity: 160,
    remainingCapacity: 160, estimatedCost: 680000, spentCost: 0, estimatedRevenue: 1050000, netProfitMargin: 35.2, profitMarginExclEmployee: 42.0,
    skills: [
      { id: 'ps22', skillId: 's5', skillName: 'Next.js', level: 3, duration: 30, startDate: '2026-06-01', endDate: '2026-09-01', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
      { id: 'ps23', skillId: 's11', skillName: '.NET / C#', level: 3, duration: 35, startDate: '2026-06-15', endDate: '2026-10-30', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
      { id: 'ps24', skillId: 's15', skillName: 'MySQL', level: 2, duration: 20, startDate: '2026-07-01', endDate: '2026-11-30', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
    ],
  },
  {
    id: 'p10', shortName: 'E2E', name: 'E-Commerce Replatform', description: 'Migrating legacy e-commerce to modern headless architecture.',
    status: 'Ongoing', client: 'ShopNow Ltd', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2026-03-01', endDate: '2026-08-31', progress: 15, overallCapacity: 180,
    remainingCapacity: 153, estimatedCost: 750000, spentCost: 112500, estimatedRevenue: 1100000, netProfitMargin: 31.8, profitMarginExclEmployee: 38.0,
    skills: [
      { id: 'ps25', skillId: 's5', skillName: 'Next.js', level: 3, duration: 35, startDate: '2026-03-01', endDate: '2026-06-30', assignedEmployeeId: 'e15', assignedEmployeeName: 'Olivia White', fixed: false },
      { id: 'ps26', skillId: 's9', skillName: 'Go', level: 2, duration: 30, startDate: '2026-03-15', endDate: '2026-07-15', assignedEmployeeId: 'e25', assignedEmployeeName: 'Yuki Tanaka', fixed: false },
      { id: 'ps27', skillId: 's16', skillName: 'Elasticsearch', level: 3, duration: 20, startDate: '2026-04-01', endDate: '2026-07-31', assignedEmployeeId: 'e9', assignedEmployeeName: 'Irene Zhang', fixed: true },
      { id: 'ps28', skillId: 's23', skillName: 'Figma', level: 2, duration: 15, startDate: '2026-03-01', endDate: '2026-04-30', assignedEmployeeId: 'e13', assignedEmployeeName: 'Maria Gonzalez', fixed: false },
    ],
  },
  {
    id: 'p11', shortName: 'FIN', name: 'Financial Reporting Engine', description: 'Automated financial statement generation with regulatory compliance.',
    status: 'Finished', client: 'TrustBank', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2025-07-01', endDate: '2025-12-31', progress: 100, overallCapacity: 110,
    remainingCapacity: 0, estimatedCost: 480000, spentCost: 460000, estimatedRevenue: 720000, netProfitMargin: 33.3, profitMarginExclEmployee: 36.1,
    skills: [
      { id: 'ps29', skillId: 's8', skillName: 'Java', level: 3, duration: 35, startDate: '2025-07-01', endDate: '2025-10-31', assignedEmployeeId: 'e16', assignedEmployeeName: 'Paul Rivera', fixed: true },
      { id: 'ps30', skillId: 's12', skillName: 'PostgreSQL', level: 3, duration: 25, startDate: '2025-08-01', endDate: '2025-12-31', assignedEmployeeId: 'e18', assignedEmployeeName: 'Rachel Nguyen', fixed: true },
    ],
  },
  {
    id: 'p12', shortName: 'DLP', name: 'DevOps Learning Platform', description: 'Internal training platform for CI/CD, containers, and cloud skills.',
    status: 'Planned', client: 'Internal', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2026-07-01', endDate: '2026-09-30', progress: 0, overallCapacity: 60,
    remainingCapacity: 60, estimatedCost: 180000, spentCost: 0, estimatedRevenue: 0, netProfitMargin: 0, profitMarginExclEmployee: 0,
    skills: [
      { id: 'ps31', skillId: 's22', skillName: 'CI/CD', level: 2, duration: 15, startDate: '2026-07-01', endDate: '2026-08-15', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
      { id: 'ps32', skillId: 's17', skillName: 'Docker', level: 2, duration: 10, startDate: '2026-07-15', endDate: '2026-09-01', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
      { id: 'ps33', skillId: 's1', skillName: 'React', level: 2, duration: 15, startDate: '2026-07-01', endDate: '2026-09-30', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
    ],
  },
];
