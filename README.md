# Bits3 Project Dashboard

Next.js project dashboard for admin/PM and client workspaces.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npx next build --webpack
```

The project avoids remote font fetching during build so it can deploy reliably on Vercel.

## Environment Variables

Add the Supabase values from `.env.local` to the Vercel project environment variables before deploying.
