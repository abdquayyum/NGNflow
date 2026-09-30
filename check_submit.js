const axios = require('axios');
const fs = require('fs');
async function main() {
  const token = fs.readFileSync('/Users/abdulquayyumoyedotun/.expo/state.json', 'utf8');
  // I don't know the exact token structure, let me just look at state.json to get the token!
}
