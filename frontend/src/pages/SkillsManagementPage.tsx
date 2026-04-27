import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Skill } from '@/types';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'Design', 'Management', 'IT', 'Soft skill'];

export default function SkillsManagementPage() {
  const { skills, createSkill, deleteSkill, updateSkill } = useData();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteErrors, setDeleteErrors] = useState<Record<number, string>>({});

  const [newSkill, setNewSkill] = useState({ name: '', category: 'Frontend' });
  const [editForm, setEditForm] = useState<{ id: number; name: string; category: string }>({
    id: 0, name: '', category: '',
  });

  let filtered = skills;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
    );
  }
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(s => s.category === categoryFilter);
  }

  const categoryCount: Record<string, number> = {};
  skills.forEach(s => {
    categoryCount[s.category] = (categoryCount[s.category] ?? 0) + 1;
  });

  const handleAdd = () => {
    if (!newSkill.name.trim()) return;
    createSkill({ name: newSkill.name.trim(), category: newSkill.category });
    setNewSkill({ name: '', category: 'Frontend' });
    setShowAdd(false);
  };

  const startEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setEditForm({ id: skill.id, name: skill.name, category: skill.category });
  };

  const saveEdit = () => {
    updateSkill(editForm.id, { name: editForm.name, category: editForm.category });
    setEditingId(null);
  };

  return (
    <div>
      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {CATEGORIES.map(cat => (
          <div
            key={cat}
            className="bg-card border border-border rounded-lg p-3 text-center"
          >
            <p className="text-lg font-semibold text-foreground">{categoryCount[cat] ?? 0}</p>
            <p className="text-xs text-muted-foreground">{cat}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border h-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 h-9 bg-card text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="h-9">
          <Plus className="w-4 h-4 mr-1" /> Add Skill
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                value={newSkill.name}
                onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))}
                className="bg-background h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Category</Label>
              <select
                value={newSkill.category}
                onChange={e => setNewSkill(p => ({ ...p, category: e.target.value }))}
                className="w-full h-8 px-2 rounded-md border border-border bg-background text-sm text-foreground"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleAdd}>Add</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* List header */}
      <div className="flex items-center gap-3 px-4 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider border-b border-border mb-1">
        <span className="flex-1">Name</span>
        <span className="w-32 text-center">Category</span>
        <span className="w-16" />
      </div>

      {/* Skill rows */}
      <div className="space-y-1">
        {filtered.map(skill => (
          <div key={skill.id}>
          <div
            className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-md hover:border-primary/30 transition-colors"
          >
            {editingId === skill.id ? (
              <>
                <Input
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="bg-background h-7 text-sm flex-1"
                />
                <select
                  value={editForm.category}
                  onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                  className="h-7 px-2 rounded border border-border bg-background text-xs text-foreground w-32"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary"
                  onClick={saveEdit}
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => setEditingId(null)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-foreground flex-1">{skill.name}</span>
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded w-32 text-center">
                  {skill.category}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => startEdit(skill)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={async () => {
                    setDeleteErrors(prev => { const next = { ...prev }; delete next[skill.id]; return next; });
                    try {
                      await deleteSkill(skill.id);
                    } catch (err: any) {
                      const msg = err.message?.replace(/^API Error \d+: /, '') || 'Delete failed';
                      setDeleteErrors(prev => ({ ...prev, [skill.id]: msg }));
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
          {deleteErrors[skill.id] && (
            <p className="text-xs text-destructive px-4 pb-1">{deleteErrors[skill.id]}</p>
          )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No skills found</div>
      )}
    </div>
  );
}
