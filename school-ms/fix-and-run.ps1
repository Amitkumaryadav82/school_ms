Write-Host "==== School Management System - Fix Entity Issue and Run Application ====" -ForegroundColor Cyan

# Set working directory
cd $PSScriptRoot\backend\school-app

# Step 1: Apply fix to QuestionWiseMarks class
Write-Host "`nStep 1: Fixing QuestionWiseMarks entity..." -ForegroundColor Yellow
$filePath = "src\main\java\com\school\exam\model\QuestionWiseMarks.java"

# Ensure Student is imported
$content = Get-Content $filePath -Raw
if (-not ($content -match "import com.school.student.model.Student;")) {
    $content = $content -replace "import com.school.common.model.BaseEntity;", "import com.school.common.model.BaseEntity;`nimport com.school.student.model.Student;"
    Set-Content -Path $filePath -Value $content
    Write-Host "Added Student import to QuestionWiseMarks.java" -ForegroundColor Green
}

# Fix the studentId field to use Student entity
$content = Get-Content $filePath -Raw
$fixedContent = $content -replace "@ManyToOne\s+@JoinColumn\(name = ""student_id"", nullable = false\)\s+private Long studentId;", "@ManyToOne`n    @JoinColumn(name = ""student_id"", nullable = false)`n    private Student student;"

if ($content -ne $fixedContent) {
    Set-Content -Path $filePath -Value $fixedContent
    Write-Host "Updated studentId field to use Student entity" -ForegroundColor Green
} else {
    Write-Host "QuestionWiseMarks entity already fixed" -ForegroundColor Green
}

# Step 2: Verify database connection in application.properties
Write-Host "`nStep 2: Checking database connection..." -ForegroundColor Yellow
$propsPath = "src\main\resources\application.properties"
$propsContent = Get-Content $propsPath -Raw

# Check database password
if ($propsContent -match "spring.datasource.password=admin") {
    $propsContent = $propsContent -replace "spring.datasource.password=admin", "spring.datasource.password=Devendra_82"
    Set-Content -Path $propsPath -Value $propsContent
    Write-Host "Updated database password in application.properties" -ForegroundColor Green
} else {
    Write-Host "Database password already set correctly" -ForegroundColor Green
}

# Step 3: Clean and build the application
Write-Host "`nStep 3: Cleaning and building the application..." -ForegroundColor Yellow
& mvn clean package -DskipTests

# Step 4: Run the application
Write-Host "`nStep 4: Running the application..." -ForegroundColor Yellow
& mvn spring-boot:run
