import React from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Heart, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center"
      >
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-200">
          <Heart className="text-white w-12 h-12" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">MindCare AI</h1>
        <p className="text-slate-600 mb-10 text-lg">
          Your compassionate companion for mental well-being. 
          Track your mood, assess your mental health, and chat with our supportive AI.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 hover:border-indigo-200 transition-all text-lg shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
          Continue with Google
        </button>

        <p className="mt-8 text-sm text-slate-400">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </motion.div>
    </div>
  );
}
