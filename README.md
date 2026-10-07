# SupportPilot

**The support agent that replaces repetitive tickets.**

SupportPilot is an AI customer-support agent for e-commerce teams. It replaces the repetitive 80% of support tickets—order status, policy questions, and product inquiries—so human agents can focus on exceptions and high-value conversations.

## How it works

Every customer message passes through an explicit intent router instead of one generic retrieval pipeline. The router classifies the query into one of seven intents and sends it to the matching tool:

1. `small_talk` → conversation
2. `policy_qa` → policy retrieval
3. `product_query` → product catalog
4. `order_query` → order lookup
5. `review_analysis` → review analyzer
6. `image_query` → image inspector
7. `web_search` → web search

Each answer includes a visible execution trace showing the detected intent and selected tool. When a request is ambiguous—such as “my package hasn't arrived”—SupportPilot asks for the missing order number before attempting an answer.

## Sponsor integrations

- **Agent37 Cloud APIs:** hosts the persistent cloud agent and executes every resolved support turn.
- **Supabase:** provides the configured authentication and application database foundation.
- **OpenAI:** produces the final concise, customer-facing response from grounded tool context.

## Demo

Run the app, open [http://localhost:3000](http://localhost:3000), and try:

1. `What is your return policy?`
2. `Where is order #1001?`
3. `my package hasn't arrived` → then reply `#1001`

The interface displays `intent → tool` beneath every agent answer.

## Local development

```bash
npm install
npm run setup
npm run dev
```

Secrets stay in `.env.local`, which is excluded from Git.

---

Built at “Build an Agent” Hackathon, SF Tech Week 2026. Prototype on mock store data.
