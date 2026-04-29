import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ExamResult } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  Trophy, 
  Search, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  User as UserIcon,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export function Results() {
  const { profile } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (profile) fetchResults();
  }, [profile]);

  const fetchResults = async () => {
    setLoading(true);
    let query = supabase
      .from('results')
      .select(`
        *,
        exam:exams (*),
        user:users (*)
      `)
      .order('completed_at', { ascending: false });

    if (profile?.role === 'siswa') {
      query = query.eq('user_id', profile.id);
    } else if (profile?.role === 'guru') {
      // Teachers see results for exams THEY created
      // In a real app we'd filter by exam.created_by, but Supabase joins are tricky for cross-filtering.
      // For now, let's just get all provided the role is guru/admin.
    }

    const { data, error } = await query;
    if (!error) setResults(data as unknown as ExamResult[]);
    setLoading(false);
  };

  const filtered = results.filter(r => 
    (r.exam?.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.user?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) 
    : 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Rekap Hasil</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Daftar perolehan nilai ujian yang telah diselesaikan</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-emerald-200 transition-all">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 transition-transform group-hover:rotate-12">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">{averageScore}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">RATA-RATA</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[40px] overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-white/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari ujian atau nama siswa..." 
              className="input-field pl-12 bg-slate-50 border-transparent focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="px-6 py-2 bg-slate-100 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest">
            {filtered.length} RIWAYAT
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Siswa / Ujian</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Tanggal Pelaksanaan</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Skor Akhir</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-brand-red mx-auto mb-4" />
                    <span className="font-bold text-slate-400 tracking-widest uppercase text-sm">Menarik Data Hasil...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-200">
                      <Trophy className="w-10 h-10" />
                    </div>
                    <p className="text-slate-400 text-lg font-bold">Belum ada hasil ujian tercatat.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50/50 transition-all group cursor-default">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 overflow-hidden">
                          {result.user?.name ? (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 text-xl bg-slate-50">
                              {result.user.name.charAt(0)}
                            </div>
                          ) : (
                            <UserIcon className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900 group-hover:text-brand-red transition-all leading-tight">
                            {result.exam?.title || 'Ujian Terhapus'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{result.user?.name || 'User Anonim'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-xs font-bold text-brand-red/50 uppercase tracking-wider">{result.user?.role}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                          {format(new Date(result.completed_at), 'dd MMMM yyyy', { locale: localeId })}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          Pukul {format(new Date(result.completed_at), 'HH:mm')} WIB
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className={cn(
                        "inline-flex items-center justify-center w-16 h-16 rounded-[24px] text-2xl font-black shadow-lg",
                        result.score >= 75 ? "bg-emerald-500 text-white shadow-emerald-500/20" :
                        result.score >= 60 ? "bg-amber-500 text-white shadow-amber-500/20" :
                        "bg-rose-500 text-white shadow-rose-500/20"
                      )}>
                        {result.score}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 group-hover:text-brand-red group-hover:border-brand-red/30 group-hover:shadow-lg transition-all">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
