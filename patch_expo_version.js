const fs = require('fs');

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Fix the incompatible version
pkg.dependencies['expo-local-authentication'] = "~57.0.0";

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Patched package.json expo-local-authentication version to ~57.0.0.");
