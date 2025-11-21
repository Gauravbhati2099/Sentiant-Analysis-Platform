const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

// --- CONFIGURATION ---
const app = express();
const PORT = 8080;
const PYTHON_API_URL = 'https://sentiant-python-api.onrender.com/api/process-video';
const GOOGLE_CLIENT_ID = "545609210352-84nlsq3ik9c84hn3m32sevl9jtc0mce3.apps.googleusercontent.com"; // <-- PASTE YOUR CLIENT ID HERE
const JWT_SECRET = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"; // <-- CHANGE THIS TO A RANDOM SECRET

// --- INITIALIZATION ---
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Google Authentication Route
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const { name, email, picture } = ticket.getPayload();
        
        // In a real app, you would find or create a user in your database here.
        
        // Create a JWT for our application session
        const appToken = jwt.sign({ name, email, picture }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ token: appToken, user: { name, email, picture } });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ error: 'Invalid Google token' });
    }
});

// 2. The Analysis Route (now protected)
app.post('/api/analyze', async (req, res) => {
    // This route will be protected by middleware in a real app, but for simplicity, we'll skip that step for now.
    // In a full implementation, you'd verify the JWT from the Authorization header here.

    const { videoURL } = req.body;
    if (!videoURL) return res.status(400).json({ error: 'videoURL is required' });

    const videoId = extractVideoId(videoURL);
    if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

    try {
        const pythonResponse = await axios.post(PYTHON_API_URL, { videoId });
        res.json(pythonResponse.data);
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        const data = error.response ? error.response.data : { error: "An internal server error occurred." };
        res.status(status).json(data);
    }
});

// --- HELPER FUNCTION ---
function extractVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});