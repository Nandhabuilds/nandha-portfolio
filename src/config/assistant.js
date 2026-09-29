// Matches the Cloudflare Worker in Nandha-ai-assistant (src/index.js):
//   POST {WORKER}            body {history, sessionId} -> {reply}
//   GET  {WORKER}/history    ?sessionId=...            -> {history}
//   POST {WORKER}/speak      body {text}               -> audio/mpeg (ElevenLabs)
export const ASSISTANT = {
  workerUrl: (import.meta.env.VITE_ASSISTANT_URL || 'https://nandha-ai-assistant.nandhabuilds.workers.dev').replace(/\/$/, ''),
  name: 'Elina',
  greeting: "Hey! I'm Elina, Nandha's AI assistant. Ask me anything about his background, projects, or skills.",
  suggestions: ['What does Nandha do at TCS?', 'Which certifications does he hold?', "Tell me about his GitOps lab"],
  speakByDefault: true, // ElevenLabs free tier has a monthly character cap: set false to save it
  sessionKey: 'nandha_chat_session',
};
