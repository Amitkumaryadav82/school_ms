# Development Startup Scripts

This directory contains several scripts to help you start the School Management System development environment.

## Available Scripts

### 🚀 `start-full-dev.sh` (Recommended)
**Complete development environment startup with automatic coordination.**

```bash
./start-full-dev.sh
```

**What it does:**
- ✅ Sets up Java 17
- ✅ Starts backend on port 8080
- ✅ Waits for backend to be ready
- ✅ Installs frontend dependencies (if needed)
- ✅ Starts frontend on port 5173 with proxy to backend
- ✅ Monitors both processes
- ✅ Graceful shutdown with Ctrl+C

**Available services:**
- 🎨 **Frontend**: http://localhost:5173
- 🏗️ **Backend API**: http://localhost:8080
- 🗄️ **H2 Console**: http://localhost:8080/h2-console

---

### 🏗️ `start-dev.sh`
**Backend-only startup (legacy script, updated for coordination)**

```bash
./start-dev.sh
```

**What it does:**
- Sets up Java 17
- Starts backend and frontend in sequence
- Uses dev profile with H2 database

---

### 🎨 `start-frontend.sh`
**Frontend-only startup**

```bash
./start-frontend.sh
```

**What it does:**
- Installs npm dependencies if needed
- Starts Vite dev server on port 5173
- Configures proxy to backend on port 8080

---

## Configuration Details

### Backend Configuration
- **Port**: 8080
- **Profile**: dev
- **Database**: H2 in-memory
- **H2 Console**: http://localhost:8080/h2-console

### Frontend Configuration  
- **Port**: 5173 (Vite dev server)
- **Proxy**: `/api` requests → `http://localhost:8080/api`
- **No CORS issues** (same-origin via proxy)

### Database Connection (H2)
```
JDBC URL: jdbc:h2:mem:school_db
Username: sa
Password: (leave blank)
```

## Troubleshooting

### Frontend can't connect to backend
1. Make sure backend is running on port 8080
2. Check that Vite proxy is working: http://localhost:5173/api/auth/health
3. Verify environment.ts has `apiUrl: ''` (empty for relative URLs)

### Port conflicts
- Backend: Check if port 8080 is free with `lsof -i :8080`
- Frontend: Check if port 5173 is free with `lsof -i :5173`

### Java version issues
- Ensure Java 17 is installed and active
- Check with `java -version`

## Recent Updates

✅ **Fixed CORS issues** by updating frontend to use Vite proxy instead of direct cross-origin requests
✅ **Unified port configuration** - backend consistently uses port 8080
✅ **Automatic coordination** between backend and frontend startup
✅ **Proper environment configuration** for development vs production
