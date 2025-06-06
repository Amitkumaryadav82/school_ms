#!/bin/bash

# Script to replace jakarta.* imports with javax.* imports
echo "Replacing jakarta.persistence with javax.persistence..."

# Get all java files in the project
find . -name "*.java" -type f | while read file; do
    # Replace jakarta.persistence with javax.persistence
    sed -i 's/jakarta\.persistence/javax.persistence/g' "$file"
    
    # Replace jakarta.validation with javax.validation
    sed -i 's/jakarta\.validation/javax.validation/g' "$file"
    
    echo "Updated: $file"
done

echo "Done!"
