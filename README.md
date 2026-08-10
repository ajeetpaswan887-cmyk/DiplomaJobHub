# DiplomaJobHub — Secure Production Starter

## What this contains
A professional ad-free DiplomaJobHub frontend plus a secure backend starter:
- Electrical / Mechanical / Civil
- Government / PSU / Private-MNC / Apprenticeship
- Fresher / 0-experience focus
- Search and filters
- Official Apply + Notification URL fields
- WhatsApp Channel
- Publisher login and final publish/reject/delete control
- AI Discovery Queue (server-side demo endpoint)
- Session-based authentication, bcrypt password hashes, CSRF protection, rate limiting, Helmet, CSP and server-side validation.

## Local setup
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Generate a password hash:
   `npm run hash-password`
5. Put the resulting hash in `ADMIN_PASSWORD_HASH`, set `ADMIN_USERNAME`, and create a long random `SESSION_SECRET`.
6. Run:
   `npm run bootstrap-admin`
7. Start:
   `npm start`
8. Open `http://localhost:3000`.
9. Publisher panel: `http://localhost:3000/admin`.

## AI in production
The `/api/admin/scan` endpoint is deliberately only a demo. A real AI worker should:
- fetch permitted official government/PSU/company career feeds or APIs;
- extract Diploma + Electrical/Mechanical/Civil + Fresher eligibility, dates, salary, location;
- save the official source and timestamps;
- put matches into `pending`;
- never auto-publish without the owner's approval.

Never place an AI API key in browser code.

## Deployment
Use HTTPS, a reverse proxy/WAF, a real domain, backups, monitoring, dependency updates, and preferably PostgreSQL + 2FA/passkeys for the publisher account. See SECURITY.md.


## Status
This is a production-oriented starter, not a hosted service. The public site, Publisher authentication/control, security controls and AI review queue are included. Live automatic job discovery still needs approved official source connectors and a server-side AI provider.
