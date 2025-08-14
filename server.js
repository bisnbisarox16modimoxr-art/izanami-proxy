const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }
);

console.log("📡 Gemini status:", response.status, response.statusText);

const text = await response.text();
console.log("📥 Raw Gemini response:", text);

let data;
try {
  data = JSON.parse(text);
} catch (err) {
  console.error("❌ JSON parse error:", err);
  return res.status(500).json({ error: "Invalid JSON from Gemini" });
}

res.json(data);
