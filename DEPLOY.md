# Deploying

Local dev doesn't need any of this — SQLite works offline out of the box. Do this
whenever you're ready to put the project on GitHub and Vercel.

## 1. Push to GitHub

```bash
gh auth login          # once, if you haven't already
gh repo create caretaker --private --source=. --remote=origin --push
```

That creates the repo, adds it as `origin`, and pushes `main` in one step. (Drop
`--private` for a public repo.) If you'd rather create the repo on github.com
first, just `git remote add origin <url> && git push -u origin main` instead.

## 2. Connect Vercel + provision Neon

```bash
npx vercel login       # once, if you haven't already
npx vercel link        # pick "Link to existing Git Repository" or create fresh
npx vercel integration add neon    # provisions Neon Postgres, sets DATABASE_URL
npx vercel git connect             # wires the GitHub repo to this Vercel project
                                    # (auto-deploys on every push after this)
```

Push the Neon schema and seed it:

```bash
npx vercel env pull .env.neon.local --environment=production   # DATABASE_URL only
npm run db:push:pg
npm run seed:pg
```

## 3. First deploy

```bash
npx vercel deploy --prod
```

From here, every `git push` to `main` auto-deploys via the GitHub connection —
`vercel deploy` is only needed for a manual first push or a preview build.

## 4. Feature keys (optional, add anytime)

The app runs fine without these — missing keys log a `TODO` and fall back
gracefully (cached translations, a fixture news item, message-mode relay).

```bash
npx vercel env add ANTHROPIC_API_KEY production      # or your LLM_PROVIDER's key
npx vercel env add AZURE_SPEECH_KEY production
npx vercel env add AZURE_SPEECH_REGION production
npx vercel env add APIFY_TOKEN production
npx vercel env add NEXT_PUBLIC_VAPI_PUBLIC_KEY production
npx vercel env add VAPI_ASSISTANT_ID production
npx vercel deploy --prod    # or just `git push` if step 2's connect is done
```
