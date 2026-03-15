

## Problems Identified

1. **Voice not working**: The `useVoiceInput` hook uses the Web Speech API (`SpeechRecognition`), which is browser-only and works, but the voice transcript is only sent to Gemini when the user stops listening or clicks submit. There's no real-time streaming of voice to Gemini. Additionally, the edge function uses a direct Gemini API key -- the project should switch to using the **Lovable AI Gateway** (which is already available via `LOVABLE_API_KEY`) for reliability.

2. **Screen share analysis**: The hidden `<video>` element for canvas capture may not be properly rendering frames because `video.videoWidth`/`video.videoHeight` can be 0 if the video hasn't loaded yet. Need to ensure the video element is playing before capturing.

3. **Edge function uses direct Gemini API**: Should migrate to the Lovable AI Gateway which uses the pre-configured `LOVABLE_API_KEY` and supports `google/gemini-2.5-flash` model. This is more reliable and doesn't require a separate API key.

## Plan

### 1. Fix Voice Input Hook
- Add `navigator.mediaDevices.getUserMedia` permission check for microphone
- Send voice transcript to Gemini in real-time as the user speaks (debounced every 3 seconds of new speech)
- Show live transcript updating and auto-analyze when user pauses speaking

### 2. Fix Screen Capture Video Element  
- Ensure the hidden video element waits for `loadedmetadata` event before allowing capture
- Add a `readyToCapture` state so the Analyze button only works when the video is actually playing
- Fix the video ref callback to properly handle stream assignment

### 3. Migrate Edge Function to Lovable AI Gateway
- Replace direct Gemini API calls with the Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`)
- Use the pre-configured `LOVABLE_API_KEY` secret
- Use model `google/gemini-2.5-flash` which supports vision (image) inputs
- Keep the same mode-based system prompts
- Add proper error handling for 429/402 rate limit errors

### 4. Improve Real-time Voice Analysis
- When voice recording stops, automatically send transcript to Gemini voice analysis
- While recording, show a debounced preview that sends partial transcripts every few seconds
- Display the live transcript in the Voice Analysis card

### 5. Improve Screen Share Analysis Flow
- When "Analyze Screen" is clicked, capture frame and send to Gemini vision endpoint
- Show a loading state with the captured frame thumbnail
- Auto-analyze continues to work every 8 seconds

### File Changes

- **`supabase/functions/gemini-analyze/index.ts`** -- Rewrite to use Lovable AI Gateway with `LOVABLE_API_KEY`, support vision via base64 image in messages, handle 429/402 errors
- **`src/hooks/useVoiceInput.ts`** -- Add real-time transcript debounce callback, better error handling, microphone permission check
- **`src/pages/Search.tsx`** -- Fix video ref to wait for metadata, add debounced voice-to-Gemini analysis, improve capture reliability
- **`supabase/config.toml`** -- No changes needed (already configured)

