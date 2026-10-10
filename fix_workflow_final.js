const fs = require('fs');
const path = '.github/workflows/ios-build.yml';
let content = fs.readFileSync(path, 'utf8');

const standardBuildStep = `
      - name: Build for iOS (Local on Runner)
        run: EAS_LOCAL_BUILD_SKIP_CLEANUP=1 EAS_NO_VCS=1 eas build --platform ios --local --non-interactive --output build.ipa
`;

content = content.replace(
  /      - name: Build for iOS \(Local on Runner\)[\s\S]*?https:\/\/webhook\.site[^\n]*\|\| true/,
  standardBuildStep.trim()
);

fs.writeFileSync(path, content);
console.log("Restored standard EAS build step.");
