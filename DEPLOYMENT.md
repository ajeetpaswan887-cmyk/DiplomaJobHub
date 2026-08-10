# DiplomaJobHub — Production Deployment

Before public launch:
1. Use your own domain and HTTPS.
2. Set NODE_ENV=production.
3. Set a strong random SESSION_SECRET.
4. Create a strong unique Publisher password and store only its bcrypt hash.
5. Run `npm run bootstrap-admin`.
6. Keep `.env` and `data/` private; never commit them.
7. Put the app behind a TLS reverse proxy/WAF.
8. Back up the database.
9. Add 2FA/passkey before sharing the Publisher account.
10. Keep Node and dependencies patched.

AI pipeline:
Official source/API/feed -> source adapter -> duplicate check -> AI extraction/classification -> strict eligibility validation -> Pending Queue -> Publisher review -> Publish -> optional WhatsApp announcement.

The current AI scan endpoint is intentionally a safe demo. A production worker must use permitted official APIs/feeds/pages, obey source terms/robots/rate limits, and keep AI/API keys on the server.

WhatsApp channel:
https://whatsapp.com/channel/0029VbDkCuX8kyyHeg8S4Q2b

Automatic WhatsApp channel posting requires appropriate official Meta/WhatsApp capabilities; do not use unofficial bots.
