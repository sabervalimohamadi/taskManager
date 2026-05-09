# Task Management System

## Setup Instructions

### Prerequisites
- Node.js 20+
- Docker and Docker Compose (for containerized setup)
- MongoDB and Redis (for local setup)

### Local Development
```
npm install
cp .env.example .env
npm run start:dev
```

### Docker
```
docker-compose up --build
```

## Architecture

The system is built on 4 layers:
- **API Layer**: NestJS controllers and services handling REST endpoints
- **Queue Producer**: BullMQ jobs scheduled when tasks have a dueDate
- **Worker**: Queue processor that fires deadline reminders 30 minutes before due
- **WebSocket Gateway**: Real-time event broadcasting to connected clients

All layers share a MongoDB database and communicate via Redis.

## Key Design Decisions

- Optimistic concurrency with version field to prevent simultaneous edit conflicts
- BullMQ jobId deduplication (deadline-{taskId}) to prevent duplicate reminders
- WebSocket room-per-user pattern for targeted notifications
- Activity log as append-only audit trail for full task history
- MongoDB compound indexes on (userId, status), (userId, dueDate) for query performance
- Global exception filter for consistent error response shape

## API Documentation

After starting the app, visit http://localhost:3000/api for full Swagger documentation.
