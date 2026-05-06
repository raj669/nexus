<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/aec90ecd-eb12-4c87-9bd2-87c914af139f

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Optionally set the `GEMINI_API_KEY` in [.env.local](.env.local) for Gemini-powered features.
3. Start the full stack:
   `npm run dev`

### What `npm run dev` starts

- Vite frontend on `http://localhost:3000`
- Learning OS API on `http://localhost:4000`
- API proxying from `/api` through Vite for local development

### Backend Notes

- Authentication uses JWT-style session tokens.
- Persistent app state is written to `server/data/learning-os.json`.
- Database schema reference: [database/schema.sql](database/schema.sql)
- Architecture reference: [docs/learning-os-architecture.md](docs/learning-os-architecture.md)
- API reference: [docs/learning-os-api.md](docs/learning-os-api.md)
