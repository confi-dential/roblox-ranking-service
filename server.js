require('dotenv').config();
const express = require("express");
const rbx = require("noblox.js");
const fs = require('fs');
const app = express();

// Log in to Roblox using your secure cookie from the .env file
async function startApp() {
  try {
    await rbx.setCookie(process.env.RO_COOKIE);
    const currentUser = await rbx.getCurrentUser();
    console.log(`Logged in as: ${currentUser.UserName}`);
  } catch (err) {
    console.error("Error logging in:", err);
  }
}
startApp();

// Load keys from keys.json
function loadKeys() {
  const keysFile = 'keys.json';
  if (fs.existsSync(keysFile)) {
    try {
      return JSON.parse(fs.readFileSync(keysFile, 'utf8'));
    } catch (err) {
      console.error("Error parsing keys file:", err);
      return {};
    }
  }
  return {};
}

// Convert a duration string like "1y 2m 4d" to milliseconds
function parseDuration(durationStr) {
  let years = 0, months = 0, days = 0;
  let match;
  match = durationStr.match(/(\d+)\s*y/);
  if(match) years = parseInt(match[1]);
  match = durationStr.match(/(\d+)\s*m/);
  if(match) months = parseInt(match[1]);
  match = durationStr.match(/(\d+)\s*d/);
  if(match) days = parseInt(match[1]);
  return (years * 365 * 24 * 3600 + months * 30 * 24 * 3600 + days * 24 * 3600) * 1000;
}

// Check if a provided key exists and has not expired
function isKeyValid(providedKey) {
  const keys = loadKeys();
  const keyData = keys[providedKey];
  if (!keyData) {
    return false; // Key not found
  }
  const createdAt = keyData.createdAt;
  const durationMs = parseDuration(keyData.expiresIn);
  const expirationTime = createdAt + durationMs;
  if (Date.now() > expirationTime) {
    return false; // Key expired
  }
  return true;
}

// Endpoint to change a user's rank
// Expected URL format: 
// http://srv782847.hstgr.cloud:3000/ranker?groupId=GROUP_ID&userId=USER_ID&rank=DESIRED_RANK&key=GENERATED_KEY
app.get("/ranker", async (req, res) => {
  const groupId = req.query.groupId;
  const userId = req.query.userId;
  const rank = parseInt(req.query.rank, 10);
  const key = req.query.key;
  
  // Validate required parameters
  if (!groupId || !userId || isNaN(rank) || !key) {
    return res.status(400).json({ success: false, error: "Missing or invalid parameters." });
  }
  
  // Validate the key using our generated keys
  if (!isKeyValid(key)) {
    return res.status(403).json({ success: false, error: "Forbidden: Invalid or expired key." });
  }
  
  // Extra security: Check that the request comes from a Roblox client
  const userAgent = req.headers['user-agent'] || "";
  if (!userAgent.includes("Roblox")) {
    return res.status(403).json({ success: false, error: "Forbidden: Request must come from the Roblox client." });
  }
  
  try {
    // Set the rank for the user in the specified group
    await rbx.setRank(parseInt(groupId, 10), parseInt(userId, 10), rank);
    res.json({ success: true, message: "User ranked successfully!" });
  } catch (error) {
    console.error("Error ranking user:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
