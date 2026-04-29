import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Laptop, Camera, Calculator, Radio, Building2, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';

const majors = [
  { name: 'TKJ', desc: 'Teknik Komputer & Jaringan', icon: Laptop, color: 'bg-blue-100 text-blue-600' },
  { name: 'DKV', desc: 'Desain Komunikasi Visual', icon: Camera, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'AK', desc: 'Akuntansi', icon: Calculator, color: 'bg-emerald-100 text-emerald-600' },
  { name: 'BC', desc: 'Broadcasting', icon: Radio, color: 'bg-purple-100 text-purple-600' },
  { name: 'MPLB', desc: 'Manajemen Perkantoran', icon: Building2, color: 'bg-amber-100 text-amber-600' },
  { name: 'BD', desc: 'Bisnis Digital', icon: ShoppingCart, color: 'bg-pink-100 text-pink-600' },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center bg-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-brand-red w-10 h-10 rounded-xl flex items-center justify-center">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <div className="font-extrabold text-2xl tracking-tighter text-slate-800 uppercase">
            SMK <span className="text-brand-red">PRIMA UNGGUL</span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          Masuk <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-8 text-slate-900 uppercase">
              Sistem <span className="text-brand-red italic">Ujian</span> Digital Profesional.
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mb-10 leading-relaxed font-medium">
              Platform Computer Based Test (CBT) modern untuk SMK Prima Unggul. Keadilan, kecepatan, dan akurasi dalam setiap evaluasi digital sekolah.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="btn-primary text-base px-10 py-5 rounded-xl shadow-xl shadow-brand-red/10 active:scale-95 transition-all"
              >
                Mulai Ujian Sekarang
              </button>
              <button className="px-10 py-5 rounded-xl border border-border-subtle font-bold text-slate-600 hover:bg-slate-50 transition-all">
                Tentang Kami
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl" />
            <div className="glass-card p-3 rounded-[32px] shadow-2xl relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?q=80&w=1000&auto=format&fit=crop" 
                alt="Digital Education" 
                className="rounded-[24px] w-full aspect-video object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </section>

        {/* Majors Section */}
        <section className="bg-slate-50/50 py-32 px-6 border-y border-border-subtle">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
              <span className="text-brand-red font-black tracking-[0.2em] uppercase text-xs block">Program Keahlian</span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 uppercase">Jurusan Kejuruan Kami</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {majors.map((major, idx) => (
                <motion.div
                  key={major.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-8 rounded-2xl border border-border-subtle shadow-sm hover:border-brand-red/20 transition-all cursor-default group"
                >
                  <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6", major.color)}>
                    <major.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-slate-800 uppercase tracking-tight">{major.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{major.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 font-medium">&copy; {new Date().getFullYear()} SMK Prima Unggul. All rights reserved.</p>
      </footer>
    </div>
  );
}
