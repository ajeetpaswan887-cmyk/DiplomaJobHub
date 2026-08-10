# DiplomaJobHub Security Model

## Implemented in this starter
- Helmet security headers.
- Strict Content Security Policy in HTML.
- HTTP-only, SameSite session cookie; Secure cookie in production.
- Server-side sessions stored in SQLite, not localStorage.
- Passwords verified with bcrypt hashes; plaintext password is never stored.
- Login-specific rate limiting plus global API rate limiting.
- CSRF token for authenticated state-changing requests.
- Authenticated publisher routes.
- Server-side input validation and length limits.
- HTTPS-only validation for Apply/Notification URLs.
- No secrets in frontend JavaScript.
- Publisher approval gate: AI discovery enters `pending`; only authenticated publisher can publish.
- No advertisements or third-party scripts in the supplied frontend.
- `rel="noopener noreferrer"` for external links.
- SQLite WAL mode and foreign-key enforcement.

## Production requirements
1. Put the site behind HTTPS (TLS) and a reputable reverse proxy/WAF.
2. Set a strong random `SESSION_SECRET` (32+ random bytes).
3. Use a strong unique admin password (12+ characters; preferably a password manager).
4. Use a real production database such as PostgreSQL when traffic grows.
5. Back up the database and protect backups.
6. Keep Node.js and dependencies patched.
7. Do not expose the database or `.env` files publicly.
8. Add server-side audit logs for publish/reject/delete actions.
9. For AI ingestion, use only permitted official APIs/feeds/pages and obey robots.txt, terms and rate limits.
10. Keep AI/API keys only on the server; rotate keys if exposed.
11. Consider 2FA/passkeys for the Publisher account before public launch.
12. Configure DNS, TLS, WAF, monitoring and alerting before launch.

## Important
No software can honestly be promised as “100% secure.” This project is a security-conscious starter, not a guarantee. A production launch should include a security review and dependency scanning.
