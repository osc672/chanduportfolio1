# Sai Chandu Portfolio — Vercel + SMTP

Responsive portfolio site with an Express/Nodemailer contact form. Static website files live in `public/`, where Vercel serves them from its CDN. The Express app exports `app` for Vercel and starts a local server when run directly.

## Project structure

- `public/index.html` — portfolio homepage
- `public/style.css` — responsive styling
- `public/script.js` — interactions and contact form request
- `server.js` — Express API and SMTP email handling
- `.env.example` — SMTP variable template; safe to commit
- `.env` — your real secrets; do not commit

## Run locally (Windows PowerShell)

1. Install Node.js 20 or newer.
2. Open a terminal in this project folder.
3. Install packages:
   ```powershell
   npm install
   ```
4. Create your local environment file:
   ```powershell
   Copy-Item .env.example .env
   ```
5. Edit `.env` with your own SMTP values. For Gmail, use a Google App Password, not your normal account password.
6. Start the app:
   ```powershell
   npm start
   ```
7. Open http://localhost:3000

## Deploy to Vercel

1. Upload/push this project to the Git repository connected to your Vercel project.
2. In Vercel → Project → Settings → Environment Variables, add these variables for Production (and Preview if needed): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO`.
3. Set `SMTP_PASS` to a newly generated app password if the old one was ever exposed. Never paste secrets into source files or commit `.env`.
4. Redeploy the latest commit. Vercel should detect the Express app from root `server.js`; no `api/index.js` rewrite is required for this configuration.
5. Visit the deployment URL. The homepage should be `/`, CSS and JS should be served from `/style.css` and `/script.js`, and the form posts to `/api/contact`.

## Troubleshooting

- `Cannot GET /`: make sure `public/index.html` exists at the project root's `public/` folder and the latest commit is deployed.
- Form returns 503: verify all five SMTP environment variables are configured in Vercel and redeploy after changing them.
- Form returns 502: inspect Vercel Runtime Logs for SMTP/auth/network errors.
- If `public/index.html` references CSS/JS, use root paths `/style.css` and `/script.js`.

Keep `.env` private. If credentials were exposed in a screenshot or message, revoke the old app password and create a new one.
"# chanduportfolio1" 
