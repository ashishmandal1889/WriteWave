# WriteWave

> **Your Ideas. Your Audience. Your Publication.**

WriteWave is an independent publishing platform inspired by the editorial and distribution experience of Substack. Writers can launch independent publications, publish serialized long-form articles, cultivate direct relationships with subscribers through newsletters, and engage directly with readers.

---

## 1. Core Platform Capabilities

- **Independent Publications**: Launch branded publications with custom slugs, categories, descriptions, and subscriber bases.
- **Long-Form Article Editor**: Focus-driven writing studio with rich text formatting tools (headings, quotes, bold, italic, lists, links), draft preservation, cover image support, and free/premium reader tiering.
- **Direct Audience & Newsletter Subscriptions**: Readers subscribe directly to individual publications using their email, backed by transactional confirmation workflows.
- **Reader Engagement & Discussion**: Threaded article discussions, real-time likes, saved article bookmarks, and writer follows.
- **Real-Time Writer Dashboard**: Comprehensive analytics powered by live MongoDB aggregation metrics (subscribers, views, likes, comments, published articles, drafts).
- **Public Writer Profiles**: Editorial author pages featuring verified publications, published story archive, follower counts, and author biographies.
- **Strict Plain-Text UI / Zero Symbol Rule**: A distraction-free editorial aesthetic using only plain-text navigation, buttons, and badges.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js (v19) + Vite
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios (configured with token interceptors and centralized error handling)
- **Styling**: Pure CSS3 with CSS Custom Properties, serif editorial typography, and mobile-responsive layouts

### Backend
- **Runtime**: Node.js (LTS)
- **Framework**: Express.js (ES Modules)
- **Database & ODM**: MongoDB / MongoDB Atlas via Mongoose
- **Authentication**: JSON Web Tokens (JWT) with bcryptjs password hashing
- **Validation**: express-validator and Mongoose schema validators
- **CORS & Environment**: cors, dotenv

---

## 3. Design System & Theme

| Element | Color Code | Purpose |
|---|---|---|
| **Primary** | `#2563EB` | Accents, primary buttons, active links, branding |
| **Background** | `#F8FAFC` | App canvas background |
| **Cards** | `#FFFFFF` | Article cards, publication cards, forms, modules |
| **Text** | `#172033` | Headings, reading body text, primary labels |
| **Secondary** | `#64748B` | Subtitles, metadata, dates, secondary actions |

### Editorial Typography
- **Headlines**: Editorial Serif (`Georgia`, `Newsreader`, `serif`)
- **Body & Interface**: Sans-Serif (`Plus Jakarta Sans`, `Inter`, `sans-serif`)

---

## 4. Project Directory Structure

```text
WriteWave/
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection (db.js)
│   │   ├── controllers/        # Express request controllers
│   │   │   ├── articleController.js
│   │   │   ├── authController.js
│   │   │   ├── bookmarkController.js
│   │   │   ├── commentController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── healthController.js
│   │   │   ├── likeController.js
│   │   │   ├── publicationController.js
│   │   │   ├── subscriptionController.js
│   │   │   └── userController.js
│   │   ├── middleware/         # Auth (JWT) & error handling middleware
│   │   ├── models/             # Mongoose schemas (User, Publication, Article, etc.)
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Email service interface
│   │   ├── utils/              # AppError and asyncHandler helpers
│   │   └── app.js              # Express app configuration
│   ├── server.js               # Server entry point
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Cards, etc.)
│   │   ├── context/            # React AuthContext and authentication state
│   │   ├── hooks/              # Custom hooks (useAuth)
│   │   ├── layouts/            # MainLayout (header, main container, footer)
│   │   ├── pages/              # Platform pages
│   │   │   ├── ArticleDetail/  # Editorial article reading view with discussion
│   │   │   ├── ArticleEditor/  # Long-form writing editor with live preview
│   │   │   ├── Auth/           # Login and Register pages
│   │   │   ├── Bookmarks/      # Saved articles reading list
│   │   │   ├── CreatePublication/ # Publication launch studio
│   │   │   ├── Explore/        # Search and discover stories & publications
│   │   │   ├── Home/           # Hero, featured publications, latest stories
│   │   │   ├── PublicationHome/# Branded publication homepage & newsletter box
│   │   │   ├── Publications/   # Publications directory
│   │   │   ├── Subscriptions/  # Active newsletter subscriptions list
│   │   │   ├── WriterDashboard/# Analytics, story management, profile settings
│   │   │   ├── WriterProfile/  # Public writer profile with archive
│   │   │   └── NotFound/       # 404 error page
│   │   ├── services/           # API integration clients (Axios)
│   │   ├── styles/             # Global CSS variables and base styles
│   │   ├── utils/              # Formatting helpers (date, reading time)
│   │   ├── App.jsx             # Route configuration
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
│
└── README.md
```

---

## 5. API Reference (`/api/v1`)

### Health
- `GET /api/v1/health` - Server health status

### Authentication
- `POST /api/v1/auth/register` - Register new writer account
- `POST /api/v1/auth/login` - Authenticate writer and issue JWT
- `GET /api/v1/auth/me` - Get current authenticated user profile
- `POST /api/v1/auth/logout` - Clear authentication token

### Publications
- `GET /api/v1/publications` - List publications (search & category filters)
- `GET /api/v1/publications/categories` - Distinct categories
- `GET /api/v1/publications/my` - Publications owned by authenticated writer
- `GET /api/v1/publications/:slug` - Publication masthead and articles
- `POST /api/v1/publications` - Launch new publication
- `PUT /api/v1/publications/:id` - Update publication
- `DELETE /api/v1/publications/:id` - Delete publication

### Articles
- `GET /api/v1/articles` - List published articles (search & category filters)
- `GET /api/v1/articles/my` - Writer's published articles
- `GET /api/v1/articles/drafts` - Writer's drafts
- `GET /api/v1/articles/:slugOrId` - Read article by slug or ID
- `POST /api/v1/articles` - Create draft or publish story
- `PUT /api/v1/articles/:id` - Update article
- `DELETE /api/v1/articles/:id` - Delete article

### Subscriptions & Newsletters
- `POST /api/v1/subscriptions` - Subscribe email to a publication
- `POST /api/v1/subscriptions/unsubscribe` - Unsubscribe email
- `GET /api/v1/subscriptions/my` - List current user's active subscriptions
- `GET /api/v1/subscriptions/publication/:publicationId` - View subscriber list (owner only)

### Engagement & Community
- `POST /api/v1/likes/article/:articleId` - Toggle article like
- `POST /api/v1/bookmarks/:articleId` - Toggle article bookmark
- `GET /api/v1/bookmarks/my` - List user's saved articles
- `GET /api/v1/comments/article/:articleId` - List article comments
- `POST /api/v1/comments/article/:articleId` - Post new comment
- `DELETE /api/v1/comments/:commentId` - Delete comment

### Writer Dashboard & Profiles
- `GET /api/v1/dashboard/overview` - Aggregate metrics (subscribers, views, likes, comments, drafts)
- `GET /api/v1/users/profile/:usernameOrId` - Public writer profile
- `PUT /api/v1/users/profile` - Update bio, pen name, or handle
- `POST /api/v1/users/:id/follow` - Follow/unfollow writer
- `GET /api/v1/users/recommended` - Recommended writers list

---

## 6. Local Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB instance (local or MongoDB Atlas connection string)

### 1. Clone the repository
```bash
git clone https://github.com/ashishmandal1889/WriteWave.git
cd WriteWave
```

### 2. Configure Backend
```bash
cd backend
npm install
cp .env.example .env
```
Update `.env` with your settings:
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
API_PREFIX=/api/v1
MONGODB_URI=mongodb://127.0.0.1:27017/writewave
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

Start the backend development server:
```bash
npm run dev
```

### 3. Configure Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 7. Render Deployment Instructions (Single Hosting Platform)

WriteWave is configured for single-platform deployment on **Render**, hosting both the frontend Static Site and backend Web Service.

### Option A: Automated Deployment with Render Blueprints (`render.yaml`)

The repository includes a root `render.yaml` blueprint defining both services and SPA rewrite rules.

1. Push your repository to GitHub.
2. Go to the [Render Dashboard](https://dashboard.render.com/).
3. Click **New** > **Blueprint**.
4. Select your **WriteWave** repository.
5. Render will detect `render.yaml` and configure both services:
   - `writewave-backend` (Web Service)
   - `writewave-frontend` (Static Site)
6. Fill in the required environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/writewave?retryWrites=true&w=majority`)
   - `CLIENT_URL`: URL of your deployed frontend (e.g. `https://writewave-frontend.onrender.com`)
   - `VITE_API_URL`: URL of your deployed backend API (e.g. `https://writewave-backend.onrender.com/api/v1`)
7. Click **Apply**.

---

### Option B: Manual Render Dashboard Setup

#### 1. Deploy the Backend Web Service
1. In Render Dashboard, click **New** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `writewave-backend`
   - **Region**: Select your preferred region (e.g., Oregon / Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/v1/health`
4. Add Environment Variables under **Environment**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `API_PREFIX`: `/api/v1`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A long random secret string (e.g., generated with `openssl rand -hex 32`)
   - `CLIENT_URL`: Your deployed frontend URL (e.g. `https://writewave-frontend.onrender.com`)
   - `JWT_EXPIRES_IN`: `7d`
5. Click **Create Web Service** and wait for deployment to complete.
6. Copy the assigned service URL (e.g., `https://writewave-backend.onrender.com`).

#### 2. Deploy the Frontend Static Site
1. In Render Dashboard, click **New** > **Static Site**.
2. Connect your GitHub repository.
3. Configure the site settings:
   - **Name**: `writewave-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://writewave-backend.onrender.com/api/v1` (replace with your backend's actual onrender.com URL)
5. Configure SPA Fallback Routing:
   - Under **Redirects/Rewrites**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   - *(WriteWave also automatically builds `_redirects` in `dist` for full redundancy)*.
6. Click **Create Static Site**.
7. Once deployed, copy your frontend URL and ensure it matches the `CLIENT_URL` configured in the backend environment variables.

---

## 8. License

This project is licensed under the MIT License.
