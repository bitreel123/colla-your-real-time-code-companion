

## Problem

Your Cloud Run deployment shows a blank page because the app tries to initialize the Supabase client at startup using environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) that don't exist in the Cloud Run build environment. When these are undefined, `createClient(undefined, undefined)` throws an error that crashes the entire React app.

## Solution

Two changes are needed:

### 1. Pass Supabase env vars at Docker build time

Update the `Dockerfile` to accept build arguments and inject them as environment variables during the Vite build step. Since Vite inlines `import.meta.env` values at build time, they must be present when `npm run build` runs.

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
RUN npm run build
...
```

Then in your Google Cloud Build / Cloud Run config, pass these as build args:
- `VITE_SUPABASE_URL` = `https://xdotllyuqpqqcgfgqkeb.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = the anon key

### 2. Add a safety guard to the Supabase client (defense in depth)

Wrap the Supabase client creation so it doesn't crash the app if the env vars are missing. This way the landing page and other non-Supabase pages still render even without backend connectivity.

In a wrapper around the client initialization, check if the URL and key exist before calling `createClient`, and export `null` if they're missing. Then guard any usage of `supabase` in hooks like `useGeminiAnalysis`.

**However**, since `src/integrations/supabase/client.ts` is auto-generated and must not be edited, the safer approach is:
- Create a utility wrapper (e.g., `src/lib/supabase-safe.ts`) that re-exports the client with a try/catch
- Update `useGeminiAnalysis` and any other hooks to use the safe wrapper

### Summary of changes

1. **`Dockerfile`** -- Add `ARG` and `ENV` lines for the two Vite variables before `RUN npm run build`
2. **`src/lib/supabase-safe.ts`** (new) -- Safe wrapper that catches initialization errors
3. **`src/hooks/useGeminiAnalysis.ts`** -- Use safe import, gracefully handle missing client
4. **Google Cloud Run config** -- Set the two build-time variables in your Cloud Build trigger or `cloudbuild.yaml`

This will fix the blank screen on Cloud Run and let the app render properly.

