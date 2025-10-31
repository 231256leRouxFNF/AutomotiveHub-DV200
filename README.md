
## Project Overview

AutoHub is a full-stack web application for automotive marketplace and community features. The project is structured as a monorepo with separate frontend (React) and backend (Node.js/Express) applications.

## Development Commands

### Backend Development (autohub/backend/)
```bash
# Install dependencies
cd autohub/backend && npm install

# Start development server (uses nodemon for auto-reload)
cd autohub/backend && npm run dev

# Start production server
cd autohub/backend && node server.js

# Test database connection
curl http://localhost:5000/test-db
```

### Frontend Development (autohub/frontend/)
```bash
# Install dependencies
cd autohub/frontend && npm install

# Start development server (runs on port 3000)
cd autohub/frontend && npm start

# Build for production
cd autohub/frontend && npm run build

# Run tests
cd autohub/frontend && npm test
```

### Full Stack Development
```bash
# Run both frontend and backend simultaneously (from project root)
# Backend: http://localhost:5000
# Frontend: http://localhost:3000

# Terminal 1 - Backend
cd autohub/backend && npm run dev

# Terminal 2 - Frontend  
cd autohub/frontend && npm start
```

## Architecture Overview

### Backend Architecture (Node.js/Express)
- **Entry Point**: `autohub/backend/server.js` - Main Express server with all API routes
- **Database**: MySQL connection configured in `autohub/backend/config/db.js`
- **Authentication**: JWT-based auth with bcrypt password hashing
- **API Structure**: RESTful endpoints with `/api/` prefix
- **Database Setup**: Expects XAMPP/MySQL running locally with `autohub_db` database

### Frontend Architecture (React)
- **Entry Point**: `autohub/frontend/src/App.js` - Main React router configuration
- **Routing**: React Router with comprehensive page routing
- **Components**: Reusable components in `src/components/`
- **Pages**: Full page components in `src/pages/`
- **Styling**: Component-specific CSS files co-located with components
- **UI Framework**: Bootstrap + Material-UI integration

### Key Backend API Endpoints
- `POST /api/login` - User authentication (accepts username or email)
- `GET /api/listings` - Marketplace listings with filtering/search
- `GET /api/featured-listings` - Featured marketplace items
- `GET /api/categories` - Vehicle/parts categories
- `GET /api/posts` - Community feed posts
- `GET /api/messages` - User messaging system
- `GET /api/notifications` - User notifications

### Frontend Page Structure
- **Authentication**: LoginPage, RegisterPage
- **Core Features**: Marketplace, CommunityFeed, VehicleManagement
- **User Management**: UserProfile, Settings, Messages, NotificationsCenter
- **Commerce**: Cart, Orders, Favorites, Compare
- **Selling**: CreateListingWizard, MyListings, SellerDashboard
- **Admin**: AdminDashboard

## Database Requirements

The application requires a MySQL database named `autohub_db` running locally. The backend expects:
- Host: localhost
- User: root  
- Password: (blank - XAMPP default)
- Database: autohub_db

Key database tables (inferred from API endpoints):
- `users` - User accounts with authentication
- `listings` - Marketplace items/vehicles
- `categories` - Item categories with icons
- `posts` - Community feed content
- `messages` / `message_threads` - User messaging
- `notifications` - User notifications
- `orders` - Purchase history
- `cart_items` - Shopping cart

## Environment Configuration

### Backend Environment Variables
Required in `autohub/backend/.env`:
- `JWT_SECRET` - JWT token signing secret

### Frontend Proxy Configuration
The frontend makes API calls to relative paths (e.g., `/api/listings`), expecting a proxy to the backend server during development.

## Development Workflow

1. **Database Setup**: Ensure MySQL is running with `autohub_db` database created
2. **Backend First**: Start the backend server to handle API requests
3. **Frontend Development**: Start React dev server with backend proxy
4. **Hot Reload**: Both servers support hot reloading for development
5. **API Testing**: Use backend test endpoints like `/test-db` to verify connectivity

## Component Architecture Patterns

### React Components
- **Header Component**: Navigation with dropdown menus for Buy/Sell/Account/Support
- **Reusable Components**: Logo, SearchBox, Footer, StatCard, LoginSection, RegisterForm
- **Page Components**: Full-page views with their own routing and state management
- **CSS Co-location**: Each component has its corresponding CSS file

### Backend Patterns
- **Error Handling**: Graceful handling of missing database tables (returns empty arrays)
- **Authentication**: Flexible login accepting username or email identifiers  
- **Query Patterns**: Parameterized queries to prevent SQL injection
- **API Response Format**: Consistent JSON responses with error handling

## Technology Stack

**Frontend:**
- React 19.1.1 with React Router DOM
- Material-UI + Emotion for styling
- Bootstrap for layout
- Axios for HTTP requests
- Testing Library for unit tests

**Backend:**
- Express.js 5.1.0
- MySQL2 for database connectivity
- bcrypt for password hashing
- jsonwebtoken for authentication
- CORS enabled for frontend communication
- nodemon for development auto-reload
