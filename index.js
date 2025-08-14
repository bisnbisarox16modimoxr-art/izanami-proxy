const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com';

app.post('/v1beta/models/:model:generateContent', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server.' });
    }

    const model = req.params.model;
    const apiUrl = `${BASE_URL}/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await axios.post(apiUrl, req.body, {
            headers: { 'Content-Type': 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying to Gemini:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json(error.response ? error.response.data : { error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
