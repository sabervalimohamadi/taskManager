# Task Management Project — History of Changes

## Initial Setup
- **first commit** — project scaffolding
- **Finish Testing** — initial test run

---

## Security Fixes

| # | Commit | Description |
|---|--------|-------------|
| 1 | `security: stop tracking .env and dist/` | Added `.gitignore`, removed `.env` + `dist/` from git, rotated JWT secret to 64-byte random value |
| 2 | `security: add JWT authentication to WebSocket gateway` | Created `WsJwtGuard` — reads token from `handshake.auth.token` or `Authorization` header; unauthenticated clients disconnected immediately |
| 3 | `security: implement refresh token rotation with reuse detection` | Added `RefreshToken` schema with SHA-256 hashing, family-based reuse detection, access token TTL shortened to 15m, added `/auth/refresh` and `/auth/logout` |

---

## Bug Fixes

| # | Commit | Description |
|---|--------|-------------|
| 4 | `fix: replace in-memory userSocketMap with Redis Socket.IO adapter` | Replaced `userSocketMap` with `@socket.io/redis-adapter`; Socket.IO rooms handle per-user routing across all instances |
| 5 | `fix: add optimistic lock to assignTask` | Added `expectedVersion` to `AssignTaskDto`; atomic `findOneAndUpdate` with version in filter prevents silent overwrites → `ConflictException` |
| 6 | `fix: eliminate stale activity log in task update` | Two-query pattern: `findOne` (before snapshot) + `findOneAndUpdate` (after); concurrent version change throws `ConflictException` |
| 7 | `fix: prevent IDOR on comments and attachments` | Added `assertUserCanAccessTask()` to `TasksService`; `CommentsService` and `AttachmentsService` call it before any operation |
| 8 | `fix: secure ActivityLog endpoint against unauthorized access` | Controller checks task ownership via `TasksService` + `ParseMongoIdPipe` before returning logs |
| 9 | `fix: scope reports to requesting user` | All report endpoints filter by `userId/assignedTo`; per-user cache keys; date range validation (from < to, max 1 year) |
| 10 | `fix: make deadline reschedule atomic` | Added `OutboxEvent` schema + `OutboxWorker` `@Cron('*/5 * * * * *')`; `TasksService.update()` writes outbox event instead of direct queue calls |

---

## Performance

| # | Commit | Description |
|---|--------|-------------|
| 11 | `perf: cache notification preferences` | `getPrefs()` helper caches under `prefs:{userId}` (5-min TTL); `updatePreferences()` invalidates cache |
| 12 | `Task 12: Fix inefficient pagination` | Added `.select()`, `.sort({createdAt: -1})`, `.lean()` to `findAll` |
| 13 | `Task 13: Remove unnecessary populate from QueueProcessor` | Replaced `populate(userId/assignedTo)` with `select().lean()` — eliminated 2 wasted DB round-trips per job |

---

## Tasks (Numbered)

| # | Task | Description |
|---|------|-------------|
| 14 | `Task 14: Enable TypeScript strict mode` | Enabled strict TS; fixed all type errors |
| 15 | `Task 15: Add startup env-var validation with Joi` | Joi schema validates all required env vars at startup |
| 16 | `Task 16: Add field-level validation to task DTOs` | `class-validator` decorators on all task DTOs |
| 17 | `Task 17: Fix MongoDB schemas` | Schema corrections |
| 18 | `Task 18: Move cache to Redis + mutation invalidation` | Moved from in-memory to Redis cache; invalidation on mutations |
| 19 | `Task 19: Add WS rate limiting + tighten HTTP throttler` | WebSocket connection rate limiting; stricter HTTP throttler |
| 20 | `Task 20: Harden main.ts` | Security hardening: helmet, CORS, global pipes/filters |
| 21 | `Task 21: Add /health and /live endpoints` | `@nestjs/terminus` health checks at `/v1/health` and `/v1/health/live` |
| 22 | `Task 22: Remove dead tasks.gateway.ts; migrate bull → bullmq` | Removed dead gateway file; migrated queue from Bull to BullMQ |
| 23 | `Task 23: Fix removeOnFail + remove getHello endpoint` | Fixed BullMQ `removeOnFail` config; removed unused endpoint |
| 24 | `Task 24: Add meaningful unit tests (19 tests, 4 suites)` | `tasks.service.spec` (9), `ws-jwt.guard.spec` (5), `queue.service.spec` (5) |
| 25 | `Task 25: Add structured logging with nestjs-pino` | Global `LoggerModule`; pino-pretty in dev, raw JSON in prod; redacts auth headers; suppresses liveness probe logs |
| 26 | `Task 26: Add GitHub Actions CI + fix all lint errors` | CI pipeline: MongoDB 7 + Redis 7 services, tsc, lint (0 warnings), tests + coverage, build; all lint errors fixed |
| 27 | `Task 27: Fix multi-stage Dockerfile with non-root user` | 3-stage build: `deps` → `builder` → `runtime`; runs as `USER node` (uid 1000); `HEALTHCHECK` on `/v1/health/live`; `.dockerignore` excludes secrets |

---

## Other

| Commit | Description |
|--------|-------------|
| `Fix circular dependency between TasksModule and ActivityLogModule` | Applied `forwardRef()` on both module imports and provider injections |
| `up-10-5` | Minor update |

---

## Frontend — Web App

| # | Task | Description |
|---|------|-------------|
| FE-1 | `feat(web): scaffold + auth UI` | Vite + Vue3 + TS, TailwindCSS v4 with brand #a72b77, Axios client with JWT interceptor + refresh rotation, Pinia auth store (persisted), Vue Router v4 with auth navigation guard, LoginPage with VeeValidate+Zod, reusable UI components (AppButton, AppInput, AppCard, AppSpinner), folder: `task-management-front/` |
| FE-2 | `feat(web): dashboard + task list` | TanStack Query for server state, debounced search + status/priority/sort filters, responsive TaskTable (desktop) + TaskCard (mobile), skeleton loading, TaskPagination, Create/Edit modals with VeeValidate+Zod, optimistic conflict (409) handling, Pinia task store for modal state, stat summary cards |
