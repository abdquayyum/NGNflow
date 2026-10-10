const fs = require('fs');

let config = JSON.parse(fs.readFileSync('app.json', 'utf8'));

// Filter out the expo-local-authentication plugin array
config.expo.plugins = config.expo.plugins.filter(plugin => {
  if (Array.isArray(plugin) && plugin[0] === 'expo-local-authentication') {
    return false;
  }
  return true;
});

fs.writeFileSync('app.json', JSON.stringify(config, null, 2));
console.log("Removed non-existent expo-local-authentication plugin from app.json.");
