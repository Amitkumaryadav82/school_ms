#!/bin/bash

echo "==== Copying School Management System to WSL Filesystem ===="
echo "This will improve development performance in WSL"

# Define source and destination paths
SOURCE_DIR="/mnt/c/Users/amitk/Documents/school_ms/school-ms"
DEST_DIR="$HOME/school-ms"

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Copy files to WSL filesystem
echo "Copying project files to $DEST_DIR..."
rsync -av --exclude 'node_modules' --exclude 'target' --exclude '.git' "$SOURCE_DIR/" "$DEST_DIR/"

# Make scripts executable
find "$DEST_DIR" -name "*.sh" -exec chmod +x {} \;

echo "✅ Project copied successfully to WSL filesystem!"
echo "You can now work on the project at: $DEST_DIR"
echo "To open in VS Code, run: code $DEST_DIR/school-ms.code-workspace"
