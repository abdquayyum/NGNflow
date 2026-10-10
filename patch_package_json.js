const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (!pkg.dependencies['expo-local-authentication']) {
  pkg.dependencies['expo-local-authentication'] = "~13.0.2"; // Standard Expo SDK 50/51 compatible version
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Injected expo-local-authentication into package.json!");
