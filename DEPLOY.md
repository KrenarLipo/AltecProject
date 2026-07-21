# Deploying Altec

This is the actual, tested process for getting code and database changes onto the live server — written from what really worked, not a theoretical plan. Currently the site runs as a **staging copy** at `altec.appamora.com` (a subdomain on Krenar's own GoDaddy shared cPanel account, pointing at the `AltecAL` folder), for client review before the final move to the client's own server.

**Key fact that shapes everything below: there's no SSH/shell access on this hosting account**, even though the "SSH Access" icon appears in cPanel — GoDaddy has that disabled by default and it needs to be requested from support separately. Every step here works entirely through **FTP** and the website itself (via small, temporary, token-protected PHP scripts) instead.

## One-time account setup (already done for appamora.com, needed again for the client's server)

### 1. Check PHP extensions FIRST

cPanel → **Software → Select PHP Version → Extensions**. This account's PHP install is minimal by default — twice now a feature worked perfectly locally and then failed on production with a `Class "X" not found` error until the extension was manually enabled. Check these are all ticked *before* deploying anything:

- `pdo`
- `pdo_mysql`
- `mysqli`
- `fileinfo` (needed for the media upload feature — mime-type detection)
- `mbstring`

### 2. Create a subdomain (or addon domain) pointing at the site folder

cPanel → **Domains → Create A New Domain**. Enter the subdomain/domain, and when it asks for the document root, point it at (or let it create) a folder — this becomes the equivalent of what this doc calls `AltecAL/` below. Confirm it actually routes before doing anything else:

```
curl -H "Host: yoursubdomain.yourdomain.com" http://SERVER_IP/
```

If that 404s with a generic "File not found" page (not a real Altec page), the domain isn't registered/routed yet — fix that first, nothing else will work.

### 3. Create the FTP account

cPanel → **Files → FTP Accounts** → create a dedicated account (don't reuse an email account — they use the same `user@domain` format and are easy to confuse, and we burned real time on exactly that mix-up once already). Use the password generator and copy the value directly rather than typing one.

### 4. Create the MySQL database

cPanel → **MySQL® Databases**:
1. Create a database (e.g. `altec_prod`)
2. Create a database user — again, use the generator and copy the password directly
3. Add the user to the database with **All Privileges**

Note whether cPanel prefixed the names with your account username or not — it varies by account. Confirm by actually connecting rather than assuming.

### 5. Create `config.php`

This must live **one directory above** the site's document root folder (i.e. next to `AltecAL/`, not inside it) so it's never web-accessible:

```php
<?php

return [
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'the_database_name',
        'user' => 'the_database_user',
        'pass' => 'the_database_password',
    ],
];
```

`host` is always `localhost` here — PHP on the server always reaches MySQL locally, regardless of whether "Remote MySQL" is set up (that setting only affects connections from *outside* the server).

## Getting the code onto the server (FTP)

There's no `git clone` on the server. Upload `public_html/`'s contents via FTP so they land **directly inside** the site's document root folder (not in a `public_html` subfolder inside it):

```bash
cd public_html
for f in $(find . -type f); do
  curl -T "$f" -u 'ftpuser@yourdomain.com:the-ftp-password' "ftp://SERVER_IP/AltecAL/$f"
done
```

(`--ftp-create-dirs` is on by default in recent curl for missing subdirectories; add `curl --ftp-create-dirs` explicitly on older versions.)

Also upload `schema.sql` **one level above** the document root (next to `config.php`) — it's not meant to be web-accessible either.

## Setting up the database schema and default data

Since there's no shell to run `php seed.php` directly, use a **temporary, token-protected PHP script** uploaded into the site folder, triggered once by URL, then deleted. This is the standard pattern for anything that needs to run server-side once — first-time schema setup, and every future migration.

1. Write a small script (see `migrate-v2-once.php` / `migrate-v3-once.php` in git history for real examples) that:
   - Checks a hardcoded random token in `$_GET['token']` before doing anything (`http_response_code(403); exit;` otherwise)
   - Connects using `config.php`
   - Runs the SQL statements (schema creation and/or seed logic)
   - Prints what it did
2. Upload it into the site folder via FTP
3. Trigger it once:
   ```bash
   curl -H "Host: yoursubdomain.yourdomain.com" "http://SERVER_IP/the-script.php?token=your-random-token"
   ```
4. **Delete it immediately** via FTP once it's confirmed working. Never leave one of these on the server.

For the very first setup, run `schema.sql` this way, then seed the admin account/settings/menu (the logic in `seed.php`, adapted into the same one-time-script pattern since it needs real `ADMIN_EMAIL`/`ADMIN_SEED_PASSWORD` values passed in, e.g. as query params on the same protected request).

## Building and deploying the admin panel

The only step that touches Node.js — and it happens on your own machine, never on the server:

```bash
cd admin-app
npm install
npm run build
```

Then upload `admin-app/dist/`'s contents into `AltecAL/admin/` via FTP. **Important gotcha**: Vite hashes filenames on every build (e.g. `index-Bxx7YB_w.js`), so old and new builds have *different* filenames. When cleaning up the previous build's files, delete them **by their exact old filename** — not by "anything matching what I'm about to upload." If a file's content didn't change between builds (common for CSS), it'll get the *same* hash both times, and a blanket "delete anything with this name" cleanup step will delete the file you just uploaded. Always list the remote `admin/assets/` folder before and after to confirm what's actually there.

## Enable SSL/TLS

cPanel → **SSL/TLS Status** → confirm a certificate is issued once DNS resolves. Add a force-HTTPS rule as the first line of `public_html/.htaccess` once it is:

```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Verifying it's actually working

- Homepage loads, menu renders, images/slideshow load
- Click through every nav item and footer link — no 404s or PHP error output
- Submit the contact form, then confirm it shows up under the admin's Contact Submissions
- Log into `/admin`, create a test product with an uploaded photo, confirm it appears on the public site with the right thumbnail, then delete it

## Routine changes after the initial deploy

- **PHP file changed** (a page, an API handler, an include): re-upload just that file via FTP. Takes effect immediately, no build step, no cache to clear.
- **Admin panel changed**: `npm run build` locally → upload the new `dist/` files into `AltecAL/admin/` → delete the specific old-hash files (see the gotcha above).
- **Database schema changed**: write a new `migrate-vN.sql` + matching one-time protected runner script, following the exact pattern above. Keep `schema.sql` updated to match so a fresh install stays accurate. Never hand-run `ALTER TABLE` against production without going through this scripted, repeatable pattern — it's what makes changes reviewable and repeatable instead of one-off tribal knowledge.
- **Content changes** (products, menu, pages, settings, translations): just use `/admin` — no deployment needed at all, this is what the CMS is for.

## Moving from staging (appamora.com) to the client's real server

Everything above is written generically on purpose — repeat the same steps against the client's hosting account. The one thing to re-verify is the PHP extensions checklist at the top (assume nothing is enabled until confirmed), since that's the step most likely to differ between hosts. The code itself needs zero changes — no absolute-domain assumptions are baked in anywhere.

## Troubleshooting

- **`Class "X" not found` fatal error**: a required PHP extension isn't enabled. See the checklist at the top.
- **500 error on any PHP page**: check `config.php` exists at the right path with correct DB credentials — this is the most common cause. `display_errors` is on (`includes/bootstrap.php`), so the actual error should be visible in the response.
- **Admin panel loads but every API call fails**: `.htaccess` didn't upload correctly (some FTP clients skip dotfiles by default — make sure yours doesn't) or `mod_rewrite` isn't enabled (standard on cPanel, but confirm with the host if this happens).
- **A one-time migration script errors with "already exists"**: safe to ignore if you're re-running after a partial failure — the runner scripts skip statements that error with "already exists" or "Duplicate column" and continue.
- **FTP login fails repeatedly with different passwords**: stop guessing passwords — go back into cPanel and actually reset it with the generator, copy the value directly. Three wrong-password attempts in a row on this project all turned out to be human transcription, not a real auth problem.
