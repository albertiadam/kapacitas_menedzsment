import { useState } from 'react';
import ResourcesPage from '@/pages/ResourcesPage';
import SkillsManagementPage from '@/pages/SkillsManagementPage';

export default function SkillsPage() {
  const [view, setView] = useState<'employees' | 'skills'>('employees');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground mb-1">Resources</h1>
          <p className="text-sm text-muted-foreground">Manage team resources and company skills</p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
          <button
            onClick={() => setView('employees')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === 'employees'
                ? 'bg-card text-foreground shadow-[0_1px_3px_0_hsl(var(--foreground)/0.1),0_2px_6px_0_hsl(var(--foreground)/0.06)]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => setView('skills')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === 'skills'
                ? 'bg-card text-foreground shadow-[0_1px_3px_0_hsl(var(--foreground)/0.1),0_2px_6px_0_hsl(var(--foreground)/0.06)]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Skills
          </button>
        </div>
      </div>

      {view === 'employees' ? <ResourcesPage /> : <SkillsManagementPage />}
    </div>
  );
}
