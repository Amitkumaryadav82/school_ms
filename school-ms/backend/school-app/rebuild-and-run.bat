@echo off
cd %~dp0
echo Cleaning and building the project...
call mvn clean package -DskipTests

echo Starting the application...
java -jar target\school-app-1.0.0.jar
