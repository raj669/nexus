# Learning OS API

## Core Endpoints
- `GET /api/health` - service status.
- `GET /api/meta` - modules and supported capabilities.
- `POST /api/auth/login` - issue JWT-style session token.
- `GET /api/auth/me` - current user and permissions.
- `GET /api/state` - public workspace snapshot.
- `PUT /api/state` - persist a workspace snapshot.

## Domain Endpoints
- `GET /api/classes`
- `POST /api/classes`
- `POST /api/classes/join`
- `POST /api/classes/:classId/archive`
- `GET /api/assignments`
- `POST /api/assignments`
- `GET /api/discussions/:classId`
- `POST /api/discussions`
- `GET /api/messages/:classId`
- `POST /api/messages`
- `GET /api/notifications`
- `PATCH /api/notifications/:notificationId/read`
- `GET /api/events`
- `POST /api/events`
- `GET /api/resources`
- `POST /api/resources`

## Intelligence Endpoints
- `GET /api/analytics/overview?role=student|teacher|admin`
- `GET /api/insights/next-best-action/:userId`
- `POST /api/ai/study-copilot/summary`
- `POST /api/ai/study-copilot/quiz`
- `POST /api/ai/assignment-feedback`
- `POST /api/ai/discussion-summary`
- `GET /api/notifications/stream` (SSE)

## Authentication
- JWT-style tokens are signed with `LEARNING_OS_JWT_SECRET`.
- Requests use `Authorization: Bearer <token>`.
- Sessions are persisted server-side so tokens can be revoked.

## Local Development
- `npm run dev` starts the API server and Vite client together.
- `npm run dev:server` starts the API only.
- `npm run dev:vite` starts the client only.
