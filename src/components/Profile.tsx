import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { User as UserIcon, Mail, Calendar, Heart, Save, Loader2, LogOut, Settings, Sparkles, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile({ profile, user }: { profile: UserProfile, user: User }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile.fullName,
    gender: profile.gender,
    birthYear: profile.birthYear,
    bio: profile.bio || '',
    aiPersona: profile.aiPersona || 'Empathetic & Supportive',
    interests: profile.interests?.join(', ') || ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedProfile = {
        ...formData,
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i !== '')
      };
      await updateDoc(doc(db, 'users', user.uid), updatedProfile);
      setEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-indigo-600" />
            Account & Personalization
          </h1>
          <p className="text-slate-500 mt-1">Manage your profile and how MindCare AI interacts with you.</p>
        </div>
        <button
          onClick={() => auth.signOut()}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
            <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <UserIcon className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
            <p className="text-slate-500 text-sm">{profile.email}</p>
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Gender</p>
                <p className="font-bold text-slate-700">{profile.gender}</p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Birth Year</p>
                <p className="font-bold text-slate-700">{profile.birthYear}</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6" />
              <h3 className="font-bold text-lg">AI Personalization</h3>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Your AI assistant adapts to your personality. Currently using the 
              <span className="font-bold text-white mx-1">"{profile.aiPersona || 'Empathetic'}"</span> 
              persona to provide the best support.
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-400" />
                Profile Settings
              </h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <input
                    disabled={!editing}
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Gender</label>
                  <select
                    disabled={!editing}
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Bio / About You</label>
                <textarea
                  disabled={!editing}
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell MindCare AI a bit about yourself..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Interests (comma separated)</label>
                <input
                  disabled={!editing}
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="Meditation, Reading, Sports..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">AI Persona Preference</label>
                <select
                  disabled={!editing}
                  value={formData.aiPersona}
                  onChange={(e) => setFormData({ ...formData, aiPersona: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                >
                  <option value="Empathetic & Supportive">Empathetic & Supportive</option>
                  <option value="Direct & Solution-Oriented">Direct & Solution-Oriented</option>
                  <option value="Calm & Meditative">Calm & Meditative</option>
                  <option value="Friendly & Casual">Friendly & Casual</option>
                </select>
              </div>

              {editing && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
