
export const STOCK_KEY_PREFIX = "ars:stock:"; // chave por SKU → quantidade numérica
export const ROUND_ROBIN_KEY = "ars:whatsapp:rr"; // índice de rodízio

export function stockKey(sku) {
  return `${STOCK_KEY_PREFIX}${sku}`;
}
