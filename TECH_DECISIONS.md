# Alert System - Technical Decisions

## 1. Project Scope & Boundaries

### Core Features
- **Alert Configuration**: Users can create alerts with custom rules/filters
- **Multi-Channel Notifications**: Email and Slack support with extensible architecture
- **News Feed**: Real-time/mocked breaking news data
- **Admin Dashboard**: View, manage, and monitor all alerts system-wide

### Out of Scope (Phase 1)
- User authentication/authorization (can be added later)
- Complex alert logic/conditions (start simple: keyword-based)
- Alert history/analytics
- Mobile notifications

---

## 2. Architecture Overview

### Layered Architecture Pattern

```
Backend (Express.js + TypeScript)
├── Controllers/Routes      (HTTP request handling)
├── Services               (Business logic)
├── Data Access Layer      (Database queries)
├── Models/Interfaces      (Type definitions)
└── Utilities             (Helpers, validators)

Frontend (Vue 3 + Composition API)
├── Pages                  (Views)
├── Components            (Reusable UI components)
├── Composables           (Logic composition)
├── Services             (API calls)
└── Types                (TypeScript interfaces)

Database (SQLite)
└── Three main tables: alerts, notifications, news_feed
```

---

## 3. Data Models & Interfaces

### Backend Interfaces (TypeScript)

#### Alert Model
```typescript
interface Alert {
  id: string;
  userId?: string;              // Optional for Phase 1
  name: string;
  description?: string;
  keywords: string[];           // Keywords to match in news
  channels: NotificationChannel[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationChannel {
  type: 'email' | 'slack';
  destination: string;          // email address or Slack webhook URL
  isEnabled: boolean;
}
```

#### News Feed Model
```typescript
interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'breaking_news' | 'market' | 'disaster' | 'other';
  timestamp: Date;
  source?: string;
}
```

#### Notification Log Model
```typescript
interface NotificationLog {
  id: string;
  alertId: string;
  newsItemId: string;
  channel: 'email' | 'slack';
  destination: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  sentAt?: Date;
  createdAt: Date;
}

interface NotificationPayload {
  alertId: string;
  newsItem: NewsItem;
  destination: string;
  channel: 'email' | 'slack';
}
```

#### API Response Envelopes
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## 4. Database Schema (SQLite)

### Table: `alerts`
```sql
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  keywords TEXT NOT NULL,              -- JSON array: ["keyword1", "keyword2"]
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `notification_channels`
```sql
CREATE TABLE notification_channels (
  id TEXT PRIMARY KEY,
  alert_id TEXT NOT NULL,
  type TEXT NOT NULL,                  -- 'email' | 'slack'
  destination TEXT NOT NULL,           -- email or webhook URL
  is_enabled BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
);
```

### Table: `news_feed`
```sql
CREATE TABLE news_feed (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'other',       -- 'breaking_news', 'market', 'disaster', 'other'
  source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `notification_logs`
```sql
CREATE TABLE notification_logs (
  id TEXT PRIMARY KEY,
  alert_id TEXT NOT NULL,
  news_item_id TEXT NOT NULL,
  channel TEXT NOT NULL,               -- 'email' | 'slack'
  destination TEXT NOT NULL,
  status TEXT DEFAULT 'pending',       -- 'sent', 'failed', 'pending'
  error_message TEXT,
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES alerts(id),
  FOREIGN KEY (news_item_id) REFERENCES news_feed(id)
);
```

### Indexes
```sql
CREATE INDEX idx_alerts_active ON alerts(is_active);
CREATE INDEX idx_channels_alert ON notification_channels(alert_id);
CREATE INDEX idx_news_created ON news_feed(created_at);
CREATE INDEX idx_logs_alert ON notification_logs(alert_id);
CREATE INDEX idx_logs_status ON notification_logs(status);
```

---

## 5. Backend Architecture & Patterns

### Project Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── alertController.ts
│   │   ├── newsController.ts
│   │   └── adminController.ts
│   ├── services/
│   │   ├── alertService.ts
│   │   ├── notificationService.ts
│   │   ├── newsService.ts
│   │   └── matchingEngine.ts
│   ├── repositories/
│   │   ├── alertRepository.ts
│   │   ├── newsRepository.ts
│   │   └── notificationLogRepository.ts
│   ├── models/
│   │   ├── types.ts              (Shared interfaces)
│   │   ├── Alert.ts
│   │   └── NewsItem.ts
│   ├── utils/
│   │   ├── database.ts           (SQLite connection)
│   │   ├── validators.ts
│   │   ├── logger.ts
│   │   └── idGenerator.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   ├── config/
│   │   └── index.ts
│   ├── routes/
│   │   ├── alerts.ts
│   │   ├── news.ts
│   │   └── admin.ts
│   └── app.ts                    (Express app setup)
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── utils/
│   └── integration/
├── package.json
├── tsconfig.json
├── jest.config.js
└── Dockerfile
```

### Service Layer Pattern

**AlertService** responsibilities:
- Create/update/delete alerts
- Validate alert configuration
- Retrieve alerts for dashboard

**NotificationService** responsibilities:
- Determine which alerts match incoming news
- Format notification payloads
- Send via Email/Slack channels
- Handle retry logic

**NewsService** responsibilities:
- Generate/fetch mocked news items
- Store in database
- Trigger matching and notification flow

**MatchingEngine** responsibilities:
- Match keywords in news content
- Simple keyword matching (case-insensitive, substring match)
- Extensible for complex rules later

### Request/Response Flow

```
HTTP Request → Controller → Service → Repository → Database
                    ↓
            Response Model (ApiResponse<T>)
                    ↓
              JSON Response
```

### Error Handling
- Consistent error response format with HTTP status codes
- Validation errors: 400 Bad Request
- Not found: 404 Not Found
- Server errors: 500 Internal Server Error
- Try-catch wrapping in services; logging all errors

---

## 6. Frontend Architecture (Vue 3 + Composition API)

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── AlertForm.vue         (Create/edit alert)
│   │   ├── AlertList.vue         (Display alerts)
│   │   ├── NewsCard.vue          (Single news item)
│   │   ├── NotificationSettings.vue
│   │   └── AdminDashboard.vue
│   ├── pages/
│   │   ├── AlertsPage.vue        (User alerts)
│   │   ├── NewsPage.vue          (News feed)
│   │   └── AdminPage.vue         (Admin dashboard)
│   ├── composables/
│   │   ├── useAlerts.ts          (Alert CRUD logic)
│   │   ├── useNews.ts            (News fetching)
│   │   └── useFetch.ts           (Shared fetch wrapper)
│   ├── services/
│   │   ├── api.ts                (Base API client)
│   │   ├── alertApi.ts
│   │   ├── newsApi.ts
│   │   └── adminApi.ts
│   ├── types/
│   │   ├── alerts.ts
│   │   ├── news.ts
│   │   └── common.ts
│   ├── App.vue
│   └── main.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile
```

### Composable Pattern (Composition API)
```typescript
// useAlerts.ts
export function useAlerts() {
  const alerts = ref<Alert[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchAlerts = async () => {
    loading.value = true;
    try {
      alerts.value = await alertApi.getAlerts();
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  const createAlert = async (alert: AlertInput) => {
    // ...
  };

  return { alerts, loading, error, fetchAlerts, createAlert };
}
```

### Key Pages
- **Alerts Page**: List user alerts, create/edit/delete, enable/disable
- **News Feed Page**: Display latest news, filter by category
- **Admin Dashboard**: System-wide alert management, notification logs, statistics

---

## 7. Notification Flow & Data Flow

### Alert Trigger Flow
```
1. News Item Created
      ↓
2. NewsService.createNews() stores to DB
      ↓
3. Emit event or call NotificationService.processNewItem()
      ↓
4. MatchingEngine.matchKeywords(newsItem, allAlerts)
      ↓
5. For each matching Alert:
   - Get enabled notification channels
   - Create NotificationPayload
   - Queue for sending (or send synchronously)
      ↓
6. Channel-specific Sender (EmailSender, SlackSender)
      ↓
7. Log result in notification_logs table
      ↓
8. Update notification status (sent/failed)
```

### Component Interaction Diagram
```
NewsService ─┐
             ├─→ MatchingEngine ─→ NotificationService ─┐
AlertService─┘                                         ├─→ EmailSender
                                                        ├─→ SlackSender
                                                        └─→ NotificationLogger
```

---

## 8. Notification Channels Implementation

### Email Notifications
- **Library**: `nodemailer` (or similar)
- **Configuration**: SMTP settings (can use test account like Ethereal for dev)
- **Template**: Simple text/HTML template with news details
- **Retry**: Implement exponential backoff on failure

### Slack Notifications
- **Method**: Incoming Webhooks
- **Payload**: Formatted message with news title, category, and link to news feed
- **Format**: Rich message formatting using Slack blocks
- **Retry**: Queue mechanism for failed sends

### Extensible Design
- Abstract `NotificationChannel` interface
- Sender strategy pattern: `EmailSender`, `SlackSender`, etc.
- Add new channels by implementing `Sender` interface

---

## 9. Database & Mocked Data

### Data Generation Strategy
- **News Generator**: Function to randomly generate news items
  - Random titles from templates
  - Random categories (breaking_news, market, disaster, other)
  - Random content with keyword variations
  - Timestamps with slight randomization
  
- **Scheduled Task**: Generate new news items every X minutes (configurable)

### Sample Mock Data
```typescript
const newsTemplates = [
  "Stock Market Surge: {CATEGORY} Up {AMOUNT}%",
  "Breaking: {EVENT} Reported in {LOCATION}",
  "Natural Disaster Alert: {TYPE} Strikes {REGION}",
];

const keywords = {
  market: ["stock", "surge", "crash", "dollar", "crypto"],
  disaster: ["earthquake", "hurricane", "flood", "tornado"],
  breaking_news: ["breaking", "alert", "urgent", "developing"],
};
```

---

## 10. Deployment & Docker

### Docker Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                    │
│               (alert-system-network: 172.28.0.0/16)         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐          ┌──────────────────────────┐ │
│  │  Backend Service │          │  Frontend + Nginx        │ │
│  │  (Node.js)       │◄────────►│  (Vue 3)                 │ │
│  │  :3000 (internal)│          │  :80 (nginx)             │ │
│  └──────────────────┘          └──────────────────────────┘ │
│         ▲                               ▲                    │
│         │                               │                    │
│    ┌────┴─────────────────────────────┬┘                    │
│    │        SQLite Database           │                     │
│    │   (File-based, persisted)        │                     │
│    └────────────────────────────────────┘                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ▲                                    ▲
         │ BACKEND_PORT (3000)               │ FRONTEND_PORT (5173)
         │                                   │
    ┌────┴────────────────────────────────┬─┘
    │         Host Machine                │
    └─────────────────────────────────────┘
```

### Database Strategy: SQLite (File-Based)

SQLite is a **file-based database**, not a service:
- **No separate Docker image needed** - SQLite is embedded in the backend
- **Persisted via Docker volumes**: `./backend/data:/app/data`
- **Shared access**: Backend reads/writes to file system
- **Development advantage**: No separate database setup required
- **Migration**: For production, can migrate to PostgreSQL/MySQL later

### Nginx Strategy: Reverse Proxy & Static Server

Nginx serves two critical functions:
1. **Static File Server**: Serves built Vue 3 frontend (dist folder)
2. **Reverse Proxy**: Routes API requests to backend service
3. **SPA Router**: Falls back to index.html for client-side routing

### Environment Configuration

#### Root `.env` file (Docker Compose)
```env
# Backend Configuration
BACKEND_PORT=3000
BACKEND_ENV=development
DB_PATH=/app/data/alerts.db

# Frontend Configuration
FRONTEND_PORT=5173

# Internal Communication (for containers)
BACKEND_HOST=backend
BACKEND_INTERNAL_URL=http://backend:3000
VITE_API_URL=http://backend:3000

# Email Configuration (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=secret

# Slack Configuration (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Logging
LOG_LEVEL=info
```

### Docker Compose Setup
```yaml
version: '3.8'

services:
  # Backend: Node.js Express API
  backend:
    build: ./backend
    container_name: alert-backend
    ports:
      - "${BACKEND_PORT}:3000"
    environment:
      - NODE_ENV=${BACKEND_ENV}
      - DB_PATH=${DB_PATH}
      - PORT=3000
      - LOG_LEVEL=${LOG_LEVEL}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
    volumes:
      - ./backend/data:/app/data
      - ./backend/src:/app/src
    networks:
      - alert-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend: Nginx serving Vue 3 SPA
  frontend:
    build: ./frontend
    container_name: alert-frontend
    ports:
      - "${FRONTEND_PORT}:80"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro
    networks:
      - alert-network
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  alert-network:
    name: alert-system-network
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

### Dockerfiles

**Backend (Node.js + SQLite)**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built TypeScript
COPY dist ./dist

# Create persistent data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/app.js"]
```

**Frontend (Vue 3 + Nginx Reverse Proxy)**
```dockerfile
# Build stage: Compile Vue 3 with Vite
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage: Nginx serving SPA + API proxy
FROM nginx:alpine

# Copy custom nginx configuration for SPA routing and API proxy
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copy built Vue 3 dist folder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration (frontend/nginx.conf)
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';

  access_log /var/log/nginx/access.log main;
  
  sendfile on;
  tcp_nopush on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  
  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_types text/plain text/css text/xml text/javascript 
             application/json application/javascript application/xml+rss 
             application/rss+xml font/truetype font/opentype 
             application/vnd.ms-fontobject image/svg+xml;

  server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Serve static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
      access_log off;
    }

    # Proxy API requests to backend service
    location /api/ {
      proxy_pass http://backend:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_cache_bypass $http_upgrade;
      proxy_read_timeout 60s;
      proxy_connect_timeout 60s;
    }

    # SPA routing: Fall back to index.html for client-side routing
    location / {
      try_files $uri $uri/ /index.html;
      add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Health check endpoint for Docker
    location /health {
      access_log off;
      return 200 "OK";
      add_header Content-Type text/plain;
    }
  }
}
```

### Frontend Directory Structure
```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.vue
│   └── main.ts
├── dist/                    (Generated by build, served by nginx)
├── package.json
├── Dockerfile              (Multi-stage: build Vue, run nginx)
├── nginx.conf             (IMPORTANT: Nginx config - copied in Dockerfile)
├── tsconfig.json
└── vite.config.ts
```

**Key**: `nginx.conf` must be in the `frontend/` root directory for Docker to copy it during build.

### Running the Application

```bash
# Clone the repository
git clone <repo>
cd Sonrisa-AI-test

# Copy and configure environment variables
cp .env.example .env
# Edit .env to customize ports if needed

# Build and start all services (backend + frontend with nginx)
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Clean up volumes and images (careful!)
docker-compose down -v --rmi all
```

### Accessing the Application

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend (Nginx) | http://localhost:5173 | User UI (default port from .env) |
| Backend API | http://localhost:3000 | REST API endpoints |
| API from Frontend | http://backend:3000 | Internal container communication |
| Health Check | http://localhost:3000/health | Backend health |

### SQLite Database Notes

- **Location**: `./backend/data/alerts.db` (host machine)
- **Persistence**: Docker volume mounts to `/app/data` inside container
- **No external service**: SQLite is file-based, embedded in backend
- **Backup**: Copy `./backend/data/alerts.db` to backup database
- **Reset**: Delete `./backend/data/` folder and restart containers to rebuild schema

### Example `.env.example`
```env
# Host ports for local access
BACKEND_PORT=3000
FRONTEND_PORT=5173

# Environment
BACKEND_ENV=development

# Database (SQLite file path)
DB_PATH=/app/data/alerts.db

# Backend URL for frontend (container-to-container communication)
VITE_API_URL=http://backend:3000

# Optional Email Service
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Optional Slack Webhook
SLACK_WEBHOOK_URL=

# Logging
LOG_LEVEL=info
```

---

## 11. Testing Strategy

### Backend (Jest)

**Unit Tests**
- Services: `alertService.test.ts`, `matchingEngine.test.ts`
- Repositories: Database query logic
- Utils: Validators, formatters, generators

**Integration Tests**
- End-to-end flows: Create alert → Generate news → Send notification

**Test Structure**
```typescript
describe('AlertService', () => {
  describe('createAlert', () => {
    it('should create an alert with valid data', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Frontend (Vue Test Utils + Jest)
- Component rendering tests
- Composable logic tests
- API mocking with `msw` or similar

### Coverage Goals
- Target 70%+ coverage for critical paths
- Focus on business logic (services, utils)
- Less emphasis on UI component coverage

---

## 12. API Endpoints

### Alert Management
```
GET    /api/alerts              - List all alerts
POST   /api/alerts              - Create alert
GET    /api/alerts/:id          - Get alert details
PUT    /api/alerts/:id          - Update alert
DELETE /api/alerts/:id          - Delete alert
```

### News Feed
```
GET    /api/news                - List news items (paginated, filtered)
POST   /api/news                - Create news item (for testing)
GET    /api/news/:id            - Get news details
```

### Admin
```
GET    /api/admin/stats         - System statistics
GET    /api/admin/notifications - Notification logs (filtered)
GET    /api/admin/alerts        - All alerts (admin view)
```

---

## 13. Configuration & Environment Variables

### Backend
```env
NODE_ENV=development
PORT=3000
DB_PATH=./data/alerts.db

# Email (optional for Phase 1)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=secret

# Slack (optional for Phase 1)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Logging
LOG_LEVEL=info

# News Generation
NEWS_GENERATION_INTERVAL=60000  # milliseconds
```

### Frontend
```env
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE="Alert System"
```

---

## 14. Phase 2 Considerations (Future Enhancements)

- User authentication (JWT tokens)
- Per-user alert management and isolation
- Complex alert logic (boolean conditions, regex patterns)
- Alert history and statistics dashboard
- Email and Slack templates customization
- Additional channels: SMS, Telegram, Webhooks
- Rate limiting and throttling
- Alert triggers via external APIs (real news sources)
- Background jobs for notification delivery (Bull, RabbitMQ)
- Notification delivery confirmation
- User preferences (quiet hours, digest emails)

---

## 15. Development Workflow

1. **Setup**: `docker-compose up` starts both services
2. **Backend**: Runs on http://localhost:3000
3. **Frontend**: Runs on http://localhost:5173
4. **Database**: SQLite stored in `backend/data/alerts.db`
5. **Testing**: `npm test` in respective directories
6. **Building**: `npm run build` generates production artifacts

---

## Summary

This alert system is designed as a **scalable, maintainable fullstack application** with:
- ✅ Clean layered architecture
- ✅ Type-safe TypeScript throughout
- ✅ Extensible notification channels
- ✅ Mocked news generation for testing
- ✅ Admin dashboard for system oversight
- ✅ Docker-based deployment
- ✅ Jest unit testing framework
- ✅ Modern Vue 3 Composition API frontend

The architecture supports Phase 2 additions without major refactoring while keeping Phase 1 implementation focused and achievable.
