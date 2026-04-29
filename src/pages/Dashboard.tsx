import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  Trophy, 
  Clock, 
  ArrowRight,
  PlusCircle,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>({
    users: 0,
    exams: 0,
    questions: 0,
    results: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      if (profile.role === 'admin') {
        fetchAdminStats();
      } else if (profile.role === 'guru') {
        fetchGuruStats();
      } else {
        fetchSiswaStats();
      }
    }
  }, [profile]);

  const fetchAdminStats = async () => {
    const [usersCount, examsCount] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('exams').select('*', { count: 'exact', head: true })
    ]);
    setStats({ users: usersCount.count || 0, exams: examsCount.count || 0 });
  };

  const fetchGuruStats = async () => {
    const [questionsCount, examsCount] = await Promise.all([
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('created_by', profile?.id),
      supabase.from('exams').select('*', { count: 'exact', head: true }).eq('created_by', profile?.id)
    ]);
    setStats({ questions: questionsCount.count || 0, exams: examsCount.count || 0 });
  };

  const fetchSiswaStats = async () => {
    const [examsCount, resultsCount] = await Promise.all([
      supabase.from('exams').select('*', { count: 'exact', head: true }),
      supabase.from('results').select('*', { count: 'exact', head: true }).eq('user_id', profile?.id)
    ]);
    setStats({ exams: examsCount.count || 0, results: resultsCount.count || 0 });
  };

  const AdminView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Siswa" value="1,248" />
        <StatCard icon={BookOpen} label="Bank Soal" value="452" />
        <StatCard icon={ClipboardList} label="Ujian Aktif" value="12" />
        <StatCard icon={Trophy} label="Hasil Selesai" value="89%" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <h3 className="text-[0.9rem] font-bold">Ujian Terbaru</h3>
            <button className="text-brand-red text-[0.75rem] font-bold uppercase tracking-wider">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.825rem]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-5 py-3 font-bold text-slate-500 uppercase tracking-widest border-b border-border-subtle">Judul Ujian</th>
                  <th className="px-5 py-3 font-bold text-slate-500 uppercase tracking-widest border-b border-border-subtle">Jurusan</th>
                  <th className="px-5 py-3 font-bold text-slate-500 uppercase tracking-widest border-b border-border-subtle">Durasi</th>
                  <th className="px-5 py-3 font-bold text-slate-500 uppercase tracking-widest border-b border-border-subtle">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {[
                  { title: 'Dasar Jaringan', major: 'TKJ', duration: '90m', status: 'Aktif', color: 'badge-green' },
                  { title: 'Desain Grafis', major: 'DKV', duration: '60m', status: 'Aktif', color: 'badge-green' },
                  { title: 'Akuntansi Dasar', major: 'AK', duration: '120m', status: 'Terjadwal', color: 'badge-blue' },
                  { title: 'Broadcasting', major: 'BC', duration: '90m', status: 'Selesai', color: 'badge-red' },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{item.title}</td>
                    <td className="px-5 py-3.5 text-slate-500">{item.major}</td>
                    <td className="px-5 py-3.5 text-slate-500">{item.duration}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("badge", 
                        item.color === 'badge-green' ? "bg-emerald-50 text-emerald-600" :
                        item.color === 'badge-blue' ? "bg-blue-50 text-blue-600" :
                        "bg-rose-50 text-brand-red"
                      )}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card flex flex-col">
          <div className="p-4 border-b border-border-subtle">
            <h3 className="text-[0.9rem] font-bold">Informasi Jurusan</h3>
          </div>
          <div className="p-5 flex flex-wrap gap-2">
            {['TKJ', 'DKV', 'AK', 'BC', 'MPLB', 'BD'].map(major => (
              <div key={major} className="bg-slate-50 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 border border-border-subtle flex-1 text-center min-w-[40%]">
                {major}
              </div>
            ))}
          </div>
          <div className="mt-auto p-5 border-t border-border-subtle">
            <p className="text-[0.7rem] text-slate-400 leading-relaxed font-medium">
              Sistem CBT SMK Prima Unggul mendukung sinkronisasi data real-time dengan Supabase untuk keakuratan nilai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const GuruView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={BookOpen} label="Bank Soal Anda" value={stats.questions} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={ClipboardList} label="Ujian Dibuat" value={stats.exams} color="bg-brand-red/10 text-brand-red" />
        <StatCard icon={Trophy} label="Sudah Dinilai" value={stats.results || '-'} color="bg-emerald-50 text-emerald-600" />
      </div>
      
      <div className="glass-card p-8 rounded-[32px]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold">Kelola Kelas</h3>
          <button 
            onClick={() => navigate('/app/create-exam')}
            className="btn-primary flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" /> Buat Ujian Baru
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickAction icon={BookOpen} label="Input Soal Pilihan Ganda" onClick={() => navigate('/app/bank-soal')} />
          <QuickAction icon={Trophy} label="Lihat Hasil Siswa" onClick={() => navigate('/app/results')} />
        </div>
      </div>
    </div>
  );

  const SiswaView = () => (
    <div className="space-y-8">
      <div className="p-8 bg-gradient-to-br from-brand-red to-brand-red-dark rounded-[32px] text-white shadow-xl shadow-brand-red/30">
        <h2 className="text-3xl font-bold mb-4">Halo, {profile?.name}! 👋</h2>
        <p className="text-brand-red-100 text-lg font-medium opacity-90 max-w-xl">
          Siap menaklukkan ujian hari ini? Pastikan koneksi internet stabil dan tetap fokus. Semoga sukses!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 rounded-[32px] hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate('/app/exams')}>
          <div className="flex items-center justify-between mb-6">
            <div className="bg-brand-red/10 p-3 rounded-2xl text-brand-red">
              <ClipboardList className="w-8 h-8" />
            </div>
            <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-brand-red transition-all" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Daftar Ujian</h3>
          <p className="text-slate-500 font-medium">Ada {stats.exams} ujian yang tersedia untuk Anda kerjakan.</p>
        </div>

        <div className="glass-card p-8 rounded-[32px] hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate('/app/results')}>
          <div className="flex items-center justify-between mb-6">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
              <Trophy className="w-8 h-8" />
            </div>
            <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-emerald-600 transition-all" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Lihat Hasil</h3>
          <p className="text-slate-500 font-medium">Anda telah menyelesaikan {stats.results} ujian sebelumnya.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Dashboard</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Selamat datang di Panel {profile?.role}</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="text-brand-red w-5 h-5" />
          <span className="font-bold text-slate-700">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {profile?.role === 'admin' && <AdminView />}
      {profile?.role === 'guru' && <GuruView />}
      {profile?.role === 'siswa' && <SiswaView />}
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="glass-card p-5 flex flex-col gap-2">
      <div className="text-[0.75rem] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
      <div className="text-2xl font-bold text-slate-800 tabular-nums">{value}</div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-brand-red/30 hover:bg-brand-red/5 transition-all text-left group"
    >
      <div className="bg-slate-50 p-3 rounded-xl text-slate-400 group-hover:bg-brand-red group-hover:text-white transition-all">
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-bold text-slate-700 group-hover:text-brand-red transition-all">{label}</span>
    </button>
  );
}
