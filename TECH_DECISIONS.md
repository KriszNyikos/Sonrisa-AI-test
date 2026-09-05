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

### Docker Networking Architecture

The application uses **Docker networks** to enable secure inter-service communication:
- Services communicate via internal DNS (e.g., `backend:3000` from frontend container)
- Exposed ports are configurable via `.env` file for flexibility across environments
- Isolates internal traffic from external access

### Environment Configuration

#### Root `.env` file (Docker Compose)
```env
# Backend Configuration
BACKEND_PORT=3000
BACKEND_ENV=development
DB_PATH=/app/data/alerts.db

# Frontend Configuration
FRONTEND_PORT=5173
FRONTEND_ENV=development

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

  frontend:
    build: ./frontend
    container_name: alert-frontend
    ports:
      - "${FRONTEND_PORT}:80"
    environment:
      - NODE_ENV=${FRONTEND_ENV}
      - VITE_API_URL=${VITE_API_URL}
    networks:
      - alert-network
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80"]
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

**Backend (Node.js)**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built TypeScript
COPY dist ./dist

# Create data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/app.js"]
```

**Frontend (Vue 3 + Nginx)**
```dockerfile
# Build stage
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration (frontend/nginx.conf)
```nginx
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
  gzip on;

  server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;

    location / {
      try_files $uri $uri/ /index.html;
    }

    location /api {
      proxy_pass http://backend:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
  }
}
```

### Running the Application

```bash
# Clone the repository
git clone <repo>
cd Sonrisa-AI-test

# Copy and configure environment variables
cp .env.example .env
# Edit .env to customize ports if needed

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up volumes (careful!)
docker-compose down -v
```

### Example `.env.example`
```env
# Host ports for local access
BACKEND_PORT=3000
FRONTEND_PORT=5173

# Environment
BACKEND_ENV=development
FRONTEND_ENV=development

# Database
DB_PATH=/app/data/alerts.db

# Backend URL for frontend (container-to-container)
VITE_API_URL=http://backend:3000

# Optional services
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

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
