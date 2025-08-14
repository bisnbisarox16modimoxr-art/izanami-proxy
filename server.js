import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// Разрешаем запросы из браузера (для Janitor)
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { messages, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    // Соединяем все сообщения пользователя в одну строку
    const userMessages = messages
      .filter(m => m.role === "user")
      .map(m => m.content)
      .join("\n");

    // Формат Gemini API
    const payload = {
      contents: [
        { parts: [{ text: userMessages }] }
      ],
      generationConfig: { temperature: temperature || 0.7 }
    };

    // Запрос в Google Gemini API
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

app.get("/", (req, res) => {
  res.send("Gemini Proxy Server is running");
});

app.listen(3000, () => {
  console.log("✅ Server running on port 3000");
});
