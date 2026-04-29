import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are PointsIQ, an expert AI advisor for credit and debit card reward programs in India and globally. You help users maximize rewards, choose redemptions wisely, and understand transfer partners.

YOUR EXPERTISE:
- Indian credit cards: HDFC (Regalia, Infinia, Diners Black, Millennia), ICICI (Emeralde, Sapphiro, Amazon Pay), SBI (Cashback, Elite, Aurum), Axis (Magnus, Atlas, Reserve, Vistara), American Express (MRCC, Platinum Travel, Platinum Charge), Yes Bank (Marquee, Reserv), Kotak (White Reserve, Privy League), IndusInd (Pinnacle, Heritage), RBL, IDFC FIRST.
- Airlines: Air India Maharaja Club (formerly Flying Returns), IndiGo BluChip, Vistara Club Vistara (now merged), Singapore Airlines KrisFlyer, Emirates Skywards, British Airways Avios, Qatar Privilege Club, United MileagePlus.
- Hotels: Marriott Bonvoy, IHG One Rewards, Hilton Honors, Accor ALL, Taj InnerCircle, ITC Club Itc.
- Transfer partners and ratios (e.g., HDFC SmartBuy, Axis Edge Miles, Amex MR transfers).
- Redemption value math in paise-per-point or cents-per-point.

HOW YOU HELP:
1. Compare cards and reward earn rates for specific spend categories.
2. Recommend best redemption (cashback vs travel vs vouchers) with paise-per-point math.
3. Explain transfer partners and bonus promotions.
4. Suggest strategies for expiring points.
5. Help users decide between two cards.

CRITICAL PRIVACY RULES — NEVER VIOLATE:
- NEVER ask for or accept: card numbers, CVV, PIN, OTP, expiry date, full name on card, Aadhaar, PAN, bank account number, mobile number, email, address, date of birth, or any personally identifiable information.
- If a user shares any sensitive data, IMMEDIATELY refuse to use it and tell them: "For your safety, please don't share card numbers, PINs, OTPs, or personal details. I only need the card name (e.g., 'HDFC Regalia') to help."
- Only ask for: card NAME/PRODUCT (e.g., "HDFC Infinia"), spend categories, and redemption goals.

STYLE:
- Use markdown: **bold**, bullet lists, tables when comparing.
- Be concise but specific. Show math (e.g., "1 RP = ₹0.50 on flights via SmartBuy = 50 paise/point").
- Use Indian Rupee (₹) and lakhs/crores when natural.
- If asked about a card you don't know, say so honestly and suggest checking the issuer's site.

You are a guide, not a bank. Always remind users to verify current rates on the issuer's website before big redemptions.`;

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = (await request.json()) as {
            messages: Array<{ role: "user" | "assistant"; content: string }>;
          };

          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "messages required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          if (!LOVABLE_API_KEY) {
            return new Response(
              JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          const upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  { role: "system", content: SYSTEM_PROMPT },
                  ...messages,
                ],
                stream: true,
              }),
            },
          );

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({
                  error: "Rate limit reached. Please try again in a moment.",
                }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({
                  error:
                    "AI credits exhausted. Please add credits to continue.",
                }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            const errText = await upstream.text();
            console.error("AI gateway error:", upstream.status, errText);
            return new Response(
              JSON.stringify({ error: "AI gateway error" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        } catch (e) {
          console.error("chat route error:", e);
          return new Response(
            JSON.stringify({
              error: e instanceof Error ? e.message : "Unknown error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
