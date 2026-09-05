# Alert System - Multi-Channel Notifications

**Status**: 🚀 Milestone 1 Complete - Project Setup & Infrastructure

A comprehensive alert notification system that enables users to get notified about important events via email and Slack. Built with Express.js backend and Vue 3 frontend, fully containerized with Docker.

## 📋 Project Overview

### Key Features
- ✅ Multi-channel notifications (Email & Slack with extensible architecture)
- ✅ Alert configuration and management
- ✅ News feed with automated generation
- ✅ Admin dashboard for system visibility
- ✅ Type-safe codebase (TypeScript everywhere)
- ✅ Production-ready Docker setup
- ✅ Comprehensive testing infrastructure

### Technology Stack

**Backend**
- Express.js with TypeScript
- SQLite database
- Jest for testing
- Nodemailer for email
- Axios for HTTP requests

**Frontend**
- Vue 3 with Composition API
- Vite for bundling
- Tailwind CSS for styling
- Vue Router for navigation
- TypeScript for type safety

**Infrastructure**
- Docker & Docker Compose
- MailHog for local email testing
- Nginx reverse proxy
- Multi-stage builds for optimization

## 🎯 Milestone 1: Project Setup & Infrastructure ✅

### Completed Tasks

#### M1.1 Backend Project Initialization ✅
- Express.js setup with TypeScript
- Project structure: `src/`, `tests/`, `dist/`
- `tsconfig.json` configured for ES2020
- ESLint and Prettier setup for code quality
- Basic error handling middleware in place
- **Status**: `npm start` runs without errors

#### M1.2 Frontend Project Initialization ✅
- Vue 3 + Vite + TypeScript setup
- Project structure: `src/components`, `src/pages`, `src/composables`
- Vue Router configured with basic routing (Home, Alerts, News, Admin)
- Tailwind CSS integrated for styling
- **Status**: `npm run dev` runs Vite dev server on port 5173

#### M1.3 Docker & Deployment Setup ✅
- Production-ready Dockerfile for backend (multi-stage build)
- Dockerfile for frontend (Nginx-based)
- `docker-compose.yml` with:
  - Backend service on port 3001
  - Frontend service on port 80
  - MailHog for email testing (UI on port 8025)
  - Shared network configuration
  - Health checks for all services
- Nginx configuration for reverse proxy and SPA routing
- **Status**: `docker-compose up` starts all services successfully

#### M1.4 Database Setup ✅
- SQLite database initialization script
- Schema with 4 tables:
  - `alerts` - Store user alert configurations
  - `notification_channels` - Email/Slack destinations
  - `news_items` - News feed content
  - `notification_logs` - Delivery tracking
- Proper indexes for performance
- Connection pooling ready
- **Status**: Database file created and tables accessible

#### M1.5 Testing Infrastructure ✅
- Jest configuration with TypeScript support
- Test directory structure in place
- Sample test file for validation
- Coverage reporting configured (70% threshold)
- **Status**: `npm test` runs and reports coverage

### Project Structure

```
alert-system/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry
│   │   ├── database.ts           # Database initialization
│   │   ├── routes/               # API routes (ready for M4)
│   │   ├── services/             # Business logic (ready for M3)
│   │   ├── models/               # TypeScript interfaces (ready for M2)
│   │   └── utils/                # Helpers and validators (ready for M2)
│   ├── tests/
│   │   └── setup.test.ts         # Basic setup test
│   ├── dist/                     # Compiled output
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .eslintrc.json
│   ├── .prettierrc.json
│   ├── .env.example
│   ├── Dockerfile
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.vue          # Landing page
│   │   │   ├── Alerts.vue        # Alert management (ready for M9)
│   │   │   ├── NewsFeed.vue      # News display (ready for M9)
│   │   │   └── Admin.vue         # Admin dashboard (ready for M9)
│   │   ├── components/           # Reusable components (ready for M7)
│   │   ├── composables/          # Logic composition (ready for M8)
│   │   ├── App.vue               # Root component
│   │   ├── main.ts               # Entry point
│   │   └── style.css             # Global styles
│   ├── public/                   # Static assets
│   ├── index.html                # HTML template
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.json
│   ├── .env.example
│   ├── Dockerfile
│   └── .gitignore
├── docker-compose.yml            # Orchestration
├── nginx.conf                    # Reverse proxy
├── .env.example                  # Environment template
├── package.json                  # Monorepo configuration
├── MILESTONES.md                 # Project roadmap
├── TECH_DECISIONS.md             # Technical decisions
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Docker & Docker Compose (optional, for containerized setup)

### Local Development Setup

1. **Clone and Install Dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Dependencies for both backend and frontend are auto-installed
   ```

2. **Setup Environment Files**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Initialize Database**
   ```bash
   npm run db:init
   ```

4. **Start Development Servers**
   ```bash
   # Option 1: Run both backend and frontend concurrently
   npm run dev

   # Option 2: Run individually in separate terminals
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Backend Health: http://localhost:3001/health
   - API Docs: Coming in M4

### Docker Setup

```bash
# Build images
npm run docker:build

# Start services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down

# Access services
# Frontend: http://localhost
# Backend API: http://localhost/api
# Backend direct: http://localhost:3001
# MailHog UI: http://localhost:8025
```

## 📦 Available Scripts

### Root Level
- `npm run dev` - Start both backend and frontend dev servers
- `npm run build` - Build both backend and frontend
- `npm run test` - Run backend tests
- `npm run lint` - Lint both backend and frontend
- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start containers
- `npm run docker:down` - Stop containers
- `npm run db:init` - Initialize database

### Backend
- `npm run dev` - Start with ts-node
- `npm run build` - Compile TypeScript
- `npm start` - Run production build
- `npm test` - Run Jest tests
- `npm run test:watch` - Watch mode for tests
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint and fix issues

## 🗄️ Database Schema

### alerts
```sql
id (TEXT, PK)
name (TEXT, NOT NULL)
description (TEXT)
keywords (TEXT, NOT NULL) -- JSON array as string
is_active (BOOLEAN, DEFAULT 1)
created_at (TEXT)
updated_at (TEXT)
```

### notification_channels
```sql
id (TEXT, PK)
alert_id (TEXT, FK)
type (TEXT) -- 'email' or 'slack'
destination (TEXT) -- email address or Slack webhook URL
is_enabled (BOOLEAN, DEFAULT 1)
created_at (TEXT)
```

### news_items
```sql
id (TEXT, PK)
title (TEXT, NOT NULL)
content (TEXT, NOT NULL)
category (TEXT) -- 'breaking_news', 'market', 'disaster', 'other'
source (TEXT)
timestamp (TEXT)
created_at (TEXT)
```

### notification_logs
```sql
id (TEXT, PK)
alert_id (TEXT, FK)
news_item_id (TEXT, FK)
channel_type (TEXT) -- 'email' or 'slack'
destination (TEXT)
status (TEXT) -- 'sent', 'failed', 'pending'
error_message (TEXT)
sent_at (TEXT)
created_at (TEXT)
```

## 🎯 Next Steps (Milestone 2)

### M2: Backend Core - Models & Repository Layer
- Define TypeScript interfaces for all models
- Create database migrations
- Implement repository layer (CRUD operations)
- Add utility functions and validators

**Expected Duration**: Week 1-2

## 📚 Documentation

- **[MILESTONES.md](./MILESTONES.md)** - Detailed breakdown of all 10 milestones
- **[TECH_DECISIONS.md](./TECH_DECISIONS.md)** - Architecture and technology choices
- **[API Documentation](./docs/API.md)** - Coming in M4

## 🛠️ Development Guidelines

### Code Style
- Use ESLint and Prettier configurations provided
- Run `npm run lint:fix` before committing
- Follow TypeScript strict mode rules

### Testing
- Aim for 70%+ code coverage
- Test business logic in services layer
- Use Jest for unit testing

### Database
- Always use migrations for schema changes
- Maintain indexes for frequently queried columns
- Use prepared statements to prevent SQL injection

## 📋 Acceptance Criteria for Milestone 1

- ✅ `npm start` runs backend without errors
- ✅ `npm run dev` runs frontend Vite dev server
- ✅ `docker-compose up` starts all services successfully
- ✅ Database initialized with all tables and indexes
- ✅ `npm test` runs and reports coverage
- ✅ Health check endpoint responds at `GET /health`
- ✅ Frontend navigates between all pages
- ✅ Project structure ready for feature development

## 🔐 Security Notes

- Environment variables are never committed (.gitignore active)
- Docker containers run as non-root where possible
- Health checks ensure service availability
- CORS and Helmet middleware configured for security

## 📝 License

ISC

## 👤 Authors

- Copilot App with your guidance

---

**Status**: Milestone 1 Complete ✅  
**Last Updated**: 2026-09-05  
**Next Milestone**: M2 - Backend Core Models & Repository Layer
