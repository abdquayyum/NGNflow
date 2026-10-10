const fs = require('fs');
const path = '.github/workflows/ios-build.yml';
let content = fs.readFileSync(path, 'utf8');

// Replace the build step with one that captures logs and commits them to the repo
const newBuildStep = `
      - name: Build for iOS (Local on Runner)
        continue-on-error: true
        run: EAS_LOCAL_BUILD_SKIP_CLEANUP=1 EAS_NO_VCS=1 eas build --platform ios --local --non-interactive --output build.ipa > eas-build.log 2>&1 || true

      - name: Commit Logs to Repository
        run: |
          git config --global user.name "GitHub Actions"
          git config --global user.email "actions@github.com"
          git add eas-build.log
          git commit -m "chore: auto-upload eas-build.log for debugging" || true
          git push || true
`;

content = content.replace(
  /      - name: Build for iOS \(Local on Runner\)\n        run: EAS_LOCAL_BUILD_SKIP_CLEANUP=1 EAS_NO_VCS=1 eas build --platform ios --local --non-interactive --output build.ipa/,
  newBuildStep.trim()
);

fs.writeFileSync(path, content);
console.log("Patched workflow to capture and push EAS build logs.");
