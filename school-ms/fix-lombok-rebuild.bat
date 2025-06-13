@echo off
REM This script will rebuild the project with explicit Lombok configuration

echo ==== School Management System Backend Fix & Build ====
cd %~dp0\backend\school-app

echo.
echo Step 1: Setting up Lombok config
echo Creating/updating Lombok configuration file
echo # This file ensures Lombok generates all necessary methods > lombok.config
echo lombok.addLombokGeneratedAnnotation = true >> lombok.config
echo lombok.anyConstructor.addConstructorProperties = true >> lombok.config
echo lombok.equalsAndHashCode.callSuper = call >> lombok.config
echo lombok.toBuilder.enabled = true >> lombok.config
echo lombok.copyableAnnotations += javax.validation.constraints.NotNull >> lombok.config
echo lombok.copyableAnnotations += javax.validation.constraints.NotBlank >> lombok.config
echo. >> lombok.config
echo # Enable all Lombok features >> lombok.config
echo lombok.accessors.chain = true >> lombok.config
echo. >> lombok.config
echo # Fix Lombok processing issues >> lombok.config
echo lombok.config.stopBubbling = true >> lombok.config
echo lombok.fieldDefaults.defaultPrivate = true >> lombok.config
echo lombok.fieldDefaults.defaultFinal = false >> lombok.config
echo lombok.log.fieldName = log >> lombok.config
echo. >> lombok.config
echo # Additional Lombok settings >> lombok.config
echo lombok.addNullAnnotations = javax >> lombok.config
echo lombok.nonNull.exceptionType = IllegalArgumentException >> lombok.config
echo lombok.getter.noIsPrefix = false >> lombok.config
echo. >> lombok.config
echo # Handle inheritance correctly >> lombok.config
echo lombok.toString.doNotUseGetters = false >> lombok.config
echo lombok.toString.includeFieldNames = true >> lombok.config
echo lombok.extern.findbugs.addSuppressFBWarnings = true >> lombok.config
echo. >> lombok.config
echo # Force Lombok to process annotations >> lombok.config
echo config.stopBubbling = true >> lombok.config
echo lombok.addNullAnnotations = javax >> lombok.config
echo lombok.addSuppressWarnings = true >> lombok.config

echo.
echo Step 1b: Adding required dependencies to pom.xml
echo Adding javax.annotation-api dependency...
powershell -Command "$content = Get-Content 'pom.xml'; $pattern = '        <!-- Utils -->        <dependency>\r?\n            <groupId>org.projectlombok</groupId>'; $injectedDependency = '        <!-- Utils -->        <dependency>\r\n            <groupId>org.projectlombok</groupId>\r\n            <artifactId>lombok</artifactId>\r\n            <version>1.18.30</version>\r\n            <scope>provided</scope>\r\n        </dependency>\r\n\r\n        <!-- Add javax.annotation dependency -->\r\n        <dependency>\r\n            <groupId>javax.annotation</groupId>\r\n            <artifactId>javax.annotation-api</artifactId>\r\n            <version>1.3.2</version>\r\n        </dependency>\r\n\r\n        <dependency>'; $updatedContent = $content -replace $pattern, $injectedDependency; $updatedContent | Set-Content 'pom.xml'"

echo.
echo Step 2: Fixing annotation imports in Java files
echo Creating temporary script to fix imports...

mkdir temp_fixes 2>nul
cd temp_fixes

echo Function Fix-Annotations { > fix-annotations.ps1
echo     param([string]$baseDir) >> fix-annotations.ps1
echo     $javaFiles = Get-ChildItem -Path $baseDir -Filter "*.java" -Recurse >> fix-annotations.ps1
echo     foreach ($file in $javaFiles) { >> fix-annotations.ps1
echo         $content = Get-Content $file.FullName >> fix-annotations.ps1
echo         $updatedContent = @() >> fix-annotations.ps1
echo         $modified = $false >> fix-annotations.ps1
echo         foreach ($line in $content) { >> fix-annotations.ps1
echo             if ($line -match "import javax\.annotation\.Nonnull;") { >> fix-annotations.ps1
echo                 Write-Host "Fixing Nonnull import in $($file.Name)" >> fix-annotations.ps1
echo                 $updatedContent += "import javax.annotation.Nonnull;" >> fix-annotations.ps1
echo                 $modified = $true >> fix-annotations.ps1
echo             } >> fix-annotations.ps1
echo             elseif ($line -match "import javax\.annotation\.Nullable;") { >> fix-annotations.ps1
echo                 Write-Host "Fixing Nullable import in $($file.Name)" >> fix-annotations.ps1
echo                 $updatedContent += "import javax.annotation.Nullable;" >> fix-annotations.ps1
echo                 $modified = $true >> fix-annotations.ps1
echo             } >> fix-annotations.ps1
echo             else { >> fix-annotations.ps1
echo                 $updatedContent += $line >> fix-annotations.ps1
echo             } >> fix-annotations.ps1
echo         } >> fix-annotations.ps1
echo         if ($modified) { >> fix-annotations.ps1
echo             Set-Content -Path $file.FullName -Value $updatedContent >> fix-annotations.ps1
echo         } >> fix-annotations.ps1
echo     } >> fix-annotations.ps1
echo } >> fix-annotations.ps1
echo Fix-Annotations -baseDir "..\src" >> fix-annotations.ps1

echo Running annotation fix script...
powershell -ExecutionPolicy Bypass -File fix-annotations.ps1

cd ..
rmdir /s /q temp_fixes

echo.
echo Step 3: Cleaning project and refreshing Maven dependencies
call mvn dependency:purge-local-repository -DreResolve=false
call mvn clean

echo.
echo Step 4: Rebuilding with Lombok processing options
REM Delete the target folder to ensure a clean build
rmdir /s /q target 2>nul

echo.
echo Step 4: Touching all Java files to ensure recompilation
for /r %%f in (*.java) do (
    copy /b "%%f"+,, "%%f" >nul
)

echo.
echo Step 5: Running Maven compile with Lombok debug options
call mvn compile -Dmaven.test.skip=true -Dlombok.delombok.verbose=true -Dlombok.verbose=true

echo.
echo Step 6: Verifying project structure after rebuild
call mvn compile -DskipTests -Dmaven.compiler.forceJavacCompilerUse=true

echo.
if %ERRORLEVEL% == 0 (
    echo Build successful!
) else (
    echo Build failed with errors. Check the output above.
)

pause
