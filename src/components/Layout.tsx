import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  Settings, 
  LogOut,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/app', icon: LayoutDashboard, roles: ['admin', 'guru', 'siswa'] },
  { label: 'Manajemen User', path: '/app/users', icon: Users, roles: ['admin'] },
  { label: 'Manajemen Soal', path: '/app/bank-soal', icon: FileText, roles: ['admin'] },
  { label: 'Manajemen Ujian', path: '/app/exams-management', icon: ClipboardList, roles: ['admin'] },
  { label: 'Bank Soal', path: '/app/bank-soal', icon: BookOpen, roles: ['guru'] },
  { label: 'Buat Ujian', path: '/app/exams-management', icon: FileText, roles: ['guru'] },
  { label: 'Daftar Ujian', path: '/app/exams', icon: ClipboardList, roles: ['siswa'] },
  { label: 'Hasil Ujian', path: '/app/results', icon: CheckCircle, roles: ['siswa', 'guru', 'admin'] },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const filteredItems = sidebarItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-border-subtle transition-all duration-300 z-50 flex flex-col",
          sidebarOpen ? "w-[240px]" : "w-16"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-border-subtle">
          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center w-full")}>
            <div className="bg-brand-red w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              S
            </div>
            {sidebarOpen && (
              <div className="font-bold text-[0.85rem] leading-tight text-slate-800 uppercase tracking-tight">
                SMK PRIMA<br /><span className="text-brand-red">UNGGUL</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-1">
            {sidebarOpen && <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2">Utama</p>}
            {filteredItems.filter(i => ['Dashboard', 'Manajemen User'].includes(i.label)).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-6 py-2.5 transition-all text-sm group border-l-4",
                  isActive 
                    ? "bg-brand-red/5 text-brand-red border-brand-red font-semibold" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", !sidebarOpen && "mx-auto")} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>

          <div className="space-y-1">
            {sidebarOpen && <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2">Akademik</p>}
            {filteredItems.filter(i => !['Dashboard', 'Manajemen User'].includes(i.label)).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-6 py-2.5 transition-all text-sm group border-l-4",
                  isActive 
                    ? "bg-brand-red/5 text-brand-red border-brand-red font-semibold" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", !sidebarOpen && "mx-auto")} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-border-subtle">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-2 py-2 w-full rounded-md text-xs font-semibold text-slate-500 hover:bg-brand-red/5 hover:text-brand-red transition-all",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-border-subtle h-16 flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-400 transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="font-semibold text-slate-800 text-sm md:text-base">Dashboard {profile?.role}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-slate-800 text-[0.8rem] leading-none">{profile?.name || 'User'}</div>
              <div className="text-[0.65rem] text-slate-400 uppercase tracking-wider font-bold mt-1">Guru Produktif</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs border border-border-subtle">
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
