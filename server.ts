import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  app.post("/api/generate-avatar", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const fullPrompt = `A professional, high quality, appealing user profile avatar based on this description: ${prompt}. The image should be a flat or vector style avatar, clean background, suitable for a mobile app profile picture. Profile avatar aspect.`;

      let base64Image = null;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { text: fullPrompt },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            base64Image = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (err: any) {
        console.warn("AI generation failed, falling back to DiceBear", err.message);
        // Fallback to deterministic avatar generation based on the prompt
        const seed = encodeURIComponent(prompt.trim());
        const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        
        // Fetch to get base64 or just return URL
        // It's an SVG URL, we can return the URL directly, but frontend expects imageUrl as base64 or url.
        return res.json({ imageUrl: dicebearUrl });
      }

      if (!base64Image) {
        // Fallback if no image returned
        const seed = encodeURIComponent(prompt.trim());
        return res.json({ imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}` });
      }

      res.json({ imageUrl: base64Image });
    } catch (error: any) {
      console.error("Avatar generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate avatar" });
    }
  });

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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
