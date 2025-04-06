// Load environment variables from the .env file
require('dotenv').config();

const express = require("express");
const rbx = require("noblox.js");
const app = express();

// Replace with your actual Roblox Group ID
const groupId = 1234567; 

// Log in to Roblox using the cookie from the .env file
async function startApp() {
    try {
        await rbx.setCookie(process.env.RO_COOKIE);
        const currentUser = await rbx.getCurrentUser();
        console.log(`Logged in as: ${currentUser.UserName}`);
    } catch (err) {
        console.error("Error logging in: ", err);
    }
}
startApp();

// Endpoint to rank a user in the group
// Example URL: http://srv782847.hstgr.cloud:3000/ranker?userid=12345678&rank=200
app.get("/ranker", async (req, res) => {
    const userId = req.query.userid;
    const rank = parseInt(req.query.rank, 10);
    
    if (!userId || isNaN(rank)) {
        return res.status(400).json({ success: false, error: "Missing or invalid parameters." });
    }
    
    try {
        await rbx.setRank(groupId, parseInt(userId, 10), rank);
        res.json({ success: true, message: "User ranked!" });
    } catch (error) {
        console.error("Error ranking user: ", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the Express server on the port specified in .env (or default to 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
