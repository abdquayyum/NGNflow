const fs = require('fs');
const path = '.github/workflows/ios-build.yml';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/^- name: Exfiltrate Log to Webhook/m, '      - name: Exfiltrate Log to Webhook');

fs.writeFileSync(path, content);
console.log("Fixed YAML indentation for webhook step.");
