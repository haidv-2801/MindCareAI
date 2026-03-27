import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import MoodTracker from './components/MoodTracker';
import Assessment from './components/Assessment';
import { LayoutDashboard, MessageSquare, Heart, ClipboardCheck, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type View = 'dashboard' | 'chat' | 'mood' | 'assessment';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Complete Your Profile</h2>
          <ProfileForm user={user} onComplete={(p) => setProfile(p)} />
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Support', icon: MessageSquare },
    { id: 'mood', label: 'Mood Tracker', icon: Heart },
    { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Heart className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900">MindCare AI</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                view === item.id 
                ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
              {profile.fullName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{profile.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{profile.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <Heart className="text-indigo-600 w-6 h-6" />
          <span className="font-bold text-slate-900">MindCare AI</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed inset-0 bg-white z-40 md:hidden pt-20"
          >
            <nav className="p-6 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id as View);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg ${
                    view === item.id 
                    ? 'bg-indigo-50 text-indigo-600 font-bold' 
                    : 'text-slate-600'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg text-red-600"
              >
                <LogOut className="w-6 h-6" />
                Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-20 md:pt-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'dashboard' && <Dashboard profile={profile} user={user} setView={setView} />}
              {view === 'chat' && <Chat user={user} />}
              {view === 'mood' && <MoodTracker user={user} />}
              {view === 'assessment' && <Assessment user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function ProfileForm({ user, onComplete }: { user: User, onComplete: (p: UserProfile) => void }) {
  const [fullName, setFullName] = useState(user.displayName || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [birthYear, setBirthYear] = useState(2000);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const profile: UserProfile = {
      fullName,
      email: user.email || '',
      gender,
      birthYear,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    onComplete(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as any)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Birth Year</label>
        <input
          type="number"
          required
          min="1900"
          max="2026"
          value={birthYear}
          onChange={(e) => setBirthYear(parseInt(e.target.value))}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
      >
        {submitting ? 'Saving...' : 'Start My Journey'}
      </button>
    </form>
  );
}
