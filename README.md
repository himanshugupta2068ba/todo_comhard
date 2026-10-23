# Todo Task App

A MERN todo application with authentication, personal task management, tags,
Kanban/List/Sections views, and SLA analytics.

## Project structure

```text
backend/
  src/
    config/         Database and environment configuration
    controllers/    HTTP request handlers
    middleware/     Authentication and error handling
    models/         Mongoose models
    routes/         API route definitions
    services/       Business logic
    app.js          Express app
    server.js       Server entry point
frontend/
  src/
    components/
    pages/
    services/
    App.jsx
    main.jsx
```

## Run locally

1. Start MongoDB.
2. Copy the environment templates to local environment files:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   ```

   Set `MONGO_URI` and `JWT_SECRET` in `backend/.env`. The frontend template
   already points to the local API.
3. Install and start the API:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

4. Install and start the client in another terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

The API is available at `http://localhost:5000/api`.

## Initial API surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/todos?page=1&limit=20`
- `POST /api/todos`
- `PATCH /api/todos/:id`
- `DELETE /api/todos/:id`

The tasks endpoint returns the requested page together with pagination metadata:
`{ todos, pagination: { page, limit, total, totalPages } }`. The limit is
clamped to a maximum of 100 tasks per request.

Tags are user-owned and available through `GET /api/tags` and
`POST /api/tags`. Tasks can be associated with those tags.

Todo statuses are `pending`, `in_progress`, `review`, and `completed`. The
frontend includes a lightweight Kanban board for these four columns.

Dashboard is available from the sidebar for today and all-time task analytics
and task status breakdowns.

Tasks opens the Kanban board for all active tasks. The board includes a Today
filter that shows tasks created today, alongside all-task, high-priority, and
my-task filters. A separate priority filter supports all priorities: Low,
Medium, High, and Urgent. Tasks store creation and update timestamps automatically, and
the task form also accepts an SLA due date/time and priority.

SLA analytics records each status transition and shows task creation/due times,
status counts, average time between workflow stages, and average completion
time. It also shows Today&apos;s SLA movements and completions. Older tasks without
history are initialized from their creation timestamp when they next move, so
new movement data is recorded accurately. Completed tasks remain visible in
the Done Kanban column and the sidebar Completed view.

Tasks are available in three presentation modes: List, Sections (grouped by
workflow status), and Kanban. These can be opened from the sidebar or switched
from the task header.
Past SLA dates are rejected in both the browser and API. Deleted
tasks are soft-deleted and remain visible in Trash with their deletion time.

Password reset tokens are returned in the forgot-password response only when
`NODE_ENV` is not `production`, so the local UI can complete the flow without
an email provider. In production, connect the generated token to an email
service and keep the token out of the API response.
