# Altec Website

A rebuild of [altec-al.com](https://www.altec-al.com/) — a self-managed CMS for an Albanian AC sales/installation and reconstruction company, built to run entirely on shared cPanel hosting.

## Stack

- **Public site**: plain PHP, server-rendered per request (no build step, no JS framework) — `public_html/*.php`
- **Admin CMS**: React + TypeScript, built with [Vite](https://vite.dev) into static files served at `/admin/` — source in `admin-app/`
- **API**: PHP REST endpoints under `/api/*`, used by the admin panel — `public_html/api/`
- **Database**: MySQL, accessed via PDO — no ORM

No Node.js process runs on the server. Node is only used locally to build the admin panel (`admin-app/`) into static files before deploying.

> This stack replaced an earlier Next.js/Node.js/Prisma version after confirming the target GoDaddy shared cPanel hosting has no Node.js application support (PHP/Python/Ruby only). See `docs/Altec-Architecture-Proposal.pdf` for the full architecture writeup.

## Project layout

```
public_html/          Web root — deploy this directory's contents to cPanel
  *.php                Public site pages
  api/                 REST API (front controller + resource handlers)
  admin/               Built admin SPA (generated — see "Admin panel" below, not committed)
  includes/            Shared PHP (db, auth, settings/menu helpers, header/footer)
admin-app/             React admin panel source (Vite + TypeScript)
config.php             DB credentials (gitignored — not committed)
config.example.php     Template for config.php
schema.sql             Full MySQL schema (for setting up a fresh database)
seed.php               Seeds languages, admin user, default settings/menu/pages
router.php             Dev-only router mirroring public_html/.htaccess for `php -S`
docs/                  Architecture proposal PDF
```

## Local development

Full walkthrough (prerequisites, first-time setup, day-to-day workflow, rebuilding the admin panel, troubleshooting) is in **[RUN_LOCALLY.md](RUN_LOCALLY.md)**. Quick version:

1. Create `config.php` from `config.example.php` with your local MySQL credentials.
2. Set up the database: import `schema.sql`, then run `ADMIN_EMAIL=you@example.com ADMIN_SEED_PASSWORD=yourpassword php seed.php` (skip this if your database already has data).
3. Start the PHP server:
   ```bash
   php -S localhost:8000 -t public_html router.php
   ```
   (`router.php` replicates `public_html/.htaccess`'s rewrite rules, since PHP's built-in server doesn't read `.htaccess`.)
4. Visit `http://localhost:8000` for the public site.

## Admin panel

The admin panel is a separate React app that needs to be built and copied into `public_html/admin/` before it's usable:

```bash
cd admin-app
npm install
npm run build
cp -r dist ../public_html/admin
```

For active admin UI development, `npm run dev` inside `admin-app/` runs a hot-reloading Vite dev server (proxying `/api` requests to the PHP server on `:8000`, configured in `admin-app/vite.config.ts`) — faster than rebuilding on every change.

Visit `http://localhost:8000/admin` (or the Vite dev server's own URL while developing) and log in.

### Admin login

- **URL**: `/admin`
- **Email**: `klipo@alles.al`
- **Password**: set via `ADMIN_SEED_PASSWORD` when `seed.php` was run (ask whoever ran the seed if you don't have it — it is not stored anywhere in this repo)

### Security — current state

What's in place:
- Passwords hashed with bcrypt (`password_hash`/`password_verify`), never stored or logged in plain text
- Admin sessions are PHP-native, `httpOnly` + `SameSite=Lax` cookies (not readable by JS, reduces CSRF exposure from cross-site requests)
- All database queries use PDO prepared statements (no SQL injection via string concatenation)
- All output is escaped (`htmlspecialchars` in PHP templates, React's default JSX escaping in the admin panel) — no unescaped user input rendered as HTML
- `config.php` (DB credentials) lives outside `public_html/`, so it is not web-accessible when deployed with `public_html/` as the document root
- Every admin API endpoint checks for a valid session server-side before returning data or making changes

What's **not** done yet — worth addressing before this handles real traffic/content:
- No CSRF token on state-changing admin requests (relying on `SameSite=Lax` alone, which isn't complete CSRF protection)
- No rate-limiting or lockout on login attempts (brute-forceable in theory)
- No CAPTCHA/spam protection on the public contact form
- No security headers configured yet (CSP, X-Frame-Options, etc.)
- Only one admin account, no roles/permissions, no 2FA
- HTTPS is not yet enforced anywhere — must be configured at the hosting level (cPanel SSL/TLS) before going live; nothing today prevents the site being served over plain HTTP

## Deployment

Full step-by-step instructions (this hosting account has **no SSH access**, so everything goes through FTP plus small temporary migration scripts — including the exact gotchas already hit and fixed) are in **[DEPLOY.md](DEPLOY.md)**. Summary:

1. Check the PHP extensions checklist in cPanel first (`pdo`, `pdo_mysql`, `mysqli`, `fileinfo`, `mbstring`) — this account's PHP install doesn't enable everything by default
2. Upload `public_html/`'s contents via FTP directly into the site's document root folder; `config.php` and `schema.sql` go one level above it (never web-accessible)
3. Create the production MySQL database via cPanel's wizard, then run schema/seed via a temporary token-protected PHP script (uploaded, triggered once by URL, deleted immediately)
4. Build the admin panel locally (`npm run build` in `admin-app/`) and upload `dist/` contents via FTP — watch for Vite's hashed filenames when cleaning up old build artifacts
5. Enable SSL/TLS via cPanel and confirm the site is only reachable over HTTPS
