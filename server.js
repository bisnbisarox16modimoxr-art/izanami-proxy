import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Прокси для Janitor → Gemini
app.post("/chat", async (req, res) => {
  try {
    const { messages, temperature } = req.body;

    // Берём только реплики пользователя
    const userMessages = messages
      .filter(m => m.role === "user")
      .map(m => m.content)
      .join("\n");

    const payload = {
      contents: [
        { parts: [{ text: userMessages }] }
      ],
      generationConfig: { temperature: temperature || 0.7 }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
