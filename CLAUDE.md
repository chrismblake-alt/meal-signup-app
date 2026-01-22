# CLAUDE.md - AI Assistant Guide for Meal Signup App

## Project Overview

**Project Name:** Meal Signup App
**Repository:** chrismblake-alt/meal-signup-app
**Type:** Web Application (to be determined based on initial implementation)
**Purpose:** Application for managing meal signups, reservations, or meal planning

## Current Status

**⚠️ NEW PROJECT**: This repository is currently empty and awaiting initial setup. The project structure, technology stack, and architecture are yet to be determined.

## Development Workflow

### Branch Strategy

- **Feature Branches**: All AI development should occur on branches prefixed with `claude/`
- **Current Branch**: `claude/claude-md-mkpq6g4rfo2pjy6j-3I27v`
- **Main Branch**: TBD (likely `main` or `master`)

### Git Practices

1. **Always work on designated claude/ branches**
2. **Commit frequently** with clear, descriptive messages
3. **Push format**: `git push -u origin <branch-name>`
4. **Branch naming**: Must start with `claude/` and end with matching session ID
5. **Network retry policy**: Retry git operations up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Commit Message Conventions

Use conventional commit format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `style:` - Formatting changes

Example: `feat: add user authentication to meal signup flow`

## Project Structure (To Be Established)

When setting up this project, consider these common structures:

### Option 1: Full-Stack JavaScript/TypeScript
```
meal-signup-app/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React/Vue/Angular components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Backend application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── server.ts      # Entry point
│   └── package.json
├── shared/                # Shared types/utilities
├── docs/                  # Documentation
├── tests/                 # Integration tests
└── package.json           # Root package.json
```

### Option 2: Monolithic Web App
```
meal-signup-app/
├── src/
│   ├── components/
│   ├── pages/
│   ├── api/
│   ├── lib/
│   └── styles/
├── public/
├── tests/
└── package.json
```

### Option 3: Backend + Separate Frontend
```
meal-signup-app/
├── backend/
│   └── (Python/Node.js/Go/etc.)
├── frontend/
│   └── (React/Vue/Next.js/etc.)
└── docker-compose.yml
```

## Technology Stack Considerations

### Frontend Options
- **React** (with TypeScript) - Component-based UI
- **Next.js** - Full-stack React framework
- **Vue.js** - Progressive framework
- **Svelte** - Compiler-based framework

### Backend Options
- **Node.js + Express** - JavaScript/TypeScript backend
- **Next.js API Routes** - Serverless functions
- **Python + FastAPI/Flask** - Python backend
- **Go + Gin** - High-performance backend

### Database Options
- **PostgreSQL** - Relational database for structured data
- **MongoDB** - NoSQL for flexible schemas
- **SQLite** - Lightweight for development
- **Supabase/Firebase** - Backend-as-a-Service

### Authentication
- **NextAuth.js** - Authentication for Next.js
- **Auth0** - Third-party authentication
- **Passport.js** - Node.js authentication
- **Supabase Auth** - Built-in authentication

## Key Features to Implement

Based on "Meal Signup App", likely features include:

1. **User Management**
   - User registration and authentication
   - Profile management
   - Role-based access (admin, user)

2. **Meal Management**
   - Create/edit/delete meal options
   - Schedule meals by date/time
   - Set capacity limits
   - Meal categorization

3. **Signup System**
   - Browse available meals
   - Sign up for meals
   - Cancel signups
   - Waitlist management
   - Deadline enforcement

4. **Admin Dashboard**
   - View all signups
   - Export signup lists
   - Send notifications
   - Analytics and reporting

5. **Notifications**
   - Email confirmations
   - Reminders
   - Cancellation notices

## Development Best Practices

### Code Quality

1. **Type Safety**: Use TypeScript for better code quality
2. **Linting**: Set up ESLint/Prettier for consistent formatting
3. **Testing**: Write unit and integration tests
4. **Documentation**: Document complex logic and APIs
5. **Security**: Never commit secrets, use environment variables

### Security Considerations

- Validate all user inputs
- Implement proper authentication and authorization
- Use parameterized queries to prevent SQL injection
- Implement rate limiting
- Sanitize user-generated content (XSS prevention)
- Use HTTPS in production
- Keep dependencies updated

### Performance

- Implement pagination for large lists
- Use database indexing appropriately
- Optimize images and assets
- Implement caching where appropriate
- Use lazy loading for components

### Accessibility

- Use semantic HTML
- Implement keyboard navigation
- Add ARIA labels where needed
- Ensure color contrast meets WCAG standards
- Test with screen readers

## Environment Configuration

### Required Environment Variables (Template)

```env
# Database
DATABASE_URL=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

# Authentication
JWT_SECRET=
SESSION_SECRET=
AUTH_PROVIDER_CLIENT_ID=
AUTH_PROVIDER_CLIENT_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=

# Application
NODE_ENV=development|production
PORT=3000
API_URL=
FRONTEND_URL=

# Optional
REDIS_URL=
CLOUDINARY_URL=
```

## API Design Conventions

### RESTful Endpoints (Example)

```
GET    /api/meals              # List all meals
GET    /api/meals/:id          # Get meal details
POST   /api/meals              # Create meal (admin)
PUT    /api/meals/:id          # Update meal (admin)
DELETE /api/meals/:id          # Delete meal (admin)

GET    /api/signups            # List user's signups
POST   /api/signups            # Sign up for meal
DELETE /api/signups/:id        # Cancel signup

GET    /api/users/me           # Get current user
PUT    /api/users/me           # Update profile

POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login
POST   /api/auth/logout        # Logout
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-01-22T17:30:00Z"
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...]
  },
  "timestamp": "2026-01-22T17:30:00Z"
}
```

## Testing Strategy

### Test Types

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API endpoints and database operations
3. **E2E Tests**: Test complete user flows
4. **Accessibility Tests**: Test with axe-core or similar tools

### Testing Tools (Recommendations)

- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Cypress/Playwright** - E2E testing
- **Supertest** - API testing
- **MSW (Mock Service Worker)** - API mocking

## Database Schema (Example)

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Meals Table
```sql
CREATE TABLE meals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  capacity INTEGER NOT NULL,
  location VARCHAR(255),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Signups Table
```sql
CREATE TABLE signups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  meal_id INTEGER REFERENCES meals(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, meal_id)
);
```

## AI Assistant Guidelines

### When Starting a New Task

1. **Read First**: Always read relevant files before making changes
2. **Plan**: Use TodoWrite tool for complex multi-step tasks
3. **Search**: Use Explore agent for understanding codebase structure
4. **Context**: Understand the full context before proposing solutions

### Code Modification Principles

1. **Minimal Changes**: Only change what's necessary
2. **No Over-Engineering**: Avoid adding unnecessary abstractions
3. **Security First**: Check for vulnerabilities (XSS, SQL injection, etc.)
4. **Consistency**: Follow existing patterns in the codebase
5. **No Backwards Compatibility Hacks**: Delete unused code completely

### What NOT to Do

- Don't add features beyond what's requested
- Don't refactor code unless specifically asked
- Don't add comments to unchanged code
- Don't create abstractions for one-time operations
- Don't commit secrets or sensitive data
- Don't use force push to main/master
- Don't skip git hooks (--no-verify)

### Communication Style

- Be concise and technical
- Use file references with line numbers (e.g., `src/app.ts:42`)
- Avoid emojis unless requested
- Focus on facts over validation
- Admit uncertainty rather than guess

## Deployment Considerations

### Deployment Platforms (Options)

- **Vercel** - Ideal for Next.js applications
- **Netlify** - Static sites and serverless functions
- **Railway** - Full-stack applications with databases
- **Render** - Web services, databases, cron jobs
- **AWS/GCP/Azure** - Full control, more complex
- **Docker** - Containerized deployment

### Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Build succeeds without errors
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Error monitoring set up (Sentry, LogRocket, etc.)
- [ ] Analytics configured (if needed)
- [ ] Backup strategy in place
- [ ] SSL certificate configured

## Project Initialization Checklist

When first setting up this project, complete these tasks:

- [ ] Decide on technology stack
- [ ] Initialize package.json with dependencies
- [ ] Set up project structure
- [ ] Configure TypeScript (if using)
- [ ] Set up ESLint and Prettier
- [ ] Initialize database and create schema
- [ ] Set up authentication system
- [ ] Create .env.example file
- [ ] Set up testing framework
- [ ] Create basic README.md
- [ ] Set up CI/CD pipeline
- [ ] Configure git hooks (husky)
- [ ] Create initial components/pages
- [ ] Set up API routes
- [ ] Implement error handling
- [ ] Add logging system

## Common Commands (To Be Updated)

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests

# Code Quality
npm run lint         # Run linter
npm run format       # Format code
npm run type-check   # Check TypeScript types

# Database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:reset     # Reset database
```

## Resources and Documentation

### Official Documentation Links (To Be Added)
- Framework documentation
- Database documentation
- Deployment platform docs
- Third-party service docs

### Internal Documentation
- API documentation (when created)
- Component library (when created)
- Architecture decision records (ADRs)
- Troubleshooting guide

## Troubleshooting

### Common Issues

**Issue**: Git push fails with 403 error
**Solution**: Ensure branch name starts with `claude/` and ends with session ID

**Issue**: Dependencies won't install
**Solution**: Delete node_modules and package-lock.json, then reinstall

**Issue**: Database connection fails
**Solution**: Check DATABASE_URL environment variable and database service status

**Issue**: Tests failing in CI but passing locally
**Solution**: Check environment-specific configurations and CI environment variables

## Change Log

### Version History

**2026-01-22** - Initial CLAUDE.md created
- Established project guidelines and conventions
- Defined potential project structures
- Set up AI assistant development practices

---

## Notes for AI Assistants

This document should be updated as the project evolves. Key things to update:

1. **Technology Stack**: Once decided, remove alternatives and document the chosen stack
2. **Project Structure**: Update with actual directory structure
3. **Common Commands**: Add actual npm scripts once package.json is created
4. **API Endpoints**: Document actual endpoints as they're implemented
5. **Database Schema**: Update with actual schema as it's developed
6. **Environment Variables**: Update with actual required variables
7. **Deployment Info**: Add actual deployment platform and process

Always keep this document in sync with the current state of the project.
