import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';
import { 
  UserPlus, 
  Trash2, 
  Edit2, 
  Search, 
  Loader2, 
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'siswa' as UserRole
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*').order('name');
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app with Admin SDK, we could use supabase.auth.admin.createUser
      // But here, since we are in a client environment, we can only create users via Auth.signUp
      // Or we can just mock the table entries if the user is already authenticated separately
      // For now, let's assume we are adding to the 'users' table which is synced with auth via triggers
      // and for auth creation, we remind the user that standard client SDK doesn't allow adding other users easily without Admin Key
      
      const { data, error } = await supabase.from('users').insert([{
        id: crypto.randomUUID(), // Mocking ID for now if we can't create real auth user
        name: formData.name,
        role: formData.role
      }]);

      if (error) throw error;
      
      fetchUsers();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error adding user. Note: Client-side SDK requires Service Role Key to manage other users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Hapus user ini secara permanen?')) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) fetchUsers();
      else alert('Error deleting user');
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', role: 'siswa' });
    setEditingUser(null);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase">Manajemen User</h1>
          <p className="text-slate-500 font-medium tracking-wide">Kelola akses siswa, guru, dan admin</p>
        </div>
        <button 
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" /> Tambah User
        </button>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white/50 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari nama atau role..." 
              className="input-field pl-12 bg-slate-50 border-transparent focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden md:block">
            {filteredUsers.length} TOTAL USER
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div className="font-bold text-slate-700">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        user.role === 'admin' ? "bg-purple-100 text-purple-600" :
                        user.role === 'guru' ? "bg-blue-100 text-blue-600" :
                        "bg-emerald-100 text-emerald-600"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">{user.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 shadow-sm transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 shadow-sm transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="bg-white rounded-[40px] shadow-2xl relative z-10 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-brand-red p-8 flex items-center justify-between text-white">
              <h2 className="text-2xl font-bold">Tambah User Baru</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-widest">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  className="input-field" 
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-widest">Email</label>
                  <input 
                    type="email" 
                    required
                    className="input-field" 
                    placeholder="budis@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-widest">Role</label>
                  <select 
                    className="input-field appearance-none cursor-pointer"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-widest">Password</label>
                <input 
                  type="password" 
                  required
                  className="input-field" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <div className="p-4 bg-amber-50 rounded-2xl flex items-start gap-3 border border-amber-100">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 font-medium">
                    Catatan: Fitur tambah user ini memerlukan setup Trigger SQL di Supabase agar tersinkronisasi dengan Authentication.
                  </p>
                </div>
                <button type="submit" className="btn-primary py-4 text-lg font-bold shadow-xl shadow-brand-red/20 flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" /> SIMPAN USER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
