
import { redisGet, redisSet } from "./_redis.js";
import { ROUND_ROBIN_KEY } from "./_stock-keys.js";

const AGENTS = [
  { id: "amanda",  name: "Amanda",  number: "+556282007545" },
  { id: "luana",   name: "Luana",   number: "+556286421750" },
  { id: "daniele", name: "Daniele", number: "+556281570173" },
  { id: "cristina",name: "Cristina",number: "+556282008821" },
];

function byId(id) {
  return AGENTS.find(a => a.id === id.toLowerCase());
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const agentQ = (req.query.agent || "").toString().trim().toLowerCase();
    if (agentQ) {
      const a = byId(agentQ);
      if (a) return res.json({ number: a.number, agent: a.id });
      return res.status(404).json({ error: "agent_not_found" });
    }

    const idx = Number(await redisGet(ROUND_ROBIN_KEY)) || 0;
    const next = AGENTS[idx % AGENTS.length];
    await redisSet(ROUND_ROBIN_KEY, (idx + 1) % AGENTS.length);

    const fallback = process.env.WHATSAPP_DEFAULT || next.number;
    res.json({ number: fallback, agent: next.id });
  } catch (e) {
    console.error(e);
    const fallback = process.env.WHATSAPP_DEFAULT || "+5562999999999";
    res.status(200).json({ number: fallback, agent: "default" });
  }
}
