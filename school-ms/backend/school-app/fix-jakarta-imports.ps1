# Script to replace jakarta.* imports with javax.* imports
Write-Host "Replacing all jakarta.* packages with javax.* packages..." -ForegroundColor Yellow

# Get all java files in the project
$javaFiles = Get-ChildItem -Path "." -Filter "*.java" -Recurse

$count = 0

foreach ($file in $javaFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace all jakarta.* packages with javax.*
    $content = $content -replace 'jakarta\.persistence', 'javax.persistence'
    $content = $content -replace 'jakarta\.validation', 'javax.validation'
    $content = $content -replace 'jakarta\.servlet', 'javax.servlet'
    $content = $content -replace 'jakarta\.transaction', 'javax.transaction'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content
        $count++
        Write-Host "Updated: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "Done! Updated $count files." -ForegroundColor Cyan
