# Deploying Altec to GoDaddy Shared cPanel Hosting

This walks through getting the site live on the actual GoDaddy shared cPanel account (the one with SSH access, PHP/Python/Ruby app support, and no Node.js support — see `docs/Altec-Architecture-Proposal.pdf` for why the stack is PHP + static React admin).

## Prerequisites

- cPanel login for the GoDaddy account (main domain `appamora.com`; `altec-al.com` will be an **addon domain** on the same account)
- SSH access enabled (confirmed available — Security → SSH Access in cPanel)
- The domain `altec-al.com` pointed at this hosting account (DNS/nameservers) — do this first if not already done, since DNS propagation can take a while and everything else can happen in parallel

## 1. Add `altec-al.com` as an addon domain

In cPanel: **Domains → Addon Domains** (or just **Domains**, depending on cPanel version) → add `altec-al.com`. This creates a document root for it, typically `~/altec-al.com/` or `~/public_html/altec-al.com/` depending on how cPanel names it — note the exact path cPanel gives you, you'll need it below.

## 2. Create the MySQL database

cPanel → **MySQL Database Wizard** (under Databases):
1. Create a database (e.g. `altec_prod`) — cPanel will prefix it with your account username, e.g. `youraccount_altec_prod`
2. Create a database user with a strong password
3. Add that user to the database with **All Privileges**

Note the final database name, username, and password — cPanel-generated names are usually prefixed (`username_altec_prod`, `username_altec_admin`), not the plain names used locally.

## 3. Get the code onto the server

SSH in (`ssh youraccount@altec-al.com` or whatever host cPanel gives you), then:

```bash
cd ~/altec-al.com   # the addon domain's document root from step 1
git clone https://github.com/KrenarLipo/AltecProject.git .
```

If the addon domain's folder isn't empty (cPanel sometimes drops a placeholder `index.html` in there), remove it first so `git clone .` doesn't complain.

If SSH/git isn't workable for some reason, the fallback is: zip the repo locally, upload via cPanel's **File Manager**, and extract it there.

Either way, **only `public_html/`'s contents need to actually be under the web-servable document root** — everything else (`config.php`, `schema.sql`, `seed.php`, `admin-app/`) can live one level up, outside what's served to visitors. If cPanel gave you `~/altec-al.com/` as the doc root and the repo cloned directly into it, that's a problem — `public_html/*.php` would sit inside a `public_html` subfolder instead of at the root. Two ways to handle this:
- Clone the repo *outside* the doc root (e.g. `~/altec-project-src/`), then symlink or copy `public_html/`'s contents into `~/altec-al.com/` — cleanest, keeps the deploy step scriptable, but means an extra copy step on every update.
- Or point cPanel's document root for the addon domain directly at `.../public_html` inside the cloned repo (cPanel's addon domain settings let you specify a custom document root) — no copy step needed, simplest for a single-domain single-app setup like this one. **Recommended.**

## 4. Set up the database schema and data

Still over SSH, from the repo root:

```bash
mysql -u youraccount_altecadmin -p youraccount_altec_prod < schema.sql
```

(the `-p` flag prompts for the DB user's password from step 2)

Then seed the default admin account, languages, menu, and settings:

```bash
ADMIN_EMAIL=you@yourdomain.com ADMIN_SEED_PASSWORD='a-strong-password' php seed.php
```

Pick a real password here — this becomes the production admin login. Don't reuse the local dev password.

## 5. Create `config.php`

At the repo root on the server (**not** inside `public_html/`, so it's never web-accessible):

```php
<?php

return [
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'youraccount_altec_prod',
        'user' => 'youraccount_altecadmin',
        'pass' => 'the-db-password-from-step-2',
    ],
];
```

Copy `config.example.php` as a starting point (`cp config.example.php config.php`) and edit it in place, or create it directly with the values above.

## 6. Set the PHP version

cPanel → **Select PHP Version** (Software section) → choose PHP 8.1+ (this project was built and tested against 8.3). Make sure the following extensions are enabled (they're on by default in most cPanel PHP builds): `pdo_mysql`, `mbstring`, `mysqli`.

## 7. Build and deploy the admin panel

This is the one piece that needs a Node.js build step — but it happens **on your own machine**, not the server (remember: the server has no Node.js support at all).

Locally:

```bash
cd admin-app
npm install
npm run build
```

Then upload the resulting `admin-app/dist/` folder's contents to `public_html/admin/` on the server (via `scp`, `rsync`, or File Manager upload). Example with `rsync` over SSH:

```bash
rsync -avz --delete admin-app/dist/ youraccount@altec-al.com:~/altec-project-src/public_html/admin/
```

(adjust the remote path to wherever your `public_html/` actually lives per step 3).

## 8. Enable SSL/TLS

cPanel → **SSL/TLS Status** (or **SSL/TLS**) → make sure `altec-al.com` has a certificate issued (GoDaddy/cPanel usually auto-provisions a free AutoSSL certificate once the domain is added and DNS resolves correctly — can take some time). Once issued, consider forcing HTTPS via a redirect rule at the top of `public_html/.htaccess`:

```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

(add this as the first rule, before the existing rewrite rules already in that file).

## 9. Verify it's actually working

- Visit `https://altec-al.com/` — homepage loads, menu renders
- Click through each nav item (`/about`, `/ac-sales-installation`, `/reconstruction-furnishing`, `/works`, `/news`, `/contact`, `/partners`) — no 404s or PHP errors
- Submit the contact form — confirm no error, then check it landed in the database (or just check the admin panel in the next step)
- Visit `https://altec-al.com/admin` — log in with the email/password from step 4
- Confirm the contact submission from the previous check shows up under Contact Submissions
- Create a test product, confirm it shows up on the public AC Sales & Installation page, then delete it

## Redeploying after future changes

- **PHP changes** (public site or API): just re-upload/`git pull` the changed files — takes effect immediately, no build step
- **Admin panel changes**: repeat step 7 (`npm run build` locally, re-upload `dist/` to `public_html/admin/`)
- **Database schema changes**: there's no migration tool in this stack (no ORM) — schema changes need a manually written `ALTER TABLE` SQL run by hand against the production database, applied carefully, ideally on a backup first

## Troubleshooting

- **500 error on any PHP page**: check `error_reporting`/`display_errors` are on (they are, per `includes/bootstrap.php`) and look at cPanel's **Errors** log, or the domain's error log via File Manager. Most likely cause: `config.php` missing or has wrong DB credentials.
- **Admin panel loads but API calls fail**: check the `.htaccess` rewrite rules made it into `public_html/.htaccess` (some upload methods skip dotfiles — verify via File Manager, showing hidden files enabled) and that `mod_rewrite` is enabled on the account (standard on cPanel, but confirm with your host if issues persist).
- **Login works locally but not in production**: double check `seed.php` was actually run against the production database with the credentials you expect, and that `config.php` on the server points at the same database you seeded.
