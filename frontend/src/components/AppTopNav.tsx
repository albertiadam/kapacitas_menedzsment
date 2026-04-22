import { FolderKanban, Users, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function AppTopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="h-12 bg-card border-b border-border flex items-center px-4 gap-6 shrink-0">
      <h1 className="text-sm font-semibold text-foreground font-mono tracking-tight mr-2">CapMan</h1>

      <nav className="flex items-center gap-1">
        <NavLink
          to="/projects"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          activeClassName="bg-accent text-primary font-medium"
        >
          <FolderKanban className="w-4 h-4" />
          <span>Projects</span>
        </NavLink>
        <NavLink
          to="/resources"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          activeClassName="bg-accent text-primary font-medium"
        >
          <Users className="w-4 h-4" />
          <span>Resources</span>
        </NavLink>
      </nav>

      <div className="flex-1" />

      <span className="text-xs text-muted-foreground font-mono">{user?.role.toUpperCase()}</span>
      <Button variant="ghost" size="sm" onClick={logout} className="h-8 text-muted-foreground hover:text-foreground">
        <LogOut className="w-4 h-4 mr-1" /> Logout
      </Button>
    </header>
  );
}
