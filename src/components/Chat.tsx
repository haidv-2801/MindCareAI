import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Message, ChatSession } from '../types';
import { getAIResponse, analyzeEmotion } from '../services/gemini';
import { Send, Bot, User as UserIcon, AlertTriangle, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

export default function Chat({ user }: { user: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create or get session
    const setupSession = async () => {
      const newSession: Omit<ChatSession, 'id'> = {
        userId: user.uid,
        sessionTitle: 'New Session',
        createdAt: new Date().toISOString(),
      };
      const sessionRef = await addDoc(collection(db, 'chat_sessions'), newSession);
      setSession({ id: sessionRef.id, ...newSession });
    };
    setupSession();
  }, [user.uid]);

  useEffect(() => {
    if (!session) return;

    const q = query(
      collection(db, `chat_sessions/${session.id}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !session || loading) return;

    const text = inputText;
    setInputText('');
    setLoading(true);

    try {
      // 1. Save user message
      const userMsg: Omit<Message, 'id'> = {
        sessionId: session.id,
        sender: 'user',
        messageText: text,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, `chat_sessions/${session.id}/messages`), userMsg);

      // 2. Get AI response
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.messageText }]
      }));
      
      const aiText = await getAIResponse(text, history);
      const emotion = await analyzeEmotion(text);

      // 3. Check for crisis
      if (aiText.includes('[CRISIS_DETECTED]')) {
        const parts = aiText.split('\n');
        const crisisInfo = parts[0];
        const actualResponse = parts.slice(1).join('\n');
        
        await addDoc(collection(db, 'crisis_alerts'), {
          userId: user.uid,
          sessionId: session.id,
          alertLevel: crisisInfo.includes('high') ? 'high' : crisisInfo.includes('medium') ? 'medium' : 'low',
          alertMessage: crisisInfo,
          createdAt: new Date().toISOString(),
        });

        const aiMsg: Omit<Message, 'id'> = {
          sessionId: session.id,
          sender: 'ai',
          messageText: actualResponse,
          emotionDetected: emotion,
          createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, `chat_sessions/${session.id}/messages`), aiMsg);
      } else {
        const aiMsg: Omit<Message, 'id'> = {
          sessionId: session.id,
          sender: 'ai',
          messageText: aiText,
          emotionDetected: emotion,
          createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, `chat_sessions/${session.id}/messages`), aiMsg);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Bot className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">MindCare AI Assistant</h2>
            <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Online & Ready to Listen
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
              <MessageSquare className="text-slate-300 w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Start a conversation</h3>
            <p className="text-slate-500 text-sm">
              I'm here to support you. You can talk to me about anything that's on your mind.
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-1 ${
                msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}>
                {msg.sender === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm ${
                msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-0">
                  <ReactMarkdown>{msg.messageText}</ReactMarkdown>
                </div>
                {msg.emotionDetected && msg.sender === 'ai' && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emotion Detected:</span>
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{msg.emotionDetected}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-white border border-slate-200 text-slate-600 rounded-lg flex items-center justify-center mt-1">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                <span className="text-sm text-slate-500 italic">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          MindCare AI can make mistakes. If you're in crisis, please call emergency services.
        </p>
      </div>
    </div>
  );
}
