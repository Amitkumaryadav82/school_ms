#!/bin/bash

# Script to fix Lombok processing issues
echo "===== School Management System Lombok Fix ====="
echo "This script will modify the Maven build process to ensure Lombok annotations are processed correctly."

# Change directory to the backend app
cd "$(dirname "$0")"

# Update lombok.config file
cat > lombok.config << EOF
# This file ensures Lombok generates all necessary methods
lombok.addLombokGeneratedAnnotation = true
lombok.anyConstructor.addConstructorProperties = true
lombok.equalsAndHashCode.callSuper = call
lombok.toBuilder.enabled = true
lombok.copyableAnnotations += javax.validation.constraints.NotNull
lombok.copyableAnnotations += javax.validation.constraints.NotBlank

# Enable all Lombok features
lombok.accessors.chain = true

# Make Lombok delombok its output
lombok.extern.findbugs.addSuppressFBWarnings = true 

# Force Lombok to process annotations
config.stopBubbling = true
lombok.addNullAnnotations = javax
lombok.addSuppressWarnings = true
EOF

echo "Created updated lombok.config file."

# Create a Maven clean and install command
echo "Running Maven clean and install with specific options for Lombok processing..."
mvn clean install -Dmaven.test.skip=true -Dlombok.delombok.verbose=true

echo "===== Lombok Fix Completed ====="
echo "If you still encounter issues, try:"
echo "1. Deleting the target directory"
echo "2. Restarting your IDE"
echo "3. Running 'mvn clean install -U' to force update dependencies"
