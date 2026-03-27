import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { MoodEntry } from '../types';
import { Heart, Smile, Frown, Meh, Angry, Star, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const MOOD_OPTIONS = [
  { level: 1, icon: Angry, label: 'Terrible', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  { level: 3, icon: Frown, label: 'Bad', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  { level: 5, icon: Meh, label: 'Okay', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { level: 8, icon: Smile, label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { level: 10, icon: Star, label: 'Great', color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
];

export default function MoodTracker({ user }: { user: User }) {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'mood_tracking'),
      where('userId', '==', user.uid),
      orderBy('recordedDate', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMoods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoodEntry)));
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLevel === null || submitting) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'mood_tracking'), {
        userId: user.uid,
        moodLevel: selectedLevel,
        moodNote: note,
        recordedDate: new Date().toISOString(),
      });
      setSelectedLevel(null);
      setNote('');
    } catch (error) {
      console.error('Mood log error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Mood Tracker</h1>
        <p className="text-slate-500 mt-1">Reflect on your emotions and track your progress over time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Log Mood Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">How are you feeling right now?</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-5 gap-4">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.level}
                    type="button"
                    onClick={() => setSelectedLevel(option.level)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 ${
                      selectedLevel === option.level
                      ? `${option.border} ${option.bg} scale-105 shadow-md`
                      : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <option.icon className={`w-8 h-8 ${selectedLevel === option.level ? option.color : 'text-slate-400'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      selectedLevel === option.level ? option.color : 'text-slate-400'
                    }`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Add a note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's making you feel this way?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all min-h-[120px]"
                />
              </div>

              <button
                type="submit"
                disabled={selectedLevel === null || submitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
              >
                {submitting ? 'Logging...' : 'Log Mood'}
              </button>
            </form>
          </div>
        </div>

        {/* Recent History */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Recent Logs</h2>
          <div className="space-y-4">
            {moods.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-slate-400 text-sm">No mood logs yet.</p>
              </div>
            ) : (
              moods.map((mood) => {
                const option = MOOD_OPTIONS.find(o => o.level === mood.moodLevel) || MOOD_OPTIONS[2];
                return (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={mood.id}
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4"
                  >
                    <div className={`w-10 h-10 ${option.bg} ${option.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <option.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-slate-900">{option.label}</p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {format(new Date(mood.recordedDate), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      {mood.moodNote && (
                        <p className="text-xs text-slate-500 line-clamp-2 italic">"{mood.moodNote}"</p>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
