"use client";

import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = ["Pricing", "Free trial", "Features"];

function botReply(text) {
  const t = text.toLowerCase();
  if (/\b(hi|hii+|hello|hey|namaste|yo)\b/.test(t))
    return "Hello! I'm Setu, the TeamSetu assistant. Ask me about pricing, features, or starting a free trial.";
  if (/pric|cost|plan|charge|fee/.test(t))
    return "We have 3 plans: Essentials ₹249 and Growth ₹399 per employee/month (billed annually), plus Enterprise on custom pricing. Every plan starts with a free 14-day trial — no credit card needed.";
  if (/trial|free|demo/.test(t))
    return "You get 14 days free on the Growth plan, no credit card required. Tap 'Start free trial' at the top and your workspace is ready in minutes.";
  if (/feature|what.*(do|offer)|capabilit/.test(t))
    return "TeamSetu covers employee records, time-off tracking, onboarding checklists, performance reviews, hiring pipeline, e-signatures, and 50+ ready-made HR reports.";
  if (/leave|time.?off|vacation|holiday/.test(t))
    return "Time-off is fully automated: employees request in one tap, managers approve from web or mobile, balances update themselves, and a team calendar keeps leaves from clashing.";
  if (/onboard/.test(t))
    return "Onboarding runs on autopilot — welcome checklists by role, digital offer letters with e-signature, and tasks auto-assigned to managers and IT. Most teams go from weeks to days.";
  if (/payroll|salary|ctc/.test(t))
    return "TeamSetu prepares payroll-ready reports: attendance, leaves, and reimbursements flow into clean exports your payroll team can use directly.";
  if (/performance|review|appraisal|goal|okr/.test(t))
    return "Performance includes goals & OKRs, 1-on-1 templates, peer feedback, and automated review cycles. Customers report 94%+ review completion in the first cycle.";
  if (/hir|recruit|ats|applicant|job/.test(t))
    return "The hiring module gives you a job pipeline, scorecards, interview scheduling, and digital offer letters — all inside TeamSetu.";
  if (/human|support|contact|sales|call|talk|agent/.test(t))
    return "Our team replies on live chat in under 2 hours on business days, and Growth plans get a dedicated success manager. Or just keep chatting with me!";
  if (/sign.?up|start|register|account|join/.test(t))
    return "Starting is easy: click 'Start free trial' at the top, enter your work email and company name, and you're in. It takes about 2 minutes.";
  if (/thank|shukriya/.test(t))
    return "You're most welcome! Anything else about TeamSetu I can help with?";
  if (/\b(bye|goodbye|see you)\b/.test(t))
    return "Goodbye! I'll be right here whenever you need HR help.";
  return "I can help with pricing, features, the free trial, time-off, onboarding, payroll, or getting started. What would you like to know?";
}

function getRecognizer() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const bodyRef = useRef(null);
  const recogRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => {
    return () => { try { recogRef.current && recogRef.current.abort(); } catch {} };
  }, []);

  const expand = () => {
    setOpen(true);
    if (!greeted) {
      setGreeted(true);
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages([{ from: "bot", text: "Hi there! I'm Setu — ask me anything about TeamSetu, or tap the mic and just speak." }]);
      }, 700);
    }
  };

  const minimise = () => setOpen(false);

  const send = (raw) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: botReply(text) }]);
    }, 800);
  };

  const speakNow = () => {
    const SR = getRecognizer();
    if (!SR) {
      setMessages((m) => [...m, { from: "bot", text: "Voice input isn't supported in this browser — please type your message instead." }]);
      return;
    }
    if (listening) { try { recogRef.current.stop(); } catch {} return; }
    const recog = new SR();
    recogRef.current = recog;
    recog.lang = "en-IN";
    recog.interimResults = true;
    recog.onresult = (e) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else setInput(e.results[i][0].transcript);
      }
      if (final) { setInput(""); send(final); }
    };
    recog.onend = () => setListening(false);
    recog.onerror = () => setListening(false);
    try { recog.start(); setListening(true); } catch { setListening(false); }
  };

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={expand} aria-label="Chat with us">
          💬
        </button>
      )}
      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <span className="avatar" style={{ background: "#fff", color: "#047857", width: 34, height: 34 }}>S</span>
            <div style={{ flex: 1 }}>
              <b>Setu</b>
              <small>TeamSetu Assistant · online</small>
            </div>
            <button className="chat-icon-btn" onClick={minimise} aria-label="Minimise chat" title="Minimise">—</button>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>{m.text}</div>
            ))}
            {typing && <div className="chat-msg bot"><span className="chat-dots"><i /><i /><i /></span></div>}
            {!typing && messages.length <= 1 && (
              <div className="chat-suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <button
              className={`chat-mic ${listening ? "live" : ""}`}
              onClick={speakNow}
              aria-label="Speak now"
              title={listening ? "Listening… tap to stop" : "Speak now"}
            >
              {listening ? "🔴" : "🎤"}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={listening ? "Listening… speak now" : "Ask about TeamSetu…"}
            />
            <button className="chat-send" onClick={() => send()} aria-label="Send">➤</button>
          </div>
          {listening && <div className="chat-listening">Listening… speak now, tap the mic to stop</div>}
        </div>
      )}
    </>
  );
}
