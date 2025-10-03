
import { redisSet } from "../_redis.js";
import { stockKey } from "../_stock-keys.js";

function verifySignature(req) {
  const secret = process.env.BLING_WEBHOOK_SECRET;
  if (!secret) return true;
  const sig = req.headers["x-bling-signature"];
  return sig === secret;
}

function extractStockUpdates(body) {
  const updates = [];
  const pushUpdate = (sku, qty) => {
    if (!sku) return;
    const q = Number(qty);
    updates.push({ sku: String(sku), qty: Number.isFinite(q) ? q : 0 });
  };

  if (body?.produto?.codigo) {
    pushUpdate(body.produto.codigo, body.produto.estoque ?? body.produto.saldo ?? body.estoque);
  }
  if (Array.isArray(body?.data)) {
    for (const item of body.data) {
      if (item?.produto?.codigo) {
        pushUpdate(item.produto.codigo, item.produto.estoque ?? item.produto.saldo ?? item.estoque);
      }
      if (Array.isArray(item?.produto?.variacoes)) {
        for (const v of item.produto.variacoes) {
          pushUpdate(v?.codigo || v?.sku, v?.estoque ?? v?.saldo);
        }
      }
    }
  }
  if (Array.isArray(body?.produto?.variacoes)) {
    for (const v of body.produto.variacoes) {
      pushUpdate(v?.codigo || v?.sku, v?.estoque ?? v?.saldo);
    }
  }
  return updates;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    if (!verifySignature(req)) return res.status(401).json({ error: "invalid_signature" });

    const body = req.body ?? {};
    const updates = extractStockUpdates(body);
    if (!updates.length) {
      return res.status(200).json({ ok: true, message: "Sem updates" });
    }

    await Promise.all(updates.map(u => redisSet(stockKey(u.sku), u.qty)));
    res.status(200).json({ ok: true, count: updates.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
}
