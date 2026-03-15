

## Current State

Your app **already uses the Gemini API** (via `google/gemini-2.5-flash` model) for all analysis modes -- voice, vision/screen share, search, correction, and debugging. The edge function `gemini-analyze` routes through the Lovable AI Gateway which calls Gemini. So the core Gemini integration is done.

However, there are improvements needed to make it feel truly "real-time" and to render AI responses properly. Here is the plan:

---

## Plan

### 1. Add markdown rendering to AnalysisCard
Currently results display as raw text with `whitespace-pre-wrap`. Code blocks, headers, and lists from Gemini responses look ugly. Install `react-markdown` and `remark-gfm`, update `AnalysisCard.tsx` to render markdown properly with syntax highlighting.

### 2. Improve voice real-time flow
The voice hook works but the Web Speech API transcript is only sent to Gemini after a 3-second debounce. Reduce this to 2 seconds and ensure the transcript is also sent immediately when the user stops speaking (on `recognition.onend`). This makes the voice interaction feel more responsive and interruptible.

### 3. Add markdown rendering to results
Update `AnalysisCard.tsx` to use `ReactMarkdown` with `remark-gfm` so code blocks, bullet points, and headers render correctly in all analysis cards.

### File Changes
- **Install** `react-markdown` and `remark-gfm` packages
- **`src/components/AnalysisCard.tsx`** -- Replace raw text rendering with `<ReactMarkdown>` component
- **`src/hooks/useVoiceInput.ts`** -- Send transcript on `recognition.onend` event, reduce debounce

---

## Answers to Your Hackathon Questions

### "Gemini API is used everywhere"
**It already is.** Your edge function uses `google/gemini-2.5-flash` (a Gemini model) for voice analysis, screen share vision analysis, code correction, debugging, and general search. Every analysis card is powered by Gemini.

### "How to host on Google Cloud"
Steps to deploy on Google Cloud Run:
1. Run `npm run build` locally to get the `dist/` folder
2. Create a `Dockerfile`:
   ```text
   FROM nginx:alpine
   COPY dist/ /usr/share/nginx/html
   EXPOSE 8080
   ```
3. Install Google Cloud CLI: `gcloud auth login`
4. Deploy: `gcloud run deploy colla --source . --region us-central1 --allow-unauthenticated`
5. You get a URL like `https://colla-xxxxx.run.app`

Your backend functions stay on Lovable Cloud -- only the frontend static files go to Google Cloud Run.

### "What are Google Cloud credits?"
Google Cloud charges money to run services (servers, storage, networking). **Credits** are free money Google gives you to use their services. For hackathons, Google often provides $300 in free trial credits when you create a new Google Cloud account. The hackathon may have also offered a form to get additional credits via a spreadsheet.

### "We didn't get credits from the form. Can we continue?"
**Yes, absolutely.** Every new Google Cloud account gets **$300 free trial credits** (valid for 90 days). This is more than enough to host a small app on Cloud Run for the hackathon. Cloud Run's free tier gives you 2 million requests/month for free. Your demo will cost essentially $0.

Steps:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new account if you don't have one
3. You automatically get $300 free trial credits
4. Deploy using the Cloud Run steps above

### "Does hosting backend on Google Cloud require credits?"
For this hackathon, your backend (edge functions calling Gemini) is already hosted. You only need Google Cloud for the **frontend static files**. Cloud Run has a generous free tier -- you won't be charged for a demo-level app. The $300 free trial covers everything.

