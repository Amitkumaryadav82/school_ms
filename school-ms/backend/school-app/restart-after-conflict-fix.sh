#!/bin/bash

echo "Restarting application after attendance service fix..."

# Navigate to the backend directory
cd $(dirname "$0")

# Stop any running Spring Boot application
pkill -f 'java.*school-app'

# Rebuild and start
./build-and-run.bat

echo "Application restarted!"
