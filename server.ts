import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for chatbot Q&A
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const systemInstruction = `You are the 2UNE AI Assistant, helper for scholars and language-compute validators on India's premier hybrid Human-RLHF layer.
Provide short, precise, and extremely fast answers to contributor questions.
Helpful Context:
- Platform Name: 2UNE Platform (often styled 2UNE).
- Target Audience: Indian language scholars, validators, annotators (Translators, LLM Evaluators, RLHF specialists).
- Reputation Panel: Shows scholar evaluation progress, consistency indices, SLA compliance (100%), and peak performance days.
- Earnings & Tasks: Contributors earn rewards (₹) hourly or per task completion. High-tier contributors (Tier 1 BITS/IIT etc.) earn fast-track approvals.
- Languages: Hindi, Telugu, Tamil, Bengali, Marathi, etc.
- Standard guidelines: Answer in 1 to 3 short sentences. Be incredibly helpful but very brief. Formatting should be clean, clear, and highly scannable with bullet points if necessary. Avoid any filler.`;

      // Map chat history so the model understands the conversational context
      const formattedContents: any[] = [];
      if (history && Array.isArray(history)) {
        history.slice(-6).forEach((h: any) => {
          formattedContents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        });
      }
      
      formattedContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.6,
        }
      });

      res.json({ reply: response.text || "I apologize, but I couldn't generate a response." });
    } catch (error: any) {
      console.error("Gemini server error detail:", error);
      res.status(500).json({ error: error.message || "An error occurred with the Gemini API service." });
    }
  });

  // Vite middleware Setup for Dev/Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
