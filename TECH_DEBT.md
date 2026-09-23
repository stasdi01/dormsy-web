# DormSy — Known Issues & Migration Backlog

Audit date: 2026-09-20. Nothing here is fixed yet — this is the working list.

Severity key: **P0** = breaks or leaks something in production today · **P1** = real bug, no immediate damage · **P2** = cleanup, scaling, docs.

---

## Before the conference (2026-09-27)

Minimum to have a credible live demo and to not lose signups from people you pitch.

- [ ] **Restore the paused Supabase project and verify the data is intact.** Do this first, not the night before. Confirm: colleges/users/listings/messages row counts look right, the `dormsy` storage bucket still has its files, and login works end to end. Note: the project lives under a *different* Supabase account than the one holding the other side projects.
- [ ] **Redeploy the Railway backend.** Checked 2026-09-22: `https://dormsy-web-production.up.railway.app/health` returns `x-railway-fallback: true` / `{"code":404,"message":"Application not found"}` — the edge has no app at that hostname, so the service is gone, not merely idle. The `/health` route exists in code, so a running service would return `{"status":"ok"}`. Verify the Railway project/service still exists and that the deploy URL hasn't changed; if it has, update `NEXT_PUBLIC_API_URL` in Vercel *and* the hardcoded host in the CSP `connect-src` (`frontend/next.config.ts`).
- [ ] **Point `www.getdormsy.com` at the site.** Apex `getdormsy.com` returns 200, but `www` doesn't resolve. People you pitch verbally will type `www`. Add the subdomain in Vercel and let it redirect to the apex.
- [ ] **Re-check `FRONTEND_URL` on Railway** once the backend is redeployed. It gates CORS (`backend/src/server.js` `ALLOWED_ORIGINS`); if it doesn't exactly match the production origin, every API call fails CORS — which, thanks to P0 #2, shows up as a login spinner that never stops.
- [ ] **Fix the landing-page waitlist** (P0 #1 below). You are about to send people to the homepage and every waitlist signup is currently being thrown away.
- [ ] **Re-enable email verification in Supabase.** It was turned off for local dev. If anyone signs up at the conference with it off, accounts get created unverified.
- [ ] **Verify the sending domain with Resend** so mail comes from `noreply@getdormsy.com` (already the configured `EMAIL_FROM`) and not `onboarding@resend.dev`. Unverified domain = the send silently fails or lands in spam.
- [ ] **Hide seller phone/Instagram on the public listing route** (P0 #5 below). One-line fix, and it is the kind of thing that gets noticed when you demo a listing page on a projector.
- [ ] **Add the conference colleges to `COMING_SOON_COLLEGES`** in `frontend/app/page.tsx:7` so schools you are pitching see their own name on the landing page.

Already done, no action needed: PWA icons (`icon-192.png` / `icon-512.png` exist and are real 192/512 PNGs).

---

## P0 — Production-affecting

### 1. Landing-page waitlist silently drops every signup
`frontend/app/page.tsx:31` POSTs to `/auth/waitlist`. That route does not exist — the real one is `POST /colleges/waitlist`. The 404 lands in an empty `catch`, then `setWaitDone(true)` runs unconditionally, so the user always sees "You're on the list!" and nothing is saved. It also omits `college_name`, which the real endpoint requires.

`/waitlist` and `/coming-soon` use the correct endpoint — only the homepage form is broken.

**Fix:** point it at `/colleges/waitlist`, send `college_name` (parse from the email domain if there's no field), and only show success on a 2xx.

### 2. Login hangs forever with no error when the backend is unreachable
`frontend/app/(auth)/login/page.tsx` — `handleSubmit` has no `try`/`catch` around the `fetch` to `${apiUrl}/auth/me` (lines 57–67). Supabase sign-in succeeds and sets the session cookie, then that fetch runs. If it *rejects* rather than returning a non-ok response — Railway down, DNS gone, CORS blocked — the rejection escapes the handler, `setLoading(false)` never runs, and no error is ever set.

Symptom: the Log in button spins forever and the user concludes login is broken. In reality they are already authenticated — navigating manually to `/feed` works.

This makes every backend/CORS/deploy problem look identical to an auth problem, which is exactly the wrong signal when debugging. Note `res.ok` is checked but a thrown fetch is not, so this only triggers on network-level failures, not HTTP errors.

**Fix:** wrap the block in try/catch, `setLoading(false)` in a `finally`, and surface a distinct message ("Couldn't reach the server — try again"). The same unguarded-fetch pattern is worth auditing across the other pages.

**Diagnostic use:** when login appears stuck, manually visit `/feed`. Logged in → Supabase auth is fine and the backend is the problem. Bounced to `/login` → Supabase auth itself failed.

### 3. Listings never actually expire
Nothing flips `status` when `expires_at` passes, and the feed query (`backend/src/routes/listings.js:41-46`) filters on `status = 'active'` only — there is no `expires_at > now()` condition anywhere. The 30-day expiry is currently cosmetic: a "Nd left" label in my-listings plus one warning email.

**Fix:** both halves — add `.gt("expires_at", new Date().toISOString())` to the feed query, and add a daily cron that sets `status = 'archived'` on active listings past `expires_at`. Also: the cron warns at 3 days left (`backend/src/lib/cron.js:16`), but the product rule is a day-25 warning = 5 days left.

### 4. Message receiver is never validated
`backend/src/routes/messages.js:104` takes `receiver_id` straight from the request body. The route checks that the *listing's* college matches the sender's, but never that the receiver is the listing owner or an existing participant in that thread. Any authenticated user can inject a message into any conversation by choosing an arbitrary `listing_id` / `receiver_id` pair.

**Fix:** require `receiver_id` to be either the listing's `user_id`, or a user who already has a message in that `listing_id` thread with the sender.

### 5. Seller phone and Instagram are exposed publicly
`GET /listings/:slug` intentionally has no `requireAuth` (shareable links), but the select at `backend/src/routes/listings.js:108` includes `phone, instagram`. Anyone with a URL — no account, any school, a scraper — gets the seller's phone number.

**Fix:** drop `phone, instagram` from that select. Serve them only from the authenticated `GET /users/:username` route, which already enforces the college boundary.

### 6. Account deletion fails silently and orphans the auth user
`DELETE /users/me` soft-deletes the user's listings, then hard-deletes the `users` row. That cascades to `listings` (`ON DELETE CASCADE`), which hits `messages.listing_id ... ON DELETE RESTRICT` — so the delete errors out whenever anyone has ever messaged them. The code ignores the error, deletes the Supabase Auth user anyway, and returns `"Account deleted"`.

Result: an auth user with no profile row. They can still log in, and then every request 401s with "User profile not found."

**Fix:** decide the real semantics — either anonymize (keep the row, blank the PII, mark `deleted_at`) or cascade messages properly. Check the error before deleting the auth user either way.

### 7. Deleting a conversation deletes it for both people
`backend/src/routes/messages.js:184` — the comment says "for the authenticated user," but it's a hard `DELETE` on the rows. The other person's copy of the thread vanishes with no notice and no recovery.

**Fix:** soft-delete per side (`deleted_by_sender` / `deleted_by_receiver` flags) and filter in the conversation list.

### 8. Migration file is out of sync with production
`backend/src/migrations/001_schema.sql` is missing `listings.is_negotiable` and the entire `feedback` table, both of which the running code requires. A fresh Supabase project built from that file breaks listing creation and feedback immediately. Those changes were applied by hand in the SQL editor and never written down.

**Fix:** dump the live schema, reconcile it into numbered migration files. Do this *before* the DB migration below — it is the source of truth you will be migrating from.

---

## P1 — Real bugs, no immediate damage

- [ ] **Photo limit mismatch, 5 vs 3.** Frontend allows 5 (`listings/new/page.tsx:36`, `listings/[slug]/edit/page.tsx:28`); backend truncates with `slice(0, 3)` (`listings.js:192,247`); DB enforces `order_index BETWEEN 0 AND 2`. All 5 upload to Storage, 2 are silently discarded — and on edit, 2 photos disappear from a listing that looked fine in the form. Pick a number and make all three agree.
- [ ] **PostgREST filter injection in search.** `listings.js:55` interpolates the raw search string into `.or("title.ilike.%...%,description.ilike.%...%")`. Commas and parens let a user reshape the filter expression. The `college_id` / `status` filters are separate `.eq()` calls so they can't be dropped, but this still causes errors and unintended matches. Strip `,()%\` from `search` before interpolating.
- [ ] **Lost view counts.** `listings.js:126` does read-then-write (`views_count: listing.views_count + 1`). Concurrent views overwrite each other. Use an atomic increment (Postgres RPC or `UPDATE ... SET views_count = views_count + 1`).
- [ ] **Storage files are never deleted.** Replacing listing photos or an avatar orphans the old objects; deleting a listing leaves all of its photos. Storage grows forever and you pay for it.
- [ ] **SVG uploads accepted into a public bucket.** `uploads.js` `fileFilter` allows any `image/*`, including `image/svg+xml` — a stored-XSS vector on the Supabase storage domain. Allowlist jpeg/png/webp/heic explicitly.
- [ ] **`GET /auth/check-username` is unauthenticated and unthrottled.** Free username enumeration. Add it to the auth rate limiter.
- [ ] **`PATCH /listings/:id` doesn't validate lengths.** Create validates title ≤ 60 / description ≤ 300; update doesn't, so the DB CHECK fires and the user gets a raw Postgres error string.
- [ ] **`types/index.ts` says `username: string`** but the column is nullable until profile setup completes. Should be `string | null`.

---

## P2 — Cleanup, scaling, docs

- [ ] Unused dependencies and config: `express-validator`, `jsonwebtoken`, and the `JWT_SECRET` env var are installed/configured but never used anywhere.
- [ ] Dead code: `frontend/lib/supabase/middleware.ts` (`updateSession`) is never imported — `proxy.ts` is what actually runs.
- [ ] CSP hardcodes the Railway hostname (`frontend/next.config.ts`, `connect-src`). Breaks the moment the API URL changes — which the migration below will do. Drive it from `NEXT_PUBLIC_API_URL`.
- [ ] README is stale: says Next.js 15, no mention of Resend, feedback, or support routes, and points at the out-of-date migration file.
- [ ] `GET /messages` loads every message the user has ever sent or received, with three joins, then groups in JS. Fine at one college, painful at ten.
- [ ] The chat page re-fetches that entire conversation list just to get the listing title for its header.
- [ ] `requireAuth` costs two Supabase round-trips per request (validate JWT, then load profile). Cache the profile or verify the JWT locally.
- [ ] `frontend/app/page.tsx` is 2,819 lines with a giant inline `<style>` block. Split it into section components before it needs real edits.

---

## Migration off Supabase (after the conference)

Target: own the database, auth, and file storage. Resend stays — email is already independent.

**The key structural fact:** `users.id` is a bare `UUID PRIMARY KEY` with only a comment saying it matches `auth.users.id` — there is **no hard foreign key to Supabase's auth schema** (`001_schema.sql:39`). That means the database move and the auth move are independent and can ship in separate phases instead of one big-bang cutover.

Recommended target stack:
- **Postgres:** Neon, or Railway Postgres (same platform as the API, private networking, one less vendor).
- **Query layer:** Drizzle + TypeScript. This is the phase with the most resume value and it replaces every `supabase-js` query builder call.
- **Auth:** Better Auth (self-hosted, owns tables in your own DB, email/password + verification built in).
- **Storage:** Cloudflare R2 (S3-compatible, no egress fees — right call for an image-heavy marketplace).
- **Realtime:** SSE straight from the Express API. Railway holds long-lived connections; no vendor needed for one chat feature.

Phases, each independently shippable and reversible:

1. **Reconcile the schema** (P0 #8 above) — you cannot migrate from a schema file that doesn't match production.
2. **Database.** `pg_dump` the app tables into Neon/Railway, rewrite the ~60% of the backend that is `supabase-js` query-builder code. PostgREST's embedded selects (`seller:users!user_id(...)`) become joins or Drizzle relational queries — that's the fiddly part, since the nested response shape is what the frontend types expect. Supabase Auth and Storage stay untouched. **3–5 days.**
3. **Storage.** Two upload endpoints to rewrite, plus a script to copy every object to R2 and rewrite the stored URLs in `listing_photos.storage_url` and `users.avatar_url`. **1–2 days.**
4. **Realtime.** Replace the `postgres_changes` subscription in the chat page with SSE. Only one feature depends on it. **1 day.**
5. **Auth.** The hard one. New session handling on the frontend, new JWT middleware on the backend, rebuilt verification and password-reset email flows, rewritten `/auth/callback`, and a password-hash migration (Supabase stores bcrypt in `auth.users.encrypted_password`, which is exportable and re-usable — verify this before committing to the plan). **3–5 days.**
6. Testing, a rehearsed data migration, and cutover. **2–3 days.**

Realistic total: **2–3 weeks focused, 3–4 weeks alongside classes.** Not a week. Do not start before the conference.
