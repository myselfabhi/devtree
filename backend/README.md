# Linktree Backend

Backend API server for the Linktree clone using Express + MongoDB + Mongoose.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Random string for JWT tokens
   - `PORT`: Server port (default: 3001)

4. Run development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001` (or the port specified in `.env`)

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Add it to `.env` as `MONGODB_URI`

### Option 2: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/linktree`

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
│   ├── config/
│   │   └── db.ts         # MongoDB connection
│   ├── models/           # Mongoose models
│   │   ├── User.ts
│   │   ├── Profile.ts
│   │   └── Link.ts
│   ├── routes/           # API routes
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Custom middleware
│   └── utils/            # Utility functions
├── dist/                 # Compiled output
└── package.json
```

## API Endpoints (To be implemented)

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Profile
- `GET /api/profile` - Get current user's profile
- `POST /api/profile` - Create profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/:username` - Get public profile by username

### Links
- `GET /api/links` - Get all links for user
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `PUT /api/links/reorder` - Reorder links
