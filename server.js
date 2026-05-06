import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";

app.get("/v1/models", async (req, res) => {
  res.json({
    object: "list",
    data: [
      { id: "gemini-1.5-flash", object: "model" },
      { id: "gemini-1.5-pro", object: "model" },
      { id: "gemini-2.0-flash-exp", object: "model" }
    ]
  });
});

app.post("/v1/messages", async (req, res) => {
  const { model, messages } = req.body;

  const prompt = messages.map(m => m.content).join("\n");

  const response = await fetch(
    `${GEMINI_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();

  res.json({
    id: "chatcmpl-" + Date.now(),
    object: "chat.completion",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: data.candidates?.[0]?.content?.[0]?.text || "No response"
        }
      }
    ]
  });
});

app.listen(8080, () => console.log("Gemini Proxy running on port 8080")); 
