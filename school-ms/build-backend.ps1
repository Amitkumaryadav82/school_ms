# School Management System Backend Build Script
Write-Host "==== School Management System Backend Build Script ====" -ForegroundColor Cyan
Write-Host "Building backend application..." -ForegroundColor Yellow

# Change to the backend directory
$backendDir = Join-Path $PSScriptRoot "backend\school-app"
Set-Location $backendDir

# Check that Java is available and is version 17
Write-Host "Checking Java version..." -ForegroundColor Yellow
try {
    $javaVersion = $(java -version 2>&1)
    if ($javaVersion -match "version ""(17\.|1.17)") {
        Write-Host "✅ Using Java 17: $javaVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Not using Java 17. Current version: $javaVersion" -ForegroundColor Red
        Write-Host "Please install Java 17 and make sure it's in your PATH." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Java not found. Please install Java 17 and make sure it's in your PATH." -ForegroundColor Red
    exit 1
}

# Build the backend application
Write-Host "Running Maven build..." -ForegroundColor Yellow
mvn clean package -DskipTests

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host "JAR file created at: $backendDir\target\school-app-1.0.0.jar" -ForegroundColor Green
    Write-Host "To start the application, run: java -jar $backendDir\target\school-app-1.0.0.jar"
} else {
    Write-Host "❌ Build failed! Check the errors above." -ForegroundColor Red
}
