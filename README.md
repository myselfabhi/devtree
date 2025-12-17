# Linktree Clone

A complete Linktree clone built with Next.js (frontend) and Express (backend).

## Project Structure

```
linktree/
├── frontend/          # Next.js frontend application
├── backend/           # Express backend API server
├── PRD.md            # Product Requirements Document
└── DEVELOPMENT_SCHEDULE.md  # Development schedule
```

## Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure .env file
npm run dev
```

Backend runs on `http://localhost:3001`

## Development

- Frontend: Next.js 16 with App Router, TypeScript, Tailwind CSS v4
- Backend: Express.js with TypeScript
- Both use Biome for linting and formatting

## Documentation

- See `PRD.md` for product requirements
- See `DEVELOPMENT_SCHEDULE.md` for development timeline
