# DevTree

A developer portfolio platform that showcases your live projects with automated performance metrics, tech stack detection, and GitHub integration.

**Live Demo:** [https://devtree.vercel.app](https://devtree.vercel.app)  
**Example Profile:** [/example](https://devtree.vercel.app/example)

## 🚀 Features

- **Project Showcase**: Display your live projects with visual previews and detailed metrics
- **Lighthouse Integration**: Automatic performance, accessibility, best practices, and SEO scoring
- **GitHub Metrics**: Stars, last commit date, and commit messages
- **Tech Stack Detection**: Automatic detection from multiple languages (JavaScript/TypeScript, Python, Go, Rust, Java, PHP)
- **Screenshot Capture**: Automated visual previews using Puppeteer
- **Responsive Design**: Fully responsive across all devices
- **Authentication**: Secure user authentication with NextAuth.js
- **Custom Profiles**: Personalized profiles with bio, avatar, and theme customization

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI + custom components

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Storage**: Cloudflare R2 (S3-compatible)
- **Browser Automation**: Puppeteer
- **Performance Auditing**: Lighthouse
- **GitHub Integration**: GitHub API v3

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: MongoDB Atlas
- **Object Storage**: Cloudflare R2

## 📁 Project Structure

```
linktree/
├── frontend/          # Next.js frontend application
│   ├── app/          # App Router pages and routes
│   ├── components/   # React components
│   └── lib/          # Utility functions
├── backend/          # Express backend API server
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── services/     # Business logic (screenshot, lighthouse, GitHub)
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   └── middleware/   # Auth middleware
│   └── dist/         # Compiled JavaScript
├── TECHNICAL_PRD.md  # Detailed technical documentation
├── PRD.md           # Product requirements document
└── README.md        # This file
```

## 🚦 Getting Started

### Prerequisites

- Node.js 20+ 
- MongoDB database (local or Atlas)
- Cloudflare R2 bucket (or AWS S3)
- GitHub Personal Access Token (optional, for higher rate limits)

### Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
EOF

npm run dev
```

Frontend runs on `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=3001
MONGODB_URI=mongodb://localhost:27017/devtree
JWT_SECRET=your-jwt-secret-here

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=devtree-images
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# GitHub API (optional, for higher rate limits)
GITHUB_API_TOKEN=your-github-token
EOF

npm run dev
```

Backend runs on `http://localhost:3001`

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

**Backend:**
```bash
cd backend
npm run build
npm start
```

## 🔧 Environment Variables

### Frontend (`.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes |
| `NEXTAUTH_URL` | Frontend URL for auth callbacks | Yes |

### Backend (`.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID | Yes |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key | Yes |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key | Yes |
| `R2_BUCKET_NAME` | R2 bucket name | No (default: linktree-image) |
| `R2_PUBLIC_URL` | R2 public URL for images | No (auto-generated) |
| `GITHUB_API_TOKEN` | GitHub personal access token | No (recommended) |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

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

### GitHub
- `POST /api/github/fetch` - Fetch GitHub repository details

### Upload
- `POST /api/upload` - Upload image (avatar/background)

## 🔍 How It Works

### Screenshot Capture
1. User adds a project URL
2. Backend launches Puppeteer (headless Chrome)
3. Navigates to the URL and waits for page load
4. Captures screenshot at 1920x1080 resolution
5. Uploads to Cloudflare R2
6. Stores public URL in database

### Lighthouse Auditing
1. Puppeteer launches browser instance
2. Lighthouse connects to browser via Chrome DevTools Protocol
3. Runs audits: Performance, Accessibility, Best Practices, SEO
4. Scores calculated (0-100) and stored in database
5. Runs asynchronously (fire-and-forget)

### GitHub Metrics
1. Extracts owner/repo from GitHub URL
2. Fetches repository info (stars, commits)
3. Detects tech stack from dependency files:
   - `package.json` (JavaScript/TypeScript)
   - `requirements.txt` (Python)
   - `go.mod` (Go)
   - `Cargo.toml` (Rust)
   - `pom.xml` (Java/Maven)
   - Repository topics
4. Supports monorepo detection (scans subdirectories)
5. Infers project role (Frontend/Backend/Full Stack)

### Tech Stack Detection
- **Dynamic Discovery**: Scans root and subdirectories for dependency files
- **Multi-language**: Supports 6+ languages/frameworks
- **Monorepo Support**: Merges dependencies from multiple package files
- **Smart Inference**: Maps dependencies to frameworks and roles

## 📚 Documentation

- **[TECHNICAL_PRD.md](./TECHNICAL_PRD.md)**: Comprehensive technical documentation with data flows, API details, and implementation specifics
- **[PRD.md](./PRD.md)**: Product requirements and feature specifications

## 🧪 Development

Both frontend and backend use:
- **Biome** for linting and formatting
- **TypeScript** for type safety
- **ES Modules** (backend)

```bash
# Lint
npm run lint

# Format
npm run format

# Build
npm run build
```

## 🚨 Known Limitations

- **Render Free Tier**: Backend may have cold start delays (30-60s on first request)
- **GitHub Rate Limits**: Without API token: 60 requests/hour. With token: 5,000 requests/hour
- **Lighthouse**: Can take 10-30 seconds per audit (runs asynchronously)
- **Puppeteer**: Requires sufficient memory (512MB+ recommended)

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT

## 👤 Author

**Abhinav Verma**
- GitHub: [@myselfabhi](https://github.com/myselfabhi)
- Portfolio: [DevTree Profile](https://devtree.vercel.app/myselfabhi)

---

**Note**: DevTree is deployed on Render's free tier. The backend may take 30-60 seconds to wake up on the first request after inactivity.
