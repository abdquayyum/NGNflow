const fs = require('fs');
const path = '.github/workflows/ios-build.yml';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'run: EAS_LOCAL_BUILD_SKIP_CLEANUP=1 EAS_NO_VCS=1 eas build',
  'run: EAS_NO_NPM_CI=1 EAS_LOCAL_BUILD_SKIP_CLEANUP=1 EAS_NO_VCS=1 eas build'
);

fs.writeFileSync(path, content);
console.log("Injected EAS_NO_NPM_CI=1 into workflow.");
