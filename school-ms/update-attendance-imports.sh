#!/bin/bash
echo "Running frontend import migration script..."
cd frontend
node scripts/update-imports.js
echo "Press any key to continue..."
read -n 1
