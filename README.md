# 🤖 COLLA — AI-Powered Developer Search Engine

> **Live Demo:** [https://colla-524919266044.europe-west1.run.app/](https://colla-524919266044.europe-west1.run.app/)

---

## 📖 Introduction

**COLLA** is an AI-powered real-time developer search engine and pair programming assistant. It combines **Google Gemini API** vision and language capabilities with a modern React interface to let developers search, analyze, debug, and fix code — all in real-time using screen sharing, voice input, and conversational AI chat.

---

## ❓ The Problem

Developers constantly context-switch between their IDE, documentation, Stack Overflow, and AI chatbots. Existing tools can't:

- **See what you're working on** — you have to copy-paste code into a chat window
- **Listen to you describe the problem** — voice-driven coding help barely exists
- **Analyze your screen in real-time** — no tool watches your IDE and proactively finds bugs
- **Combine all modalities** — text, voice, vision, and chat are fragmented across different products

---

## 💡 The Solution

COLLA solves this by bringing **AI directly into the developer's workflow** through three modalities:

| Modality | How It Works |
|----------|-------------|
| 🖥️ **Screen Share + Vision** | Share your screen → Gemini analyzes your IDE/code in real-time every 7 seconds |
| 🎤 **Voice Input** | Speak your question → transcribed and analyzed with Gemini |
| 💬 **AI Chat** | Conversational pair programming with full context of your screen |

---

## ✨ Features

- **🔍 AI Search Engine** — Ask anything about your code and get multi-panel analysis (assistant, debugger, code correction, voice, vision)
- **🖥️ Real-Time Screen Analysis** — Share your screen and Gemini analyzes visible code every 7 seconds with bug detection, quality scoring, and fix suggestions
- **🎤 Voice-to-Code Analysis** — Speak naturally about your problem; your voice is transcribed and analyzed in real-time
- **💬 Conversational AI Chat** — Chat with Gemini as a pair programmer that can see your screen
- **📊 Live Analysis Feed** — Streaming feed of analysis entries with timestamps
- **📋 Smart Session Summary** — Gemini summarizes your entire analysis session
- **🔐 Authentication** — Secure login/signup with email verification
- **🌗 Dark Theme** — Designed-first dark UI with custom design system

---

## 🧠 What We Use Gemini API For

We use **Google Gemini 2.5 Flash** (via the Lovable AI Gateway) for **all AI capabilities** in COLLA. Here's exactly how:

### 1. Vision Analysis (Screen Share)
When a user shares their screen, we capture frames from the screen share stream as base64 PNG images and send them to Gemini's multimodal endpoint:

```typescript
// From src/hooks/useLiveAnalysis.ts — Frame capture + Gemini vision
const captureRef = useRef<(() => string | null) | null>(null);

const analyzeFrame = useCallback(async () => {
  const frame = captureRef.current(); // captures screen as base64 PNG
  const { data } = await client.functions.invoke("gemini-analyze", {
    body: {
      mode: "vision",
      messages: [{ role: "user", content: "Analyze the code on screen..." }],
      imageBase64: frame, // base64 PNG sent to Gemini
    },
  });
}, []);

// Runs every 7 seconds during live analysis
const start = useCallback((intervalMs = 7000) => {
  intervalRef.current = setInterval(analyzeFrame, intervalMs);
}, [analyzeFrame]);
```

### 2. Multi-Mode Analysis Engine
Our Edge Function routes requests to Gemini with **7 different system prompts** depending on the mode:

```typescript
// From supabase/functions/gemini-analyze/index.ts
const SYSTEM_PROMPTS = {
  voice: "You are a real-time voice code analyst...",
  vision: "You are a real-time screen share code analyst...",
  correction: "You are a code correction specialist...",
  assistant: "You are an expert code assistant...",
  debug: "You are a real-time code debugger...",
  chat: "You are COLLA, an AI pair programming assistant...",
  summary: "You are a code review summarizer...",
};

// Request to Gemini 2.5 Flash
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: apiMessages, // includes system prompt + user messages + images
    temperature: 0.7,
    max_tokens: 4096,
  }),
});
```

### 3. Conversational Chat with Screen Context
The chat component maintains full conversation history and attaches screen captures:

```typescript
// From src/components/GeminiChat.tsx
const apiMessages = newMessages.map((m) => ({
  role: m.role,
  content: m.content,
}));

let imageBase64: string | undefined;
if (isSharing) {
  const frame = captureFrame(); // attach current screen to message
  if (frame) imageBase64 = frame;
}

const { data } = await client.functions.invoke("gemini-analyze", {
  body: { mode: "chat", messages: apiMessages, imageBase64 },
});
```

### 4. Voice-Driven Analysis
Voice transcripts are sent to Gemini with optional screen context:

```typescript
// From src/pages/LiveAnalysis.tsx
const handleVoiceTranscript = useCallback((transcript: string) => {
  if (isSharing && readyToCapture) {
    const frame = captureFrame();
    analyze("vision", `Developer voice query: "${transcript}". Analyze the screen.`, frame);
  } else {
    analyze("voice", `Voice query: ${transcript}`);
  }
}, [isSharing, readyToCapture, analyze]);
```

### 5. Session Summary
All analysis entries from a session are compiled and sent to Gemini for a comprehensive summary:

```typescript
// From src/pages/LiveAnalysis.tsx
const combinedEntries = entries
  .map((e, i) => `--- Entry ${i + 1} ---\n${e.result}`)
  .join("\n\n");

const { data } = await client.functions.invoke("gemini-analyze", {
  body: {
    mode: "summary",
    messages: [{ role: "user", content: `Summarize this session:\n\n${combinedEntries}` }],
  },
});
```

---

## ☁️ What We Use Google Cloud For

### Google Cloud Run — Serverless Container Hosting

COLLA's frontend is deployed as a **Docker container on Google Cloud Run** in the `europe-west1` region.

**Why Cloud Run?**
- **Serverless auto-scaling** — scales to zero when not in use, scales up on demand
- **Container-based** — full control over the runtime environment
- **HTTPS by default** — automatic SSL certificates
- **Cost-efficient** — pay only for actual request processing time

### How We Deploy

```dockerfile
# Multi-stage Docker build (from our Dockerfile)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
ARG VITE_SUPABASE_URL=https://xdotllyuqpqqcgfgqkeb.supabase.co
ARG VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIs...
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
RUN npm run build

# Serve with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

**Deployment commands:**
```bash
docker build -t gcr.io/PROJECT_ID/colla .
docker push gcr.io/PROJECT_ID/colla
gcloud run deploy colla --image gcr.io/PROJECT_ID/colla --region europe-west1 --port 8080
```

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Screen   │  │  Voice   │  │  Text    │  │  Chat         │  │
│  │  Share    │  │  Input   │  │  Search  │  │  Interface    │  │
│  │  (WebRTC) │  │  (Web    │  │          │  │               │  │
│  │          │  │  Speech  │  │          │  │               │  │
│  │          │  │  API)    │  │          │  │               │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       │              │             │               │            │
│       ▼              ▼             ▼               ▼            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Frontend (TypeScript + Vite)          │   │
│  │                                                          │   │
│  │  Hooks: useScreenShare │ useVoiceInput │ useGeminiAnalysis│  │
│  │         useLiveAnalysis │ GeminiChat component           │   │
│  │                                                          │   │
│  │  UI: Tailwind CSS │ Framer Motion │ shadcn/ui │ Three.js │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTPS (Supabase SDK)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Edge Functions)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           gemini-analyze Edge Function                    │   │
│  │                                                          │   │
│  │  • Receives: mode, messages[], imageBase64               │   │
│  │  • Selects system prompt based on mode                   │   │
│  │  • Constructs multimodal API messages                    │   │
│  │  • Handles rate limiting (429) and quota (402)           │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────┼───────────────────────────────┐   │
│  │     Supabase Auth        │      Supabase DB              │   │
│  │  (Login/Signup/Session)  │   (Future: saved sessions)    │   │
│  └──────────────────────────┼───────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GOOGLE GEMINI API                              │
│              (via AI Gateway Proxy)                              │
│                                                                 │
│  Model: google/gemini-2.5-flash                                 │
│                                                                 │
│  Capabilities Used:                                             │
│  ├── Text Analysis (code explanation, debugging, correction)    │
│  ├── Vision Analysis (screen captures as base64 PNG)            │
│  ├── Multi-turn Chat (full conversation history)                │
│  └── Summarization (session-wide analysis summary)              │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GOOGLE CLOUD RUN                              │
│              (Frontend Hosting)                                 │
│                                                                 │
│  • Region: europe-west1                                         │
│  • Runtime: Docker (Node 20 build → Nginx serve)               │
│  • Port: 8080                                                   │
│  • Auto-scaling: 0 → N instances                               │
│  • URL: colla-524919266044.europe-west1.run.app                │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action                    What Happens
──────────                     ──────────────────────────────────────

1. Share Screen         →  Browser WebRTC getDisplayMedia() captures screen
                        →  Video stream rendered in <video> element
                        →  Canvas captures frames as base64 PNG every 7s

2. Frame Captured       →  base64 image + system prompt sent to Edge Function
                        →  Edge Function builds multimodal message array
                        →  POST to Gemini 2.5 Flash with image_url content
                        →  Response streamed back → rendered as Markdown

3. Voice Input          →  Web Speech API transcribes speech in real-time
                        →  Debounced (2s) transcript sent to Gemini
                        →  If screen sharing: image attached to voice query

4. Text Search          →  Query sent to 5 parallel Gemini analysis modes
                        →  Results rendered in separate cards simultaneously

5. Chat Message         →  Full conversation history + optional screen frame
                        →  Sent to Gemini with "chat" system prompt
                        →  Response appended to chat with Markdown rendering

6. Session Summary      →  All analysis entries concatenated
                        →  Sent to Gemini with "summary" system prompt
                        →  Comprehensive session report generated
```

---

## 📁 Project Structure

```
colla/
├── public/                          # Static assets
├── src/
│   ├── assets/                      # Images (mockups, screenshots)
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components (button, card, etc.)
│   │   ├── AnalysisCard.tsx         # Renders individual AI analysis results
│   │   ├── GeminiChat.tsx           # Conversational AI chat with Gemini
│   │   ├── HeroSection.tsx          # Landing page hero
│   │   ├── HeroSphere.tsx           # Three.js 3D animated sphere
│   │   ├── LiveAnalysisFeed.tsx     # Real-time analysis entry feed
│   │   ├── Navbar.tsx               # Navigation bar
│   │   ├── ProductShowcase.tsx      # Feature showcase section
│   │   ├── ProtectedRoute.tsx       # Auth-gated route wrapper
│   │   └── ScreenSharePreview.tsx   # Screen share video preview
│   ├── contexts/
│   │   └── AuthContext.tsx          # Authentication state management
│   ├── hooks/
│   │   ├── useGeminiAnalysis.ts     # Multi-mode Gemini API integration
│   │   ├── useLiveAnalysis.ts       # Live screen analysis loop (7s interval)
│   │   ├── useScreenShare.ts        # WebRTC screen capture
│   │   └── useVoiceInput.ts         # Web Speech API voice transcription
│   ├── pages/
│   │   ├── Index.tsx                # Landing page
│   │   ├── Search.tsx               # AI search engine page
│   │   ├── LiveAnalysis.tsx         # Real-time analysis dashboard
│   │   ├── Login.tsx                # Login page
│   │   └── Signup.tsx               # Signup page
│   ├── App.tsx                      # Route definitions
│   └── main.tsx                     # Entry point
├── supabase/
│   └── functions/
│       └── gemini-analyze/
│           └── index.ts             # Edge Function: Gemini API orchestrator
├── Dockerfile                       # Multi-stage Docker build for Cloud Run
├── nginx.conf                       # Nginx SPA routing config
└── package.json
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI framework |
| **Build** | Vite 5 | Fast bundling and HMR |
| **Styling** | Tailwind CSS + shadcn/ui | Design system and components |
| **Animation** | Framer Motion | Page transitions and micro-interactions |
| **3D** | Three.js (via HeroSphere) | Landing page 3D animated sphere |
| **Markdown** | react-markdown + remark-gfm | Rendering AI responses |
| **State** | Zustand + React Context | Auth and app state |
| **AI Model** | Google Gemini 2.5 Flash | All AI analysis (text + vision) |
| **Backend** | Supabase Edge Functions (Deno) | API orchestration and auth |
| **Auth** | Supabase Auth | Email/password authentication |
| **Hosting** | Google Cloud Run | Serverless container deployment |
| **Container** | Docker + Nginx | Production build and serving |

---

## 🚀 How We Built It

1. **Designed the UX** — Built a dark-themed, minimal UI inspired by developer tools. Used a custom design system with HSL tokens in Tailwind.

2. **Implemented Screen Capture** — Used the WebRTC `getDisplayMedia()` API to capture the user's screen, rendered in a `<video>` element, with a hidden `<canvas>` to extract frames as base64 PNG.

3. **Built the Gemini Integration** — Created a single Edge Function (`gemini-analyze`) that handles 7 analysis modes with different system prompts. The function constructs OpenAI-compatible multimodal messages with text and image content.

4. **Added Voice Input** — Integrated the Web Speech API for real-time voice transcription with a 2-second debounce, automatically sending transcripts to Gemini.

5. **Created the Live Analysis Loop** — Built a `useLiveAnalysis` hook that captures and analyzes screen frames every 7 seconds, creating a streaming feed of analysis entries.

6. **Deployed to Cloud Run** — Containerized the app with a multi-stage Docker build (Node.js build → Nginx serve) and deployed to Google Cloud Run for serverless hosting.

---

## 👥 Team

Built for the **Google AI Hackathon** with ❤️

---

## 📄 License

MIT
