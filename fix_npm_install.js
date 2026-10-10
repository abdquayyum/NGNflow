const fs = require('fs');
const path = '.github/workflows/ios-build.yml';
let content = fs.readFileSync(path, 'utf8');

// Change npm install --legacy-peer-deps to standard npm install
content = content.replace('run: npm install --legacy-peer-deps', 'run: npm install');

fs.writeFileSync(path, content);
console.log("Fixed npm install in workflow.");
