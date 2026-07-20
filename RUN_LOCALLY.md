# Running Altec Locally

This is the day-to-day guide for working on the site on your own machine. For getting it live on the actual GoDaddy hosting, see [DEPLOY.md](DEPLOY.md) instead.

## Prerequisites

- **PHP 8.1+** with the `pdo_mysql`, `mbstring`, and `mysqli` extensions (standard on most PHP installs). Check with `php -v` and `php -m`.
- **MySQL or MariaDB** running locally.
- **Node.js 20.19+/22.12+/24+** — only needed to build the admin panel (`admin-app/`), never to run the public site or API. If you don't have a recent enough Node, install [nvm](https://github.com/nvm-sh/nvm) (no root/sudo needed) and run `nvm install` inside `admin-app/` — it'll pick up the version pinned in `admin-app/.nvmrc`.

## First-time setup

1. **Database.** Create a local MySQL database and user, then import the schema:
   ```bash
   mysql -u root -p -e "CREATE DATABASE altec_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci; CREATE USER 'altec_admin'@'localhost' IDENTIFIED BY 'yourpassword'; GRANT ALL PRIVILEGES ON altec_dev.* TO 'altec_admin'@'localhost';"
   mysql -u altec_admin -p altec_dev < schema.sql
   ```
2. **Config.** Copy the template and fill in the credentials from step 1:
   ```bash
   cp config.example.php config.php
   ```
3. **Seed default data** (languages, admin user, default menu/pages/settings):
   ```bash
   ADMIN_EMAIL=you@example.com ADMIN_SEED_PASSWORD=yourpassword php seed.php
   ```
   Pick your own email/password here — this becomes your local admin login. Write it down; it's not stored anywhere else.
4. **Admin panel dependencies:**
   ```bash
   cd admin-app
   npm install
   cd ..
   ```

You only need to repeat steps 1–3 if you wipe the database; step 4 only if `admin-app/package.json` changes.

## Running it day-to-day

You need two things running at once while actively developing: the PHP server (public site + API) and, if you're touching the admin panel, the Vite dev server (hot-reloading React).

**Terminal 1 — PHP server:**
```bash
php -S localhost:8000 -t public_html router.php
```
`router.php` exists because PHP's built-in server ignores `.htaccess` — it replicates the same clean-URL/API-routing rules `public_html/.htaccess` uses in production, so local behavior matches deployed behavior. Public site: `http://localhost:8000`.

**Terminal 2 — Admin panel (only needed if you're changing admin UI code):**
```bash
cd admin-app
npm run dev
```
This opens on its own port (Vite will print the URL, typically `http://localhost:5173`) and hot-reloads on save. It proxies all `/api/*` requests to the PHP server on `:8000` (configured in `admin-app/vite.config.ts`), so both servers need to be running together for the admin panel to actually work in dev mode.

If you're **not** actively changing admin UI code, you don't need Terminal 2 at all — just build once (see below) and use `http://localhost:8000/admin` directly through the PHP server.

## Rebuilding the admin panel

The Vite dev server (Terminal 2 above) is for active development only — it's not what gets deployed, and `http://localhost:8000/admin` won't reflect admin code changes until you rebuild:

```bash
cd admin-app
npm run build
cp -r dist ../public_html/admin
```

Do this whenever you want to sanity-check the admin panel the way it'll actually behave in production (served as static files through PHP, not through Vite's dev server).

## Logging in

- Public site: `http://localhost:8000`
- Admin panel: `http://localhost:8000/admin` (after a build) or the Vite dev server URL (while `npm run dev` is running)
- Login with the `ADMIN_EMAIL`/`ADMIN_SEED_PASSWORD` you chose when running `seed.php`

## Common tasks

- **Reset the database to a clean seeded state:**
  ```bash
  mysql -u altec_admin -p altec_dev < schema.sql   # only if you dropped tables first
  ADMIN_EMAIL=you@example.com ADMIN_SEED_PASSWORD=yourpassword php seed.php
  ```
  `seed.php` is safe to re-run — it upserts rather than duplicating data (though settings you've since edited via the admin panel won't be overwritten, by design).
- **Check PHP syntax across the project without starting a server:**
  ```bash
  find public_html -name "*.php" | xargs -n1 php -l
  ```
- **Type-check the admin panel:**
  ```bash
  cd admin-app && npx tsc --noEmit -p tsconfig.app.json
  ```

## Troubleshooting

- **"Access denied" connecting to MySQL**: check `config.php` matches the user/password/database you actually created.
- **Blank page or PHP errors on every route**: `bootstrap.php` has `display_errors` on for local dev, so PHP errors should show directly in the browser — read the message, it's almost always a missing `config.php` or a bad DB credential.
- **Admin panel shows a blank page or infinite "Loading..."**: usually means `/api/auth/me` isn't reachable — confirm the PHP server (Terminal 1) is actually running on `:8000`, and if you're using the Vite dev server, confirm its proxy target in `vite.config.ts` matches.
- **Changes to admin code don't show up**: if you're viewing via `http://localhost:8000/admin` (not the Vite dev server), you're looking at the last build — see "Rebuilding the admin panel" above.
