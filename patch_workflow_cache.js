const fs = require('fs');
const path = '.github/workflows/ios-build.yml';
let content = fs.readFileSync(path, 'utf8');

// Remove cache: "npm" which relies on the deleted package-lock.json
content = content.replace('          cache: "npm"', '');

fs.writeFileSync(path, content);
console.log("Removed cache: npm requirement from GitHub Actions workflow.");
