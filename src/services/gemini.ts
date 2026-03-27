import { GoogleGenAI } from "@google/genai";

import { UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getAIResponse = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], profile?: UserProfile) => {
  const persona = profile?.aiPersona || "Empathetic & Supportive";
  const bio = profile?.bio ? `User Bio: ${profile.bio}` : "";
  const interests = profile?.interests?.length ? `User Interests: ${profile.interests.join(', ')}` : "";
  
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history.concat([{ role: 'user', parts: [{ text: message }] }]),
    config: {
      systemInstruction: `You are MindCare AI, a compassionate and professional mental health support assistant. 
      Your goal is to provide emotional support, active listening, and helpful coping strategies. 
      
      USER CONTEXT:
      - Name: ${profile?.fullName || 'User'}
      - Persona to adopt: ${persona}
      ${bio}
      ${interests}

      CRITICAL SAFETY RULES:
      1. If the user expresses intent to harm themselves or others, you MUST prioritize safety. 
      2. Provide crisis hotline information immediately if danger is detected.
      3. Do not provide medical diagnoses or prescribe medication.
      4. Be empathetic, non-judgmental, and supportive.
      5. Keep responses concise but meaningful.
      6. If you detect a crisis, start your response with [CRISIS_DETECTED] followed by a level (low, medium, high) and a brief reason.`,
    },
  });

  const response = await model;
  return response.text;
};

export const summarizeSession = async (messages: { role: 'user' | 'model', text: string }[]) => {
  const conversation = messages.map(m => `${m.role}: ${m.text}`).join('\n');
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Summarize the following mental health support conversation into a very short, 3-5 word title that captures the main topic or feeling. Return ONLY the title text:

${conversation}`,
  });

  const response = await model;
  return response.text?.trim().replace(/^"|"$/g, '') || "New Session";
};

export const analyzeEmotion = async (text: string) => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the emotion in the following text and return ONLY one word (e.g., Happy, Sad, Anxious, Angry, Neutral, Overwhelmed): "${text}"`,
  });

  const response = await model;
  return response.text?.trim() || "Neutral";
};
