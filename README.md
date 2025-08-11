# Wezo - Property Rental Platform

A modern property rental platform for villa listings in the UAE, built as a monorepo with separate applications for different user types.

## 🏗️ Project Structure

This is a monorepo managed with npm workspaces, containing:

- **`api-server/`** - Backend API server (Node.js, Express, TypeScript, Prisma, SQLite)
- **`client/homeowner/`** - Frontend for property owners (planned)
- **`client/guest/`** - Frontend for tenants/guests (planned)
- **`client/manager/`** - Management dashboard (planned)
- **`docs/`** - Requirements documentation and UI mockups

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm install
   ```

3. Set up the API server database:
   ```bash
   cd api-server
   npm run db:setup
   cd ..
   ```

4. Start the API server:
   ```bash
   npm run dev:api
   ```

The API will be available at `http://localhost:3000/api`

## 📦 Workspace Commands

Run these commands from the root directory:

| Command | Description |
|---------|-------------|
| `npm install` | Install all workspace dependencies |
| `npm run dev:api` | Start API server in development mode |
| `npm run build:api` | Build API server for production |
| `npm run test:api` | Run API server tests |

## 🔗 API Documentation

The API server provides the following endpoints:

### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/reset` - Reset password
- `GET /api/health` - Health check

### Protected Endpoints
- `GET /api/auth/profile` - Get user profile (requires JWT)

## 🔐 Default Admin Account

After running the seed script, you can log in with:
- **Username:** admin
- **Email:** admin@wezo.ae  
- **Password:** Admin@123456

⚠️ **Important:** Change the admin password after first login!

## 🛠️ Technology Stack

### Backend (api-server)
- TypeScript
- Node.js & Express.js
- Prisma ORM
- SQLite database
- JWT authentication
- Jest for testing

### Frontend (planned)
- To be determined based on requirements

## 📄 License

ISC