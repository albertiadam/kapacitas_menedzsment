import { FolderKanban, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${collapsed ? 'w-16' : 'w-56'} min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200`}>
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="text-sm font-semibold text-foreground truncate">Resource Allocator</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{user?.role.toUpperCase()}</p>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        <NavLink
          to="/projects"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent text-primary font-medium"
        >
          <FolderKanban className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Projects</span>}
        </NavLink>
        <NavLink
          to="/skills"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent text-primary font-medium"
        >
          <Users className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Skills</span>}
        </NavLink>
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
