import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Question } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  PlusCircle, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Calendar,
  Clock,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function CreateExam() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('id');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    duration: 60,
  });

  useEffect(() => {
    if (profile) {
      const init = async () => {
        setLoading(true);
        await fetchQuestions();
        if (examId) {
          await fetchExistingExam();
        }
        setLoading(false);
      };
      init();
    }
  }, [profile, examId]);

  const fetchQuestions = async () => {
    let query = supabase.from('questions').select('*').order('created_at', { ascending: false });
    if (profile?.role === 'guru') {
      query = query.eq('created_by', profile.id);
    }
    const { data, error } = await query;
    if (!error) setQuestions(data || []);
  };

  const fetchExistingExam = async () => {
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (examData) {
      setFormData({
        title: examData.title,
        duration: examData.duration,
      });

      const { data: qData } = await supabase
        .from('exam_questions')
        .select('question_id')
        .eq('exam_id', examId);
      
      if (qData) {
        setSelectedQuestions(qData.map(d => d.question_id));
      }
    }
  };

  const toggleQuestion = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || selectedQuestions.length === 0) {
      alert('Pilih minimal 1 soal!');
      return;
    }
    setLoading(true);

    try {
      let currentExamId = examId;

      if (examId) {
        // Update existing exam info
        const { error: updateError } = await supabase
          .from('exams')
          .update({
            title: formData.title,
            duration: formData.duration,
          })
          .eq('id', examId);
        
        if (updateError) {
          if (updateError.code === '42501') {
            throw new Error('Izin ditolak: Pastikan Anda memiliki izin untuk mengubah ujian ini di RLS Supabase.');
          }
          throw updateError;
        }

        // Sync questions (delete and re-insert)
        const { error: delError } = await supabase.from('exam_questions').delete().eq('exam_id', examId);
        if (delError) throw delError;
      } else {
        // Create new exam
        const { data: examData, error: examError } = await supabase
          .from('exams')
          .insert([{
            title: formData.title,
            duration: formData.duration,
            created_by: profile.id
          }])
          .select()
          .single();

        if (examError) {
          if (examError.code === '42501') {
            throw new Error('Izin ditolak: Akun Anda tidak memiliki izin untuk membuat ujian. Periksa RLS di DATABASE.md.');
          }
          throw examError;
        }
        currentExamId = examData.id;
      }

      // Link Questions
      const links = selectedQuestions.map(qId => ({
        exam_id: currentExamId,
        question_id: qId
      }));

      const { error: linkError } = await supabase.from('exam_questions').insert(links);

      if (linkError) {
        if (linkError.code === '42501') {
          throw new Error('Ujian berhasil dibuat/diubah, tapi GAGAL menautkan soal. Pastikan kebijakan RLS tabel exam_questions sudah dikonfigurasi (lihat DATABASE.md).');
        }
        throw linkError;
      }

      alert(examId ? 'Ujian diperbarui!' : 'Ujian berhasil dibuat!');
      navigate('/app/exams-management');
    } catch (err: any) {
      console.error('Save Exam Error:', err);
      alert('Gagal menyimpan: ' + (err.message || 'Terjadi kesalahan tidak dikenal'));
    } finally {
      setLoading(false);
    }
  };

  const filtered = questions.filter(q => 
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black text-slate-900 uppercase">{examId ? 'Kelola Soal Ujian' : 'Buat Ujian Baru'}</h1>
        <p className="text-slate-500 font-medium text-lg mt-1 tracking-wide">{examId ? 'Perbarui informasi ujian dan pilih soal dari bank soal' : 'Tentukan parameter ujian dan pilih soal-soal pilihan ganda'}</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Settings Panel */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-10 rounded-[40px] border-2 border-brand-red/5">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
              <span className="p-2 bg-brand-red/10 rounded-xl text-brand-red"><Calendar className="w-5 h-5" /></span>
              Konfigurasi Ujian
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Judul Ujian</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: UAS Pemrograman Dasar"
                  className="input-field py-4 text-lg font-bold"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Durasi (Menit)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="input-field pl-12 py-4 text-lg font-bold"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-400">Terpilih:</span>
                    <span className="text-xl font-black text-brand-red">{selectedQuestions.length} SOAL</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Minimal pilih 1 soal untuk melanjutkan.</div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || selectedQuestions.length === 0}
                  className="w-full btn-primary py-5 rounded-2xl text-lg font-black shadow-xl shadow-brand-red/20 disabled:grayscale transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{examId ? 'SIMPAN PERUBAHAN' : 'PUBLIKASIKAN UJIAN'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Question Selector Panel */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card rounded-[40px] overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><ClipboardList className="w-5 h-5" /></span>
                Pilih Soal dari Bank Soal
              </h3>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Cari pertanyaan..." 
                  className="input-field pl-10 py-3 text-sm bg-slate-50 border-transparent focus:bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
              {loading ? (
                <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                  Menyiapkan Kumpulan Soal...
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-20 text-center text-slate-400 italic">Tidak ada soal tersedia.</div>
              ) : (
                filtered.map((q) => (
                  <div 
                    key={q.id} 
                    onClick={() => toggleQuestion(q.id)}
                    className={cn(
                      "p-8 cursor-pointer transition-all flex items-start gap-6 group",
                      selectedQuestions.includes(q.id) ? "bg-brand-red/5" : "hover:bg-slate-50/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center border-2 transition-all",
                      selectedQuestions.includes(q.id) 
                        ? "bg-brand-red border-brand-red text-white" 
                        : "border-slate-200 group-hover:border-brand-red/30"
                    )}>
                      {selectedQuestions.includes(q.id) && <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-800 leading-snug group-hover:text-brand-red transition-all">
                        {q.question}
                      </p>
                      <div className="flex gap-4 mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>OPSI A-D TERSEDIA</span>
                        <span className="text-emerald-500">Kunci: {q.correct_answer}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
