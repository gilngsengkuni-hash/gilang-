import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Question } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  PlusCircle, 
  Search, 
  Loader2, 
  Trash2, 
  Edit2, 
  FileText,
  X,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

export function QuestionBank() {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a' as any
  });

  useEffect(() => {
    if (profile) fetchQuestions();
  }, [profile]);

  const fetchQuestions = async () => {
    setLoading(true);
    let query = supabase.from('questions').select('*').order('created_at', { ascending: false });
    
    if (profile?.role === 'guru') {
      query = query.eq('created_by', profile.id);
    }

    const { data, error } = await query;
    if (!error) setQuestions(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('questions').insert([{
        ...formData,
        created_by: profile.id
      }]);

      if (error) throw error;
      
      await fetchQuestions();
      setModalOpen(false);
      setFormData({
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'a'
      });
    } catch (err) {
      console.error(err);
      alert('Error saving question');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus soal ini?')) {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (!error) fetchQuestions();
    }
  };

  const filtered = questions.filter(q => 
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Bank Soal</h1>
          <p className="text-slate-500 font-medium italic">Koleksi pertanyaan ujian Anda</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" /> Tambah Soal Baru
        </button>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-white/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari isi pertanyaan..." 
              className="input-field pl-12 bg-slate-50 border-transparent focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-20 text-center text-slate-400">
               <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
               Memuat bank soal...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center italic text-slate-400">
              Belum ada soal ditemukan.
            </div>
          ) : (
            filtered.map((q) => (
              <div key={q.id} className="p-8 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-start gap-6">
                <div className="bg-slate-100 w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-slate-400">
                  {q.id.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 leading-snug">{q.question}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['a', 'b', 'c', 'd'].map(key => (
                      <div 
                        key={key} 
                        className={cn(
                          "px-4 py-3 rounded-xl text-sm font-medium border flex items-center gap-3 transition-colors",
                          q.correct_answer === key 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold" 
                            : "bg-white border-slate-100 text-slate-500"
                        )}
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black uppercase">
                          {key}
                        </span>
                        {q[`option_${key}` as keyof Question]}
                        {q.correct_answer === key && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex md:flex-col gap-2">
                  <button className="p-3 hover:bg-blue-50 rounded-2xl text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 shadow-sm">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="p-3 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-600 transition-all border border-transparent hover:border-red-100 shadow-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="bg-white rounded-[40px] shadow-2xl relative z-10 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-brand-red p-8 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-xl">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">Buat Soal Baru</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Pertanyaan</label>
                <textarea 
                  required
                  rows={3}
                  className="input-field py-4 resize-none text-lg font-bold" 
                  placeholder="Ketik pertanyaan di sini..."
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['a', 'b', 'c', 'd'].map(key => (
                  <div key={key} className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Opsi {key.toUpperCase()}</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                        {key.toUpperCase()}
                      </div>
                      <input 
                        type="text" 
                        required
                        className="input-field pl-16 py-4 font-medium" 
                        placeholder={`Jawaban opsi ${key.toUpperCase()}...`}
                        value={formData[`option_${key}` as keyof typeof formData] as string}
                        onChange={(e) => setFormData({...formData, [`option_${key}` as any]: e.target.value})}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Kunci Jawaban</label>
                <div className="flex gap-4">
                  {['a', 'b', 'c', 'd'].map(key => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({...formData, correct_answer: key as any})}
                      className={cn(
                        "flex-1 py-4 rounded-2xl font-black text-lg border-2 transition-all",
                        formData.correct_answer === key 
                          ? "bg-brand-red border-brand-red text-white shadow-xl shadow-brand-red/20" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                      )}
                    >
                      {key.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button type="submit" disabled={loading} className="btn-primary px-12 py-4 rounded-2xl text-lg font-black shadow-xl shadow-brand-red/20">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'SIMPAN SOAL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
