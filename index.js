const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// OpenAI to Gemini Translation Layer
app.post('/v1/chat/completions', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server.' });
    }

    try {
        const openAiRequest = req.body;
        
        // --- Translation from OpenAI format to Gemini format ---
        const geminiContents = openAiRequest.messages.map(message => {
            // Map OpenAI roles to Gemini roles
            const role = message.role === 'assistant' ? 'model' : 'user';
            return {
                role: role,
                parts: [{ text: message.content }]
            };
        }).filter(message => message.parts[0].text); // Filter out empty messages

        const geminiRequest = {
            contents: geminiContents,
            generationConfig: {
                temperature: openAiRequest.temperature || 0.7,
                maxOutputTokens: openAiRequest.max_tokens || 2048,
            }
        };
        // --- End of Translation ---

        const geminiResponse = await axios.post(API_URL, geminiRequest);

        // --- Translation from Gemini format back to OpenAI format ---
        const openAiResponse = {
            id: 'chatcmpl-' + Date.now(),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'gemini-pro',
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: geminiResponse.data.candidates[0].content.parts[0].text
                },
                finish_reason: 'stop'
            }]
        };
        // --- End of Translation ---
        
        res.json(openAiResponse);

    } catch (error) {
        console.error('Error during translation/proxy:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to process request.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Smart Translator Server is running on port ${PORT}`);
});
