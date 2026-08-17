# Caretaker

A screen that speaks Popo's language. Two views, one DB: `/family` (control room)
and `/popo` (her screen), synced live over a relay.

## Local dev

```bash
npm install
cp .env.local.example .env.local   # SQLite by default — offline-safe, no setup
npm run db:push
npm run seed
npm run dev
```

Open `/popo` and `/family` in two tiled windows, or `/demo` for both in one tab.

See `DEPLOY.md` when you're ready to put this on GitHub + Vercel + Neon.
