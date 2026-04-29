import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Exam } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  ClipboardList, 
  PlusCircle, 
  Trash2, 
  Search, 
  Loader2, 
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function ExamManagement() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (profile) fetchExams();
  }, [profile]);

  const fetchExams = async () => {
    setLoading(true);
    let query = supabase.from('exams').select('*').order('created_at', { ascending: false });
    
    // Guru hanya melihat ujian yang mereka buat, Admin melihat semua
    if (profile?.role === 'guru') {
      query = query.eq('created_by', profile.id);
    }

    const { data, error } = await query;
    if (!error) setExams(data as Exam[]);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus ujian ini? Semua data hasil ujian terkait juga akan terpengaruh.')) {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (!error) fetchExams();
      else alert('Gagal menghapus ujian.');
    }
  };

  const filtered = exams.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase">Manajemen Ujian</h1>
          <p className="text-slate-500 font-medium tracking-wide">Publikasikan ujian baru dan kelola daftar evaluasi</p>
        </div>
        <button 
          onClick={() => navigate('/app/create-exam')}
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" /> Buat Ujian Baru
        </button>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-border-subtle bg-white/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari judul ujian..." 
              className="input-field pl-10 py-3 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-border-subtle">
          {loading ? (
            <div className="p-20 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              Memuat daftar ujian...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center italic text-slate-400">
              Belum ada ujian yang dibuat.
            </div>
          ) : (
            filtered.map((exam) => (
              <div key={exam.id} className="p-6 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-center gap-6">
                <div className="bg-brand-red/5 w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-brand-red">
                  <ClipboardList className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 truncate">{exam.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.duration} Menit
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5" />
                      {exam.created_at ? format(new Date(exam.created_at), 'dd MMM yyyy') : '-'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/app/create-exam?id=${exam.id}`)}
                    className="p-2.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold text-xs flex items-center gap-2"
                    title="Kelola Soal"
                  >
                    Soal <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(exam.id)}
                    className="p-2.5 rounded-lg text-slate-400 hover:text-brand-red hover:bg-brand-red/5 transition-all"
                    title="Hapus Ujian"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate(`/app/results?exam_id=${exam.id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                  >
                    Hasil <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
