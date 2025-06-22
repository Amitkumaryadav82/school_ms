const fs = require('fs');
const path = require('path');

// Read the Staff.tsx file
const filePath = path.join(__dirname, 'Staff.tsx');
const fileContent = fs.readFileSync(filePath, 'utf8');

// Split the file into lines for analysis
const lines = fileContent.split('\n');

// Variables to track function nesting and potential issues
let bracketCount = 0;
let functionDepth = 0;
let inFunction = false;
let potentialIssues = [];

// Process each line
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Count brackets for tracking function blocks
    const openBrackets = (line.match(/{/g) || []).length;
    const closeBrackets = (line.match(/}/g) || []).length;
    
    // Track function start
    if (line.match(/function|=>|\.FC\s*=/)) {
        functionDepth++;
        inFunction = true;
    }
    
    // Update bracket count
    bracketCount += openBrackets - closeBrackets;
    
    // Track function end based on closing brackets
    if (closeBrackets > 0 && functionDepth > 0 && bracketCount < functionDepth) {
        functionDepth--;
        if (functionDepth === 0) {
            inFunction = false;
        }
    }
    
    // Check for return statements outside functions
    if (!inFunction && line.trim().startsWith('return ')) {
        potentialIssues.push({
            lineNumber,
            line,
            issue: 'Return statement outside function'
        });
    }
    
    // Check for trailing commas in objects/arrays
    if (line.trim().match(/,\s*[}\]]/) && !line.includes('//')) {
        potentialIssues.push({
            lineNumber,
            line,
            issue: 'Potential trailing comma'
        });
    }
    
    // Check for unmatched brackets
    if (bracketCount < 0) {
        potentialIssues.push({
            lineNumber,
            line,
            issue: 'Too many closing brackets'
        });
        // Reset to avoid cascading errors
        bracketCount = 0;
    }
}

// Print results
console.log(`--- Syntax Analysis for ${filePath} ---`);
console.log(`Final bracket count: ${bracketCount}`);
console.log(`Final function depth: ${functionDepth}`);
console.log('\nPotential issues:');

if (potentialIssues.length === 0) {
    console.log('No obvious syntax issues detected.');
} else {
    potentialIssues.forEach(issue => {
        console.log(`Line ${issue.lineNumber}: ${issue.issue}`);
        console.log(`  ${issue.line.trim()}`);
        console.log();
    });
}

// Perform additional check for unclosed JSX tags
console.log('\nChecking for unclosed JSX tags...');

// A very basic check - not comprehensive but might catch issues
const openTags = [];
const jsxIssues = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Match opening JSX tags but not self-closing ones
    const openMatches = line.match(/<[A-Z][a-zA-Z0-9]*(?:\s+[^>]*[^/])?>/g);
    if (openMatches) {
        openMatches.forEach(tag => {
            const tagName = tag.match(/<([A-Z][a-zA-Z0-9]*)/)[1];
            openTags.push({ tag: tagName, line: lineNumber });
        });
    }
    
    // Match closing JSX tags
    const closeMatches = line.match(/<\/[A-Z][a-zA-Z0-9]*>/g);
    if (closeMatches) {
        closeMatches.forEach(tag => {
            const tagName = tag.match(/<\/([A-Z][a-zA-Z0-9]*)>/)[1];
            
            // Check if this closing tag matches the last opened tag
            if (openTags.length > 0 && openTags[openTags.length - 1].tag === tagName) {
                openTags.pop();
            } else {
                jsxIssues.push({
                    lineNumber,
                    tag: tagName,
                    issue: 'Potentially mismatched closing tag'
                });
            }
        });
    }
}

if (jsxIssues.length === 0 && openTags.length === 0) {
    console.log('No obvious JSX tag issues detected.');
} else {
    if (jsxIssues.length > 0) {
        console.log('Potential mismatched JSX tags:');
        jsxIssues.forEach(issue => {
            console.log(`Line ${issue.lineNumber}: ${issue.issue} - ${issue.tag}`);
        });
    }
    
    if (openTags.length > 0) {
        console.log('\nPotentially unclosed JSX tags:');
        openTags.forEach(tag => {
            console.log(`Line ${tag.line}: Unclosed tag <${tag.tag}>`);
        });
    }
}

console.log('\nAnalysis complete!');
