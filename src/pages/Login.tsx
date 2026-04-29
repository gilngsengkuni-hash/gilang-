import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-8 border border-border-subtle"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-red w-12 h-12 rounded-xl mb-4 flex items-center justify-center">
            <GraduationCap className="text-white w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">Akses Portal CBT</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">SMK Prima Unggul</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 font-bold animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-[10px] uppercase tracking-wider">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Email Siswa/Guru</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input 
                type="email" 
                required
                className="input-field pl-10"
                placeholder="email@sekolah.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input 
                type="password" 
                required
                className="input-field pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary h-11 text-xs font-black tracking-[0.15em] uppercase mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col gap-2 items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <button className="hover:text-brand-red transition-colors">Lupa Password?</button>
          <button 
            onClick={() => navigate('/')}
            className="hover:text-slate-900 transition-colors"
          >
            KEMBALI KE BERANDA
          </button>
        </div>
      </motion.div>
    </div>
  );
}
