import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { ClipboardCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const QUESTIONS = [
  { id: 'stressLevel', label: 'How stressed have you felt lately?', min: 'Not at all', max: 'Extremely' },
  { id: 'anxietyLevel', label: 'How anxious or worried have you been?', min: 'Not at all', max: 'Extremely' },
  { id: 'depressionLevel', label: 'How low or down have you felt?', min: 'Not at all', max: 'Extremely' },
  { id: 'sleepQuality', label: 'How would you rate your sleep quality?', min: 'Very Poor', max: 'Excellent' },
];

export default function Assessment({ user }: { user: User }) {
  const [scores, setScores] = useState<Record<string, number>>({
    stressLevel: 5,
    anxietyLevel: 5,
    depressionLevel: 5,
    sleepQuality: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'psychological_assessments'), {
        userId: user.uid,
        ...scores,
        createdAt: new Date().toISOString(),
      });
      setCompleted(true);
    } catch (error) {
      console.error('Assessment error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Assessment Completed</h2>
        <p className="text-slate-600 text-lg">
          Thank you for sharing. Your results have been recorded and will help us provide better support.
        </p>
        <button
          onClick={() => setCompleted(false)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          Take Another Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Psychological Assessment</h1>
        <p className="text-slate-500 mt-2">
          This brief assessment helps us understand your current mental state. 
          Please answer honestly based on your feelings over the past week.
        </p>
      </header>

      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-12">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-lg font-bold text-slate-800">{q.label}</label>
                <span className="text-2xl font-black text-indigo-600 bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center">
                  {scores[q.id]}
                </span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={scores[q.id]}
                  onChange={(e) => setScores({ ...scores, [q.id]: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>{q.min}</span>
                  <span>{q.max}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4">
            <AlertCircle className="text-amber-600 w-6 h-6 flex-shrink-0" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Note:</strong> This assessment is for informational purposes only and is not a clinical diagnosis. 
              If you are feeling overwhelmed, please reach out to a mental health professional.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </form>
      </div>
    </div>
  );
}
