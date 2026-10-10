const fs = require('fs');
const path = '.github/workflows/ios-build.yml';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/^- name: Build for iOS/m, '      - name: Build for iOS');

fs.writeFileSync(path, content);
console.log("Fixed YAML indentation.");
