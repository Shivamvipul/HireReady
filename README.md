# HireRead AI

AI career-prep platform: ATS resume checker, interview prep, a 48-template resume builder and a LinkedIn profile optimizer.
MERN stack (MongoDB Atlas, Express, React 18 + Vite, Node) with the Google Gemini API on the backend only.

## Rules the AI follows
- Never invents jobs, degrees, certifications, skills or metrics. It only rephrases what you provided; missing numbers are flagged, not made up.
- Every AI call goes through `server/services/aiService.js`: strict JSON, validated with zod, one automatic retry, then a friendly error.
- Prompts live in `server/prompts/` (one file per feature). Parsed text is sanitized before it reaches a prompt. The API key never reaches the browser.

## Project layout
```
hireread-ai/
├── client/   React app (pages, components/{ui,layout,charts,ats,interview,builder,linkedin}, templates, store, api)
└── server/   Express API (config, controllers, routes, models, middleware, services, prompts, utils)
```

## 1. MongoDB Atlas setup
1. Create a free cluster at https://cloud.mongodb.com.
2. Database Access: add a database user (username and password).
3. Network Access: add your IP address. For Render/Railway use `0.0.0.0/0` and rely on the strong DB password.
4. Connect, Drivers: copy the connection string and put your user and password in it, with a database name:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/hireread?retryWrites=true&w=majority`

## 2. Environment
```bash
cp server/.env.example server/.env      # fill in the values
cp client/.env.example client/.env      # leave empty for local dev
```
| Variable | Notes |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | Atlas connection string |
| `DNS_SERVERS` | Optional comma-separated DNS server IPs; set this if Node cannot resolve Atlas SRV records through the system resolver |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | two different long random strings, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `GEMINI_API_KEY` | from Google AI Studio |
| `GEMINI_MODEL` | Gemini model id (default: `gemini-3.8-flash`) |
| `CLIENT_URL` | allowed origin(s), comma separated (`http://localhost:5173`) |
| `NODE_ENV` | `development` or `production` |

## 3. Run locally
Requires Node.js 20 or newer for the Gemini SDK.

```bash
npm run install:all
npm run dev:server     # http://localhost:5000
npm run dev:client     # http://localhost:5173 (proxies /api to the server)
```
Puppeteer downloads Chromium on install (needed for PDF export). If you skip it, PDF export returns an error and DOCX still works.

## Features
- **Auth**: register, login, logout, refresh rotation, httpOnly cookies, protected routes, per-user data isolation.
- **ATS checker**: PDF/DOCX/paste parsing, rule-based checks (email, phone, length, bullets, action verbs, tables/images, dates, sections, metrics) merged with the Gemini score (65% AI / 35% rules). Radar and bars, keyword chips, priority accordion, before/after rewrites, history, "Improve in Resume Builder" hand-off.
- **Interview prep**: 4 modules (technical, HR/STAR, project deep-dive, company/role incl. questions to ask), 10 to 15 questions each, bookmarks, practiced progress, search/filter, single-question regenerate, practice mode with scored feedback, PDF export (print dialog).
- **Resume builder**: 48 data-driven templates on 5 base layouts (`client/src/templates/catalog.js`), ATS-safe badges, filters with live thumbnails, drag-reorder entries and sections, show/hide, accent/font/size/spacing, photo upload with crop, AI Improve per field, summary generator, debounced auto-save, multiple versions, duplicate/rename/delete, PDF (Puppeteer, A4, selectable text) and DOCX export, optional public link `/r/:slug`.
- **LinkedIn optimizer**: no scraping. URL is validated and stored; content comes from pasted sections, LinkedIn's "Save to PDF" export, or a saved resume. Score, headline options, About rewrite, checklist, tabs, 30-day plan.

## API
```
POST /api/auth/register|login|logout|refresh    GET /api/auth/me
POST /api/ats/analyze   GET /api/ats/history   GET|DELETE /api/ats/:id
POST /api/interview/generate|evaluate|regenerate   GET /api/interview/history   PATCH /api/interview/:id/bookmark
GET|POST|PUT|DELETE /api/resumes   POST /api/resumes/:id/duplicate|ai-improve   POST /api/resumes/:id/download/(pdf|docx)
GET /api/resumes/public/:slug
POST /api/upload/photo   POST /api/upload/resume-text
POST /api/linkedin/optimize   GET /api/linkedin/history   GET /api/templates   GET /api/dashboard
```
All responses use `{ success, data, message }`. AI endpoints are limited to 20 requests per hour per user. Uploads: 5 MB, PDF/DOCX only (magic bytes are checked).

## Design notes
- `templates/catalog.js` on the client mirrors `server/utils/templateCatalog.js`. If you add a template, change both.
- PDF export: the client sends the rendered resume HTML; the server strips scripts and handlers, disables JavaScript in Chromium and prints A4. The template's footer tag is part of that HTML.
- Photos are cropped to 400x400 in the browser, validated on the server and stored as a data URL inside the resume.
- "Project links" is a template tag: templates tagged without it hide project links on purpose.

## 4. Deploy
**Server (Render or Railway)**
1. New Web Service from this repo, root directory `server`.
2. Build: `npm install`. Start: `npm start`.
3. Set all env vars from the table. Set `NODE_ENV=production` and `CLIENT_URL` to your Vercel URL.
4. Puppeteer needs Chromium: on Render set `PUPPETEER_CACHE_DIR=/opt/render/project/puppeteer` and run `npx puppeteer browsers install chrome` in the build command. On Railway use the Nixpacks default or a Dockerfile based on `ghcr.io/puppeteer/puppeteer`.
5. Cookies use `SameSite=None; Secure` in production, so both sites must be served over HTTPS.

**Client (Vercel)**
1. Import the repo, root directory `client`, framework Vite.
2. Add `VITE_API_URL=https://YOUR-API.onrender.com/api`.
3. `vercel.json` already rewrites all routes to `index.html`.
