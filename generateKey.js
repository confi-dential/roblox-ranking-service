const fs = require('fs');
const crypto = require('crypto');

// Generate a random hex string of the desired length (default 64 characters)
function generateKey(length = 64) {
  return crypto.randomBytes(length / 2).toString('hex');
}

// Parse a duration string (e.g., "1y 2m 4d") into milliseconds.
function parseDuration(durationStr) {
  let years = 0, months = 0, days = 0;
  let match;
  match = durationStr.match(/(\d+)\s*y/);
  if(match) years = parseInt(match[1]);
  match = durationStr.match(/(\d+)\s*m/);
  if(match) months = parseInt(match[1]);
  match = durationStr.match(/(\d+)\s*d/);
  if(match) days = parseInt(match[1]);
  // Approximate conversions: 1 year = 365 days, 1 month = 30 days
  return (years * 365 * 24 * 3600 + months * 30 * 24 * 3600 + days * 24 * 3600) * 1000;
}

// Expect two command-line arguments: duration and user
const args = process.argv.slice(2);
if(args.length < 2) {
  console.error("Usage: node generateKey.js <duration> <user>");
  console.error("Example: node generateKey.js \"1y 2m 4d\" blqzzrd");
  process.exit(1);
}

const durationStr = args[0];
const user = args[1];
const key = generateKey(64);
const now = Date.now();

const keyEntry = {
  key: key,
  expiresIn: durationStr, // e.g., "1y 2m 4d"
  user: user,
  createdAt: now
};

const keysFile = 'keys.json';
let keys = {};

// Load existing keys if file exists
if(fs.existsSync(keysFile)) {
  try {
    keys = JSON.parse(fs.readFileSync(keysFile, 'utf8'));
  } catch (err) {
    console.error("Error reading keys file:", err);
  }
}

// Store the new key
keys[key] = keyEntry;
fs.writeFileSync(keysFile, JSON.stringify(keys, null, 2));
console.log("Generated key:", key);
console.log(`This key is valid for ${durationStr} and is attached to user "${user}"`);
