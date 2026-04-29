import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Exam, ExamResult } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  ClipboardList, 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    const [examsRes, resultsRes] = await Promise.all([
      supabase.from('exams').select('*').order('created_at', { ascending: false }),
      supabase.from('results').select('*').eq('user_id', profile?.id)
    ]);

    if (examsRes.data) setExams(examsRes.data as Exam[]);
    if (resultsRes.data) setResults(resultsRes.data as ExamResult[]);
    setLoading(false);
  };

  const getResultForExam = (examId: string) => {
    return results.find(r => r.exam_id === examId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase">Daftar Ujian</h1>
        <p className="text-slate-500 font-medium tracking-wide">Pilih ujian yang tersedia untuk dikerjakan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-8 rounded-[32px] animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-2xl mb-6" />
              <div className="h-6 bg-slate-200 rounded-lg w-3/4 mb-4" />
              <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
            </div>
          ))
        ) : exams.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-card rounded-[32px]">
            <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold italic text-lg">Belum ada ujian yang tersedia.</p>
          </div>
        ) : (
          exams.map((exam) => {
            const result = getResultForExam(exam.id);
            return (
              <div 
                key={exam.id} 
                className={cn(
                  "glass-card p-8 rounded-[40px] flex flex-col justify-between group transition-all duration-500 border-2",
                  result ? "border-emerald-100 bg-emerald-50/20 shadow-emerald-100" : "border-transparent hover:border-brand-red/20 shadow-slate-200"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className={cn(
                      "p-4 rounded-3xl transition-transform group-hover:scale-110 group-hover:rotate-6",
                      result ? "bg-emerald-100 text-emerald-600" : "bg-brand-red/10 text-brand-red"
                    )}>
                      <ClipboardList className="w-8 h-8" />
                    </div>
                    {result && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">NILAI ANDA</span>
                        <span className="text-3xl font-black text-emerald-600">{result.score}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 group-hover:text-brand-red transition-colors">
                    {exam.title}
                  </h3>
                  
                  <div className="flex items-center gap-6 mb-8 mt-2">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm tracking-wide">
                      <Clock className="w-4 h-4 text-brand-red" />
                      <span>{exam.duration} MENIT</span>
                    </div>
                    {result ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm tracking-wide">
                        <CheckCircle className="w-4 h-4" />
                        <span>SELESAI</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-500 font-bold text-sm tracking-wide">
                        <AlertCircle className="w-4 h-4" />
                        <span>BELUM</span>
                      </div>
                    )}
                  </div>
                </div>

                {result ? (
                  <button 
                    onClick={() => navigate(`/app/results/${result.id}`)}
                    className="w-full py-4 rounded-2xl bg-emerald-100 text-emerald-700 font-black tracking-widest uppercase text-xs hover:bg-emerald-200 transition-all flex items-center justify-center gap-2"
                  >
                    DETAIL HASIL <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate(`/app/exams/${exam.id}`)}
                    className="w-full btn-primary py-4 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl shadow-brand-red/20 group-hover:shadow-brand-red/40 flex items-center justify-center gap-2 transition-all"
                  >
                    MULAI UJIAN <PlayCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
