import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { UserProfile, MoodEntry, PsychologicalAssessment } from '../types';
import { motion } from 'motion/react';
import { Heart, ClipboardCheck, TrendingUp, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard({ profile, setView }: { profile: UserProfile, setView: (v: any) => void }) {
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const moodQuery = query(
          collection(db, 'mood_tracking'),
          orderBy('recordedDate', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(moodQuery);
        setRecentMoods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoodEntry)));
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Avg Mood', value: recentMoods.length > 0 ? (recentMoods.reduce((acc, m) => acc + m.moodLevel, 0) / recentMoods.length).toFixed(1) : 'N/A', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Logs', value: recentMoods.length.toString(), icon: ClipboardCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Status', value: 'Active', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {profile.fullName.split(' ')[0]}!</h1>
        <p className="text-slate-500 mt-1">How are you feeling today?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <motion.div
            whileHover={{ y: -4 }}
            key={stat.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setView('chat')}
              className="group bg-indigo-600 p-6 rounded-2xl text-white text-left hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <h3 className="font-bold text-lg mb-2">Talk to AI</h3>
              <p className="text-indigo-100 text-sm mb-4">Get immediate emotional support and coping strategies.</p>
              <div className="flex items-center gap-2 font-semibold">
                Start Chat <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            <button
              onClick={() => setView('mood')}
              className="group bg-white p-6 rounded-2xl border border-slate-200 text-left hover:border-indigo-300 transition-all shadow-sm"
            >
              <h3 className="font-bold text-lg text-slate-900 mb-2">Log Mood</h3>
              <p className="text-slate-500 text-sm mb-4">Record how you're feeling to track your journey.</p>
              <div className="flex items-center gap-2 font-semibold text-indigo-600">
                Log Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {recentMoods.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No recent activity.</div>
            ) : (
              recentMoods.map((mood) => (
                <div key={mood.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Mood Logged</p>
                    <p className="text-xs text-slate-500">{format(new Date(mood.recordedDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="text-indigo-500 font-bold">{mood.moodLevel}/10</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Daily Quote/Tip */}
      <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
        <p className="text-indigo-600 font-bold uppercase tracking-wider text-xs mb-2">Daily Inspiration</p>
        <p className="text-xl text-slate-800 font-medium italic">
          "Self-care is not selfish. You cannot pour from an empty cup."
        </p>
      </div>
    </div>
  );
}
