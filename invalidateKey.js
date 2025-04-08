const fs = require('fs');
const keysFile = 'keys.json';

// Get username from the command-line arguments
const username = process.argv[2];
if (!username) {
  console.error("Usage: node invalidateKey.js <username>");
  process.exit(1);
}

// Load the keys from keys.json
let keys = {};
if (fs.existsSync(keysFile)) {
  try {
    const data = fs.readFileSync(keysFile, 'utf8').trim();
    keys = data ? JSON.parse(data) : {};
  } catch (err) {
    console.error("Error reading keys.json:", err);
    process.exit(1);
  }
} else {
  console.error("keys.json file not found.");
  process.exit(1);
}

// Search for keys for the given username and remove them
let removedKeys = [];
for (const [key, entry] of Object.entries(keys)) {
  if (entry.user === username) {
    removedKeys.push(key);
    delete keys[key];
  }
}

// Write the updated keys back to keys.json
try {
  fs.writeFileSync(keysFile, JSON.stringify(keys, null, 2));
  if (removedKeys.length > 0) {
    console.log(`Invalidated keys for user "${username}":`);
    removedKeys.forEach(k => console.log(` - ${k}`));
  } else {
    console.log(`No keys found for user "${username}".`);
  }
} catch (err) {
  console.error("Error writing to keys.json:", err);
  process.exit(1);
}
