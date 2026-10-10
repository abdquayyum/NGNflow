const fs = require('fs');
const path = 'screens/AuthScreen.js';
let content = fs.readFileSync(path, 'utf8');

// Change behavior="padding" to dynamic
content = content.replace(
  'behavior="padding"',
  'behavior={Platform.OS === \'ios\' ? \'padding\' : undefined}'
);

// Remove top dynamic spacer
content = content.replace(
  '{/* Top Dynamic Spacer */}\n          <View style={{ flex: 1 }} />\n',
  ''
);

// Remove bottom dynamic spacer
content = content.replace(
  '{/* Bottom Dynamic Spacer */}\n          <View style={{ flex: 1 }} />\n',
  ''
);

fs.writeFileSync(path, content);
console.log("Successfully fixed AuthScreen.js safely.");
