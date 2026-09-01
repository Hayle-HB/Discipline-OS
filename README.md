This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The frontend proxies API calls to the FastAPI backend on Render. Set these **Environment Variables** in your Vercel project (Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `BACKEND_API_URL` | `https://discipline-os-backend-29ku.onrender.com` |
| `JWT_SECRET_KEY` | Same value as `JWT_SECRET_KEY` on your Render backend |

Do **not** set `USE_MOCK_AUTH` in production (or set it to `false`).

Leave `NEXT_PUBLIC_API_URL` empty so the browser calls same-origin `/api/*` routes, which proxy to Render server-side.

### Render backend (already deployed)

- API: [https://discipline-os-backend-29ku.onrender.com](https://discipline-os-backend-29ku.onrender.com)
- Docs: [https://discipline-os-backend-29ku.onrender.com/docs](https://discipline-os-backend-29ku.onrender.com/docs)

On Render, ensure these env vars are set: `MONGODB_USERNAME`, `MONGODB_PASSWORD`, `MONGODB_CLUSTER`, `MONGODB_DB_NAME`, `JWT_SECRET_KEY`. Optionally add your Vercel URL to `CORS_ORIGINS` (comma-separated) if you call the API directly from the browser later.

After adding Vercel env vars, redeploy the frontend. Login with `demo@discipline.os` / `password123`.
