
export default async function handler(req, res) {
  res.status(200).json({
    ok: true,
    now: new Date().toISOString(),
    endpoints: [
      "/api/health",
      "/api/stock?skus=SKY-001,LIZ-002",
      "/api/whatsapp-target",
      "/api/whatsapp-target?agent=amanda",
      "POST /api/webhooks/bling"
    ]
  });
}
