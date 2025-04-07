const fs = require('fs');

// Parse a duration string like "1y 2m 4d" into milliseconds
function parseDuration(durationStr) {
  let years = 0, months = 0, days = 0;
  const regex = /(\d+)\s*(y|m|d)/gi;
  let match;
  while ((match = regex.exec(durationStr)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 'y') {
      years = value;
    } else if (unit === 'm') {
      months = value;
    } else if (unit === 'd') {
      days = value;
    }
  }
  // Approximate: 1 year = 365 days, 1 month = 30 days
  return ((years * 365) + (months * 30) + days) * 24 * 3600 * 1000;
}

// Convert milliseconds into a human-readable duration
function formatDuration(ms) {
  if (ms < 0) return "Expired";
  let totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  totalSeconds %= 86400;
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Get the username from command-line arguments
const username = process.argv[2];
if (!username) {
  console.error("Usage: node fetchKey.js <username>");
  process.exit(1);
}

// Load keys from keys.json
const keysFile = 'keys.json';
if (!fs.existsSync(keysFile)) {
  console.error("Error: keys.json file does not exist.");
  process.exit(1);
}

let keys = {};
try {
  const data = fs.readFileSync(keysFile, 'utf8').trim();
  keys = data ? JSON.parse(data) : {};
} catch (err) {
  console.error("Error parsing keys.json:", err);
  process.exit(1);
}

// Search for keys attached to the given username
let found = false;
for (const [key, entry] of Object.entries(keys)) {
  if (entry.user === username) {
    found = true;
    const createdAt = entry.createdAt;
    const durationMs = parseDuration(entry.expiresIn);
    const expirationTime = createdAt + durationMs;
    const remainingMs = expirationTime - Date.now();
    console.log(`Key: ${key}`);
    console.log(`Remaining time: ${formatDuration(remainingMs)}`);
    console.log('---------------------------');
  }
}

if (!found) {
  console.log(`No key found for user "${username}".`);
}
