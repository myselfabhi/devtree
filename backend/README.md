# Linktree Backend

Backend API server for the Linktree clone.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`

4. Run development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001` (or the port specified in `.env`)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run format` - Format code

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/           # API routes
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Data models
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript types
├── dist/                 # Compiled output
└── package.json
```

