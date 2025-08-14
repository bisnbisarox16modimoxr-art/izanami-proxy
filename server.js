import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// Разрешаем доступ из браузера (для Janitor)
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { messages, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    // Собираем все пользовательские сообщения в один текст
    const userMessages = messag
