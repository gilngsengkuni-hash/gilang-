import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UserManagement } from './pages/UserManagement';
import { QuestionBank } from './pages/QuestionBank';
import { Exams } from './pages/Exams';
import { TakeExam } from './pages/TakeExam';
import { Results } from './pages/Results';
import { CreateExam } from './pages/CreateExam';
import { Loader2 } from 'lucide-react';

import { ExamManagement } from './pages/ExamManagement';

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
        <p className="text-slate-400 font-black tracking-widest text-sm uppercase">孟 Authenticating...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  
  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/app" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/users" element={
          <ProtectedRoute roles={['admin']}>
            <Layout><UserManagement /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/questions-management" element={
          <ProtectedRoute roles={['admin']}>
            <Layout><QuestionBank /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/exams-management" element={
          <ProtectedRoute roles={['admin', 'guru']}>
            <Layout><ExamManagement /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/bank-soal" element={
          <ProtectedRoute roles={['guru', 'admin']}>
            <Layout><QuestionBank /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/create-exam" element={
          <ProtectedRoute roles={['guru', 'admin']}>
            <Layout><CreateExam /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/exams" element={
          <ProtectedRoute roles={['siswa']}>
            <Layout><Exams /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/exams/:id" element={
          <ProtectedRoute roles={['siswa']}>
            <Layout><TakeExam /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/results" element={
          <ProtectedRoute>
            <Layout><Results /></Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
