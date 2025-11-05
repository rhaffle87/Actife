// api/search.js  (Node runtime)
import fetch from "node-fetch"; // optional; Vercel Node supports global fetch in newer runtimes
import 'dotenv/config';

export default async function handler(req, res) {
  try {
    const q = req.query.q || "";
    if (!q) return res.status(400).json({ error: "q query param required" });

    const API_KEY = process.env.GOOGLE_API_KEY;
    const CX = process.env.GOOGLE_CX;
    if (!API_KEY || !CX) return res.status(500).json({ error: "Missing API key or CX" });

    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(q)}`;
    const r = await fetch(url);
    const data = await r.json();
    return res.status(r.ok ? 200 : r.status).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal_error" });
  }
}
