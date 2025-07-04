#!/bin/bash

# Complete Development Environment Startup Script
echo "🚀 Starting Complete School Management System Development Environment..."

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend server stopped"
    fi
    exit 0
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM

# 1. Setup Java 17
echo "📋 Setting up Java 17..."
if [ -f ~/.sdkman/bin/sdkman-init.sh ]; then
    source ~/.sdkman/bin/sdkman-init.sh
    sdk use java 17.0.15-ms 2>/dev/null || echo "⚠️  SDKMAN Java 17 not found, using system Java"
fi

for java17_path in /usr/lib/jvm/msopenjdk-17 /usr/lib/jvm/java-17-openjdk*; do
    if [ -d "$java17_path" ]; then
        export JAVA_HOME="$java17_path"
        export PATH="$JAVA_HOME/bin:$PATH"
        echo "✅ JAVA_HOME set to: $JAVA_HOME"
        break
    fi
done

# Verify Java version
java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1-2)
if [[ "$java_version" == "17"* ]]; then
    echo "✅ Java 17 is active"
else
    echo "⚠️  Warning: Java 17 is not active. Current version: $java_version"
fi

# 2. Start Backend
echo ""
echo "🏗️  Starting Backend (Spring Boot)..."
cd /workspaces/school_ms/school-ms/backend/school-app

mvn spring-boot:run -Dspring-boot.run.profiles=dev > backend.log 2>&1 &
BACKEND_PID=$!

echo "✅ Backend started with PID: $BACKEND_PID"
echo "🔗 Backend API: http://localhost:8080"
echo "🔗 H2 Console: http://localhost:8080/h2-console"

# 3. Wait for backend to be ready
echo "⏰ Waiting for backend to initialize..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/auth/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start within 30 seconds"
        echo "📋 Backend logs:"
        tail -20 backend.log
        cleanup
        exit 1
    fi
    sleep 1
    echo -n "."
done

# 4. Start Frontend
echo ""
echo "🎨 Starting Frontend (Vite)..."
cd /workspaces/school_ms/school-ms/frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

echo "✅ Frontend started with PID: $FRONTEND_PID"
echo "🔗 Frontend: http://localhost:5173"

# 5. Display status and wait
echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📍 Available Services:"
echo "   🎨 Frontend:      http://localhost:5173"
echo "   🏗️  Backend API:   http://localhost:8080"
echo "   🗄️  H2 Console:    http://localhost:8080/h2-console"
echo ""
echo "📋 Database Connection (H2):"
echo "   JDBC URL: jdbc:h2:mem:school_db"
echo "   Username: sa"
echo "   Password: (leave blank)"
echo ""
echo "💡 Proxy Configuration:"
echo "   Frontend /api requests → Backend http://localhost:8080/api"
echo ""
echo "Press Ctrl+C to stop all servers"

# Keep script running and monitor processes
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend process died unexpectedly"
        cleanup
        exit 1
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend process died unexpectedly"
        cleanup
        exit 1
    fi
    sleep 5
done
