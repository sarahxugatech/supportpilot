export type Intent =
  | "small_talk"
  | "policy_qa"
  | "product_query"
  | "order_query"
  | "review_analysis"
  | "image_query"
  | "web_search";

export type Decision = {
  intent: Intent;
  tool: string;
  orderId?: string;
  needsOrderId?: boolean;
};

const products = [
  "Aero Wireless Headphones", "Arc Mechanical Keyboard", "Beam 4K Webcam",
  "Cloud Travel Charger", "Drift Gaming Mouse", "Echo Smart Speaker",
  "Flux USB-C Hub", "Glow Desk Lamp", "Halo Fitness Watch", "Iris Portable Monitor",
];
const statuses = ["delivered", "in transit", "processing", "shipped"];
const orders = Array.from({ length: 20 }, (_, index) => ({
  id: String(1001 + index),
  product: products[index % products.length],
  status: index === 0 ? "in transit" : statuses[index % statuses.length],
  eta: index === 0 ? "October 9" : `October ${8 + (index % 8)}`,
  tracking: `A37-${81001 + index}`,
}));

export function route(message: string, pending?: Intent): Decision {
  const text = message.toLowerCase().trim();
  const orderId = message.match(/#?\b(10\d{2})\b/)?.[1];
  if (pending === "order_query" && orderId) return { intent: "order_query", tool: "order_lookup", orderId };
  if (/\b(hello|hi|hey|thanks|thank you)\b/.test(text)) return { intent: "small_talk", tool: "conversation" };
  if (/\b(return policy|shipping policy|refund policy|how long.*refund|how many days.*return)\b/.test(text)) return { intent: "policy_qa", tool: "policy_search" };
  if (orderId || /\b(order|package|parcel|delivery|tracking|shipment|arrived)\b/.test(text)) {
    return { intent: "order_query", tool: orderId ? "order_lookup" : "clarify_order_number", orderId, needsOrderId: !orderId };
  }
  if (/\b(review|rating|customers say|sentiment)\b/.test(text)) return { intent: "review_analysis", tool: "review_analyzer" };
  if (/\b(image|photo|picture|damaged item)\b/.test(text)) return { intent: "image_query", tool: "image_inspector" };
  if (/\b(latest|current|news|search the web|online)\b/.test(text)) return { intent: "web_search", tool: "web_search" };
  if (/\b(product|sell|stock|headphones|keyboard|webcam|charger|mouse|speaker|monitor|watch)\b/.test(text)) return { intent: "product_query", tool: "product_catalog" };
  return { intent: "small_talk", tool: "conversation" };
}

export function toolContext(decision: Decision, message: string): string {
  if (decision.intent === "policy_qa") return "Returns are accepted within 30 days of delivery. Items must be unused and in original packaging. Refunds return to the original payment method in 3–5 business days after inspection. Standard shipping takes 3–5 business days; express takes 1–2.";
  if (decision.intent === "order_query") {
    const order = orders.find((item) => item.id === decision.orderId);
    return order ? `Order #${order.id}: ${order.product}; status: ${order.status}; estimated delivery: ${order.eta}; tracking: ${order.tracking}.` : `Order #${decision.orderId} was not found in the demo store.`;
  }
  if (decision.intent === "product_query") return `Demo catalog: ${products.join(", ")}. All listed products are in stock.`;
  if (decision.intent === "review_analysis") return "Demo reviews average 4.4/5. Customers praise ease of use and delivery speed; the main complaint is packaging.";
  if (decision.intent === "image_query") return "No image was attached to this text-only demo request.";
  if (decision.intent === "web_search") return "Web search is available through the Agent37 cloud agent; answer only with clearly sourced current information.";
  return `The user said: ${message}`;
}
