import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily / safely
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", appName: "DriverHub Pro", timestamp: new Date().toISOString() });
});

// AI Hardware & Driver Troubleshooting Diagnostic Endpoint
app.post("/api/ai/diagnose", async (req, res) => {
  try {
    const { query, systemSpecs, deviceLogs } = req.body;

    if (!query) {
      res.status(400).json({ error: "Missing diagnostic query string" });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error: "Gemini API key is not configured in process.env.GEMINI_API_KEY",
        fallbackResponse: `Diagnostic Analysis for: "${query}"\n\nHardware Context: ${systemSpecs?.model || "Generic PC"}\n\nKey Recommendations:\n1. Verify if Intel VMD/RST driver is required if disk is missing in Windows Setup.\n2. Ensure Chipset driver is installed prior to GPU driver installation.\n3. Run 'pnputil /export-driver * C:\\DriverBackup' in Administrator PowerShell to create an OEM backup.\n4. Check Windows Device Manager for Code 28 (Missing Driver) or Code 43 (Device Stopped).`
      });
      return;
    }

    const prompt = `
You are DriverHub Pro AI Diagnostic Assistant - an expert hardware engineer specializing in Windows 10/11 drivers, PnPUtil, DISM, OEM platforms (Acer, ASUS, Dell, Lenovo, HP, Intel, NVIDIA, AMD, Realtek), Intel VMD/RST, Chipset order, and hardware troubleshooting.

User Query: ${query}

System Context:
- Model: ${systemSpecs?.model || "Acer Nitro V16 ANV16-71"}
- CPU: ${systemSpecs?.cpu || "Intel Core i7-14650HX"}
- GPU: ${systemSpecs?.gpu || "NVIDIA GeForce RTX 4060 Laptop GPU"}
- OS: ${systemSpecs?.os || "Windows 11 Home 24H2"}
- BIOS: ${systemSpecs?.bios || "v1.12"}
${deviceLogs ? `- Relevant Logs/Errors: ${deviceLogs}` : ""}

Provide a clear, professional, step-by-step diagnostic solution. Structure your answer cleanly with Markdown headings, bullet points, exact Windows command lines (e.g. pnputil, dism, devmgmt.msc), and practical troubleshooting tips.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are DriverHub Pro AI, a technical hardware and driver expert. Provide precise, safe, step-by-step Windows driver troubleshooting advice.",
      },
    });

    res.json({
      success: true,
      answer: response.text || "No analysis output returned.",
    });
  } catch (error: any) {
    console.error("AI Diagnose Error:", error);
    res.status(500).json({
      error: "Failed to query AI Diagnostic Assistant",
      details: error.message,
    });
  }
});

// Driver catalog search / simulation API
app.get("/api/drivers/search", (req, res) => {
  const modelQuery = String(req.query.model || "").toLowerCase();
  res.json({
    query: modelQuery,
    vendorSupported: ["Acer", "ASUS", "Dell", "Lenovo", "HP", "MSI", "Intel", "NVIDIA", "AMD", "Realtek"],
    recommendedInstallOrder: [
      { step: 1, category: "Chipset", name: "Intel / AMD Chipset Driver", critical: true },
      { step: 2, category: "Chipset Component", name: "Intel Management Engine (ME) / Serial IO / GPIO / DTT", critical: true },
      { step: 3, category: "Storage Controller", name: "Intel VMD / RST (Rapid Storage Technology)", critical: true },
      { step: 4, category: "Network", name: "Realtek / Intel Gigabit LAN Driver", critical: false },
      { step: 5, category: "Wireless", name: "Intel / MediaTek / Killer Wi-Fi 6E/7 Driver", critical: true },
      { step: 6, category: "Wireless", name: "Bluetooth Device Driver", critical: false },
      { step: 7, category: "Audio", name: "Realtek High Definition Audio + Console", critical: false },
      { step: 8, category: "Graphics", name: "Intel / AMD Integrated Graphics Driver", critical: true },
      { step: 9, category: "Discrete Graphics", name: "NVIDIA GeForce Game Ready / Studio Driver", critical: true },
      { step: 10, category: "System Utility", name: "OEM Control Center / Hotkey / Dynamic Lighting", critical: false },
    ],
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DriverHub Pro server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
