const fs = require('fs');

const content = `name: iOS Build & Submit

on:
  push:
    branches:
      - master

jobs:
  build:
    name: Build iOS and Submit to TestFlight
    runs-on: macos-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Install dependencies
        run: npm install

      - name: Setup Expo and EAS CLI
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: \${{ secrets.EXPO_TOKEN }}

      - name: Build for iOS (Local on Runner)
        run: EAS_NO_NPM_CI=1 EAS_LOCAL_BUILD_SKIP_CLEANUP=1 EAS_NO_VCS=1 eas build --platform ios --local --non-interactive --output build.ipa

      - name: Submit to TestFlight
        run: eas submit --platform ios --path build.ipa --non-interactive

      - name: Upload IPA Artifact
        uses: actions/upload-artifact@v4
        with:
          name: NGNflow-iOS-App
          path: build.ipa
          retention-days: 5

      - name: Dump Xcode Logs
        if: failure()
        run: find /var/folders /tmp /Users -name "*.log" -type f 2>/dev/null -exec tail -n 200 {} +
`;

fs.writeFileSync('.github/workflows/ios-build.yml', content);
console.log("Restored standard, strict iOS Build workflow.");
