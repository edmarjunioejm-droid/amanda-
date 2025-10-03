
import { redisGet } from "./_redis.js";
import { stockKey } from "./_stock-keys.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const skus = (req.query.skus || "").toString().split(",").map(s => s.trim()).filter(Boolean);
    if (!skus.length) return res.json({});

    const out = {};
    await Promise.all(
      skus.map(async (sku) => {
        const raw = await redisGet(stockKey(sku)).catch(() => null);
        const qtd = Number(raw ?? 0);
        out[sku] = Number.isFinite(qtd) ? qtd : 0;
      })
    );

    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
}
