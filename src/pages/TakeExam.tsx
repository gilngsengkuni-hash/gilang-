import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Exam, Question, Answer } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (id) fetchExamData();
  }, [id]);

  const fetchExamData = async () => {
    setLoading(true);
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .single();

    if (examError) {
      console.error(examError);
      navigate('/app/exams');
      return;
    }

    const { data: qData, error: qError } = await supabase
      .from('exam_questions')
      .select('question_id')
      .eq('exam_id', id);

    if (qError) {
      console.error('Error fetching exam_questions:', qError);
    }

    if (qData && qData.length > 0) {
      const qIds = qData.map(d => d.question_id);
      console.log('Found question IDs:', qIds);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .in('id', qIds);
      
      if (questionsError) {
        console.error('Error fetching questions detail:', questionsError);
      }

      // Preserve order if we had a specific order, for now just sort by qIds array
      const sortedQuestions = (questionsData || []).sort((a, b) => {
        return qIds.indexOf(a.id) - qIds.indexOf(b.id);
      });

      console.log('Fetched questions detail:', sortedQuestions);
      setQuestions(sortedQuestions);
      
      if (sortedQuestions.length > 0) {
        setTimeLeft(examData.duration * 60);
      }
    } else {
      console.log('No questions linked to this exam in exam_questions table.');
      setQuestions([]);
    }
    
    setExam(examData as Exam);
    setLoading(false);
  };

  const handleFinish = useCallback(async () => {
    if (submitting || !profile || !exam) return;
    setSubmitting(true);

    try {
      // Calculate score
      if (questions.length === 0) {
        throw new Error('Ujian tidak memiliki soal. Tidak dapat menghitung nilai.');
      }

      let correctCount = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);

      // Save result
      const { error: resultError } = await supabase.from('results').insert([{
        user_id: profile.id,
        exam_id: exam.id,
        score: isNaN(score) ? 0 : score
      }]);

      if (resultError) throw resultError;

      // Save all answers for review
      const answersToSave = Object.entries(answers).map(([qId, val]) => ({
        user_id: profile.id,
        exam_id: exam.id,
        question_id: qId,
        answer: val
      }));

      await supabase.from('answers').insert(answersToSave);

      setIsFinished(true);
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Gagal menyimpan hasil ujian. Menghubungi admin...');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, profile, exam, questions, answers]);

  useEffect(() => {
    if (timeLeft <= 0 && !loading && !isFinished && !submitting && questions.length > 0) {
      handleFinish();
      return;
    }

    if (isFinished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, isFinished, handleFinish]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const setAnswer = (questionId: string, choice: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: choice }));
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-red animate-spin mb-4" />
        <p className="text-slate-500 font-bold tracking-widest animate-pulse">MEMPERSIAPKAN SOAL UJIAN...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-20 text-center space-y-8"
      >
        <div className="bg-emerald-50 w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto text-emerald-500">
          <CheckCircle2 className="w-16 h-16" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">UJIAN SELESAI</h2>
          <p className="text-xl text-slate-500 font-medium max-w-md mx-auto">
            Selamat! Anda telah menyelesaikan ujian <span className="font-bold text-slate-900">{exam?.title}</span>. Nilai Anda telah tercatat di sistem.
          </p>
        </div>
        <button 
          onClick={() => navigate('/app/exams')}
          className="btn-primary px-10 py-5 text-lg font-bold rounded-[32px] shadow-2xl shadow-brand-red/30"
        >
          KEMBALI KE DAFTAR UJIAN
        </button>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="bg-amber-50 p-6 rounded-full text-amber-500">
          <AlertCircle className="w-16 h-16" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 uppercase">Ujian Kosong</h2>
          <p className="text-slate-500 font-medium">Ujian ini belum memiliki soal. Silakan hubungi guru pengampu.</p>
        </div>
        <button 
          onClick={() => navigate('/app/exams')}
          className="btn-primary px-8 py-3 rounded-xl font-bold"
        >
          KEMBALI KE DAFTAR UJIAN
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  if (!currentQ) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-3 space-y-6">
        <div className="glass-card p-8 rounded-[32px] sticky top-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tighter tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Navigasi Soal</h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={cn(
                    "aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all border-2",
                    currentIdx === idx ? "bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/20" :
                    answers[q.id] ? "bg-emerald-50 border-emerald-500/20 text-emerald-600" :
                    "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 italic space-y-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-slate-400">Dijawab</span>
              <span className="text-slate-900">{Object.keys(answers).length} / {questions.length}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand-red"
                initial={{ width: 0 }}
                animate={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Question Content */}
      <main className="lg:col-span-9 space-y-6">
        <div className="glass-card p-10 md:p-14 rounded-[48px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <HelpCircle className="w-12 h-12 text-slate-50 opacity-10" />
          </div>
          
          <div className="flex items-center gap-4 mb-10">
            <span className="bg-brand-red/10 text-brand-red px-5 py-2 rounded-full font-black text-sm uppercase tracking-widest">
              SOAL NOMOR {currentIdx + 1}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold leading-tight text-slate-900">
                {currentQ.question}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {['a', 'b', 'c', 'd'].map((key) => {
                  const optionText = currentQ[`option_${key}` as keyof Question];
                  const isSelected = answers[currentQ.id] === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => setAnswer(currentQ.id, key)}
                      className={cn(
                        "group p-6 rounded-3xl border-2 text-left transition-all duration-300 flex items-center gap-6",
                        isSelected 
                          ? "bg-brand-red border-brand-red shadow-xl shadow-brand-red/20 translate-x-2" 
                          : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-colors",
                        isSelected ? "bg-white text-brand-red" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      )}>
                        {key.toUpperCase()}
                      </div>
                      <span className={cn(
                        "text-lg font-bold flex-1",
                        isSelected ? "text-white" : "text-slate-700"
                      )}>
                        {optionText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-6 h-6" /> SEBELUMNYA
          </button>

          {currentIdx === questions.length - 1 ? (
            <button
              onClick={() => {
                if (Object.keys(answers).length < questions.length) {
                  if (confirm('Belum semua soal dijawab. Yakin ingin submit?')) {
                    handleFinish();
                  }
                } else {
                  handleFinish();
                }
              }}
              disabled={submitting}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl font-black bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5" /> SUBMIT UJIAN</>}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl font-black bg-brand-red text-white shadow-xl shadow-brand-red/20 hover:scale-105 active:scale-95 transition-all"
            >
              SELANJUTNYA <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
