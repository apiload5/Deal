import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_PROPERTIES,
  INITIAL_AGENCIES,
  INITIAL_BUILDERS,
  INITIAL_PROJECTS,
  INITIAL_AGENTS,
  INITIAL_BLOGS
} from './src/data/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // --- API ROUTES ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'Deal.pk API', version: '2.0.0' });
  });

  // Properties API
  app.get('/api/properties', (req, res) => {
    const { city, purpose, type, isPremium, isFeatured, search } = req.query;
    let list = [...INITIAL_PROPERTIES];

    if (city && city !== 'All Cities') {
      list = list.filter(p => p.city.toLowerCase() === (city as string).toLowerCase());
    }
    if (purpose && purpose !== 'all') {
      list = list.filter(p => p.purpose === purpose);
    }
    if (type && type !== 'all') {
      list = list.filter(p => p.type === type);
    }
    if (isPremium === 'true') {
      list = list.filter(p => p.isPremium);
    }
    if (isFeatured === 'true') {
      list = list.filter(p => p.isFeatured);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    res.json({ success: true, count: list.length, data: list });
  });

  app.get('/api/properties/:id', (req, res) => {
    const prop = INITIAL_PROPERTIES.find(p => p.id === req.params.id);
    if (!prop) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    res.json({ success: true, data: prop });
  });

  // Agencies API
  app.get('/api/agencies', (req, res) => {
    res.json({ success: true, count: INITIAL_AGENCIES.length, data: INITIAL_AGENCIES });
  });

  // Builders API
  app.get('/api/builders', (req, res) => {
    res.json({ success: true, count: INITIAL_BUILDERS.length, data: INITIAL_BUILDERS });
  });

  // Projects API
  app.get('/api/projects', (req, res) => {
    res.json({ success: true, count: INITIAL_PROJECTS.length, data: INITIAL_PROJECTS });
  });

  // Agents API
  app.get('/api/agents', (req, res) => {
    res.json({ success: true, count: INITIAL_AGENTS.length, data: INITIAL_AGENTS });
  });

  // Blogs API
  app.get('/api/blogs', (req, res) => {
    res.json({ success: true, count: INITIAL_BLOGS.length, data: INITIAL_BLOGS });
  });

  // Upload Simulation
  app.post('/api/upload', (req, res) => {
    // Returns simulated Cloudinary CDN URL
    const mockUrls = [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200'
    ];
    const url = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    res.json({ success: true, url, message: 'Image uploaded successfully to Cloudinary storage' });
  });

  // Admin Stats API
  app.get('/api/admin/stats', (req, res) => {
    res.json({
      success: true,
      stats: {
        totalUsers: 2840,
        totalProperties: 1420,
        pendingApprovals: 8,
        activeAgencies: 45,
        activeBuilders: 18,
        totalBookings: 194,
        totalEscrowRevenue: 'PKR 48.2 Crore',
        pendingKYC: 12,
        pendingCommissions: 'PKR 1.2 Crore'
      }
    });
  });

  // AI Real Estate Assistant Endpoint
  app.post('/api/chat/ask-ai', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: 'Prompt is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          success: true,
          answer: "As Deal.pk AI Advisor: For property transfers in Pakistan (FBR Filer tax is 3% for buyers, 3% for sellers under Section 236K/236C). Non-filers pay higher rates up to 12%. Always verify NOC from CDA/LDA/KDA before submitting token payments via Deal.pk Escrow!"
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are Deal.pk AI Real Estate Assistant, an expert in Pakistan real estate, housing societies (DHA, Bahria Town, CDA Islamabad, LDA Lahore, KDA Karachi), property tax laws (FBR Filer/Non-filer 236K, 236C, 7E), valuation tables, and escrow transaction security. Keep answers concise, professional, and helpful with bullet points where appropriate."
        }
      });

      res.json({ success: true, answer: response.text });
    } catch (err: any) {
      console.error('Gemini error:', err);
      res.json({
        success: true,
        answer: "Deal.pk Advisor Advice: When purchasing real estate in Islamabad, Lahore, or Karachi, ensure you verify: 1) Society NOC from local development authority, 2) FBR Filer status for tax exemptions, 3) Token payment deposit through Deal.pk 100% Escrow Guarantee."
      });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
