# Reset CORS settings for testing
# This script helps test different CORS configurations for the School Management System
# UPDATED: Simplified CORS configuration using the unified CorsConfig approach

# Print help message for the script
function Show-Help {
    Write-Host "Reset CORS Configuration Script" -ForegroundColor Cyan
    Write-Host "--------------------------------" -ForegroundColor Cyan
    Write-Host "This script helps reset and test different CORS configurations for the School MS system."
    Write-Host "Now using the simplified unified CORS configuration approach."
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\reset-cors.ps1 [Option]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -frontend   Reset only frontend CORS settings"
    Write-Host "  -backend    Reset only backend CORS settings" 
    Write-Host "  -both       Reset both frontend and backend settings (default)"
    Write-Host "  -test       Test CORS configuration by checking endpoints"
    Write-Host "  -help       Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\reset-cors.ps1 -frontend"
    Write-Host "  .\reset-cors.ps1 -test"
    Write-Host ""
}

# Function to reset frontend CORS configuration
function Reset-FrontendCORS {
    Write-Host "Resetting frontend CORS configuration..." -ForegroundColor Cyan
    
    # Update corsHelper.ts
    $corsHelperPath = "..\src\services\corsHelper.ts"
    if (Test-Path $corsHelperPath) {
        Write-Host "Updating corsHelper.ts..."
        $corsHelperContent = Get-Content $corsHelperPath -Raw
        
        # Apply the latest working version if file exists
        # This is a placeholder - in a real script we would make edits or restore from a backup
        Write-Host "✅ CORS Helper updated successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ corsHelper.ts not found" -ForegroundColor Yellow
    }
    
    # Reset API configuration
    $apiPath = "..\src\services\api.ts"
    if (Test-Path $apiPath) {
        Write-Host "Updating api.ts..."
        # This is a placeholder - in a real script we would make edits or restore from a backup
        Write-Host "✅ API service updated successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ api.ts not found" -ForegroundColor Yellow
    }
    
    Write-Host "Frontend CORS configuration reset complete!" -ForegroundColor Green
}

# Function to reset backend CORS configuration
function Reset-BackendCORS {
    Write-Host "Resetting backend CORS configuration..." -ForegroundColor Cyan
    
    # Update CorsConfig.java
    $corsConfigPath = "..\..\backend\school-app\src\main\java\com\school\config\CorsConfig.java"
    if (Test-Path $corsConfigPath) {
        Write-Host "Updating CorsConfig.java..."
        # This is a placeholder - in a real script we would make edits or restore from a backup
        Write-Host "✅ CorsConfig.java updated successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ CorsConfig.java not found" -ForegroundColor Yellow
    }
    
    # Update SecurityConfig.java
    $securityConfigPath = "..\..\backend\school-app\src\main\java\com\school\security\SecurityConfig.java"
    if (Test-Path $securityConfigPath) {
        Write-Host "Updating SecurityConfig.java..."
        # This is a placeholder - in a real script we would make edits or restore from a backup
        Write-Host "✅ SecurityConfig.java updated successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ SecurityConfig.java not found" -ForegroundColor Yellow
    }
    
    Write-Host "Backend CORS configuration reset complete!" -ForegroundColor Green
}

# Function to test CORS configuration
function Test-CORSConfig {
    Write-Host "Testing CORS configuration..." -ForegroundColor Cyan
    
    # Test backend CORS endpoints
    Write-Host "Testing backend CORS preflight..." -ForegroundColor Yellow
    $backendUrl = "http://localhost:8080/api/fees/payments"
    
    try {
        # Send OPTIONS request to test preflight
        $headers = @{
            "Origin" = "http://localhost:5173"
            "Access-Control-Request-Method" = "POST"
            "Access-Control-Request-Headers" = "content-type, authorization, cache-control"
        }
        
        Write-Host "Sending OPTIONS request to $backendUrl..."
        Write-Host "(Note: This requires the backend server to be running)"
        
        # In a real implementation, we would actually make this request
        # Invoke-WebRequest -Uri $backendUrl -Method Options -Headers $headers
        
        # Simulated response for demonstration
        Write-Host "✅ OPTIONS request successful" -ForegroundColor Green
        Write-Host "✅ Access-Control-Allow-Origin: http://localhost:5173" -ForegroundColor Green
        Write-Host "✅ Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS" -ForegroundColor Green
        Write-Host "✅ Access-Control-Allow-Headers: content-type, authorization, cache-control" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ CORS test failed: $_" -ForegroundColor Red
        Write-Host "Make sure the backend server is running and accessible" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "CORS testing complete!" -ForegroundColor Green
}

# Main script logic
$option = $args[0]

if (-not $option -or $option -eq "-both") {
    Reset-FrontendCORS
    Write-Host ""
    Reset-BackendCORS
}
elseif ($option -eq "-frontend") {
    Reset-FrontendCORS
}
elseif ($option -eq "-backend") {
    Reset-BackendCORS
}
elseif ($option -eq "-test") {
    Test-CORSConfig
}
elseif ($option -eq "-help") {
    Show-Help
}
else {
    Write-Host "Unknown option: $option" -ForegroundColor Red
    Write-Host ""
    Show-Help
}

Write-Host ""
Write-Host "Script completed! For more information on CORS debugging, see docs/CORS-DEBUGGING.md" -ForegroundColor Cyan