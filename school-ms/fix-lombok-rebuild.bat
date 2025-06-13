@echo off
REM This script will rebuild the project with explicit Lombok configuration

echo ==== School Management System Backend Fix & Build ====
cd %~dp0\backend\school-app

echo.
echo Step 1: Checking Lombok config
IF NOT EXIST lombok.config (
    echo Creating Lombok configuration file
    echo # This file ensures Lombok generates all necessary methods > lombok.config
    echo lombok.addLombokGeneratedAnnotation = true >> lombok.config
    echo lombok.anyConstructor.addConstructorProperties = true >> lombok.config
    echo lombok.equalsAndHashCode.callSuper = call >> lombok.config
    echo lombok.toBuilder.enabled = true >> lombok.config
    echo lombok.accessors.chain = true >> lombok.config
)

echo.
echo Step 2: Cleaning project
call mvn clean

echo.
echo Step 3: Rebuilding with explicit annotation processing
call mvn compile -DskipTests -Dmaven.compiler.forceJavacCompilerUse=true

echo.
if %ERRORLEVEL% == 0 (
    echo Build successful!
) else (
    echo Build failed with errors. Check the output above.
)

pause
