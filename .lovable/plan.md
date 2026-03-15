

## Your Idea is Strong

Your concept -- a live AI agent that watches a developer's screen in real-time, continuously analyzing code, spotting bugs, and suggesting fixes -- is exactly what the "Live Agents" track is about. The real-time vision + voice combo is compelling. Whether you win depends on execution polish, but the idea is solid and differentiated.

## Plan

Three major pieces of work:

### 1. Authentication (Login / Signup)

- Create `/login` and `/signup` pages with email/password auth
- Add an auth context provider to manage session state
- Protect the `/search` route so only logged-in users can access it
- Add logout button to the search page navbar
- No user profiles table needed -- just basic auth

### 2. Live Analysis Dashboard (New `/live` page)

A dedicated real-time analysis screen with a split layout:

```text
+---------------------------+---------------------------+
|                           |   Live Analysis Feed      |
|   Screen Share Preview    |   (scrolling, streaming)  |
|   (large, left side)      |                           |
|                           |   - Code explanation      |
|                           |   - Bug detection         |
|                           |   - Fix suggestions       |
|                           |   - Quality rating        |
+---------------------------+---------------------------+
```

- Left panel: large screen share preview
- Right panel: streaming AI analysis that updates every 5-8 seconds as new frames are captured
- Analysis results append as a timeline/feed (newest at top), so you see the AI "thinking" in real-time
- Each entry shows: timestamp, what changed, bugs found, suggested fixes
- Use the existing `gemini-analyze` edge function with `vision` mode
- Add markdown rendering (react-markdown) to analysis cards for proper code block formatting

### 3. Harden the Gemini Analysis Pipeline

- Add markdown rendering to `AnalysisCard` so code blocks, headings, and lists render properly
- Add error toasts for 429 (rate limit) and 402 (credits) responses
- Test the vision capture pipeline: ensure frames are valid before sending
- Add a "connection status" indicator showing whether the backend is reachable

### Technical Details

**Auth implementation:**
- Use Lovable Cloud auth (`supabase.auth.signUp`, `supabase.auth.signInWithPassword`)
- `AuthProvider` context wrapping the app with `onAuthStateChange` listener
- Protected route wrapper component
- No auto-confirm on signup (users verify email)

**Live analysis page:**
- New route `/live` with dedicated `LiveAnalysis.tsx` page
- Reuses `useScreenShare` hook
- New `useLiveAnalysis` hook that runs a capture-analyze loop on an interval (configurable 5-10s)
- Each analysis result is appended to an array and rendered as a feed
- Streaming responses via the edge function for real-time token rendering
- Install `react-markdown` + `remark-gfm` for rendering

**Edge function updates:**
- No changes needed to `gemini-analyze` -- it already supports vision mode
- May add a `live` system prompt variant optimized for continuous analysis (shorter, diff-focused)

### File Changes Summary

| File | Action |
|------|--------|
| `src/pages/Login.tsx` | Create |
| `src/pages/Signup.tsx` | Create |
| `src/contexts/AuthContext.tsx` | Create |
| `src/components/ProtectedRoute.tsx` | Create |
| `src/pages/LiveAnalysis.tsx` | Create |
| `src/hooks/useLiveAnalysis.ts` | Create |
| `src/components/LiveAnalysisFeed.tsx` | Create |
| `src/components/AnalysisCard.tsx` | Update (add markdown rendering) |
| `src/App.tsx` | Update (add routes, auth provider) |
| `src/pages/Search.tsx` | Update (navbar auth state) |
| `package.json` | Add `react-markdown`, `remark-gfm` |

