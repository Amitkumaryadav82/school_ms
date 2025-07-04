#!/bin/bash

# Daily Codespace Restart Script for School Management System
echo "🚀 Starting School Management System in Development Mode..."

# 1. Ensure Java 17 is active
echo "📋 Setting up Java 17..."

# Check if Java 17 is available and set it as default
if [ -f ~/.sdkman/bin/sdkman-init.sh ]; then
    source ~/.sdkman/bin/sdkman-init.sh
    sdk use java 17.0.15-ms 2>/dev/null || echo "⚠️  SDKMAN Java 17 not found, using system Java"
fi

# Alternative: Use update-alternatives if available
if command -v update-alternatives >/dev/null 2>&1; then
    sudo update-alternatives --set java /usr/lib/jvm/msopenjdk-17/bin/java 2>/dev/null || echo "⚠️  update-alternatives setup skipped"
fi

# Set JAVA_HOME if Java 17 directory exists
for java17_path in /usr/lib/jvm/msopenjdk-17 /usr/lib/jvm/java-17-openjdk*; do
    if [ -d "$java17_path" ]; then
        export JAVA_HOME="$java17_path"
        export PATH="$JAVA_HOME/bin:$PATH"
        echo "✅ JAVA_HOME set to: $JAVA_HOME"
        break
    fi
done

# Verify Java version
echo "📋 Current Java version:"
java -version

# Check if it's Java 17
java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1-2)
if [[ "$java_version" == "17"* ]]; then
    echo "✅ Java 17 is active"
else
    echo "⚠️  Warning: Java 17 is not active. Current version: $java_version"
    echo "   The application may still work, but Java 17 is recommended."
fi

# 2. Navigate to project directory
cd /workspaces/school_ms/school-ms/backend/school-app

# 3. Start Spring Boot application with H2 database
echo "🏗️  Starting Spring Boot application with H2 database..."
echo "🔗 H2 Console will be available at: http://localhost:8080/h2-console"
echo "🔗 Backend API will be running at: http://localhost:8080"
echo ""
echo "📊 H2 Database Connection Details:"
echo "   JDBC URL: jdbc:h2:mem:school_db"
echo "   User Name: sa"
echo "   Password: (leave blank)"
echo ""
echo "⏰ Starting backend application... (this may take a moment)"

# Start backend in background
mvn spring-boot:run -Dspring-boot.run.profiles=dev &
BACKEND_PID=$!

echo "✅ Backend started with PID: $BACKEND_PID"
echo ""

# 4. Start Frontend Development Server
echo "🎨 Starting Frontend Development Server..."
echo "🔗 Frontend will be available at: http://localhost:5173"
echo ""

# Wait a moment for backend to initialize
sleep 5

# Navigate to frontend directory and start Vite dev server
cd /workspaces/school_ms/school-ms/frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "⏰ Starting frontend development server..."
npm run dev
