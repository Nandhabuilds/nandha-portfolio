import { useEffect, useRef, useState } from 'react';
import { ASSISTANT } from '../config/assistant';

const newId = () => crypto.randomUUID();

const getSessionId = () => {
  try {
    let id = localStorage.getItem(ASSISTANT.sessionKey);
    if (!id) {
      id = newId();
      localStorage.setItem(ASSISTANT.sessionKey, id);
    }
    return id;
  } catch {
    return newId();
  }
};

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  // `history` is exactly what the Worker expects: [{role, content}] (no greeting)
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [speak, setSpeak] = useState(ASSISTANT.speakByDefault);
  const [talking, setTalking] = useState(false);
  const [listening, setListening] = useState(false);
  const sessionId = useRef(getSessionId());
  const listRef = useRef(null);
  const audioRef = useRef(null);
  const recRef = useRef(null);

  const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, busy, open]);

  // Restore the visitor's earlier conversation from the Worker's KV
  useEffect(() => {
    fetch(`${ASSISTANT.workerUrl}/history?sessionId=${sessionId.current}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.history) && data.history.length) setHistory(data.history);
      })
      .catch(() => {});
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setTalking(false);
  };

  // Not awaited by the chat flow; a new message always cuts off the old clip
  const say = (text) => {
    stopAudio();
    setTalking(true);
    fetch(`${ASSISTANT.workerUrl}/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        const done = () => {
          if (audioRef.current === audio) audioRef.current = null;
          setTalking(false);
          URL.revokeObjectURL(url);
        };
        audio.onended = done;
        audio.onerror = done;
        audio.play().catch(done);
      })
      .catch(() => setTalking(false));
  };

  const send = async (text) => {
    const message = text.trim();
    if (!message || busy) return;
    stopAudio();
    setInput('');
    const next = [...history, { role: 'user', content: message }];
    setHistory(next);
    setBusy(true);
    try {
      const res = await fetch(ASSISTANT.workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: next, sessionId: sessionId.current }),
      });
      const data = await res.json();
      const reply = data.reply || 'Sorry, something went wrong.';
      setHistory([...next, { role: 'assistant', content: reply }]);
      if (speak) say(reply);
    } catch {
      setHistory([...next, { role: 'assistant', content: "Couldn't reach the assistant right now." }]);
    } finally {
      setBusy(false);
    }
  };

  // The Worker caps a conversation at 20 messages, and history is restored by session,
  // so a fresh session is the only way to start over.
  const newChat = () => {
    stopAudio();
    const id = newId();
    try { localStorage.setItem(ASSISTANT.sessionKey, id); } catch { /* ignore */ }
    sessionId.current = id;
    setHistory([]);
  };

  const toggleMic = () => {
    if (!SpeechRec) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SpeechRec();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.onresult = (e) => send(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const shown = [{ role: 'assistant', content: ASSISTANT.greeting }, ...history];

  return (
    <div className="fixed bottom-5 right-5 z-[9990] flex flex-col items-end gap-3 select-none">
      {open && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[380px] h-[540px] max-h-[75vh] flex flex-col rounded-2xl bg-[#141414]/95 backdrop-blur-2xl border border-red-600/40 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(229,9,20,0.2)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-2.5">
              <div>
                <div className="text-sm font-black tracking-tight text-white">Chat with {ASSISTANT.name}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-red-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" /> {talking ? 'speaking' : 'online'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setSpeak((s) => !s); stopAudio(); }} title={speak ? 'Voice replies on' : 'Voice replies off'} className={`h-8 px-2 rounded text-[10px] font-mono border transition-colors ${speak ? 'border-red-600 text-red-500 bg-red-600/10' : 'border-white/15 text-white/50 hover:text-white'}`}>
                {speak ? 'VOICE ON' : 'VOICE OFF'}
              </button>
              <button onClick={newChat} title="Start a new conversation" className="h-8 px-2 rounded text-[10px] font-mono border border-white/15 text-white/60 hover:text-white">
                NEW
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close" className="w-8 h-8 rounded border border-white/15 text-white/60 hover:text-white">&times;</button>
            </div>
          </div>

          <div ref={listRef} onWheel={(e) => e.stopPropagation()} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {shown.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-red-600 text-white rounded-br-sm' : 'bg-white/[0.06] border border-white/10 text-white/85 rounded-bl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/10 text-red-500 text-sm font-mono animate-pulse">Thinking...</div>
              </div>
            )}
            {history.length === 0 && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {ASSISTANT.suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-xs font-mono text-white/70 border border-white/15 rounded-full px-3 py-1.5 hover:border-red-600 hover:text-red-400 transition-colors text-left">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10 flex items-center gap-2">
            {SpeechRec && (
              <button onClick={toggleMic} aria-label="Speak your message" className={`w-10 h-10 shrink-0 rounded-lg border flex items-center justify-center transition-colors ${listening ? 'border-red-600 bg-red-600/20 text-red-500 animate-pulse' : 'border-white/15 text-white/60 hover:text-white'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v4" /></svg>
              </button>
            )}
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(input)} placeholder="Type a message..." className="flex-1 min-w-0 bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/35 focus:outline-none focus:border-red-600" />
            <button onClick={() => send(input)} disabled={busy || !input.trim()} className="h-10 px-4 shrink-0 rounded-lg bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-40 transition-colors">Send</button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} aria-label="Chat with Elina, Nandha's AI assistant" className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.6)] hover:scale-110 active:scale-95 transition-transform">
        {open ? <span className="text-2xl leading-none text-white">&times;</span> : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12a8 8 0 01-11.6 7.1L3 21l1.9-5.4A8 8 0 1121 12z" /></svg>
        )}
      </button>
    </div>
  );
};

export default AIAssistant;
