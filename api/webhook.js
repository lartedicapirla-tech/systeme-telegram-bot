export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  // --- CONFIG BOT TELEGRAM ---
  const BOT_TOKEN = "8274645524:AAEqCYhyImPc44xKnUoFk3OzigdM8ZBbf0E";
  const CHAT_ID = "17414289";

  const payload = req.body || {};
  const data = payload.data || {};

  // ---- EMAIL CLIENTE ----
  const email = data.customer?.email || "Email non trovata";

  // ---- NOME PRODOTTO ----
  const prodotto =
    data.offer_price_plan?.name ||
    data.price_plan?.name ||
    data.funnel_step?.funnel?.name ||
    "Prodotto non trovato";

  // ---- PREZZO ----
  let amountCents =
    typeof data.price_plan?.amount === "number"
      ? data.price_plan.amount
      : typeof data.offer_price_plan?.direct_charge_amount === "number"
      ? data.offer_price_plan.direct_charge_amount
      : null;

  // Applichiamo eventuale sconto percentuale (come nel tuo esempio 100%)
  const coupon = data.coupon || {};
  if (
    amountCents !== null &&
    coupon.discount_type === "percent" &&
    typeof coupon.discount_amount === "number"
  ) {
    const percent = 100 - coupon.discount_amount; // es: 100 - 100 = 0
    amountCents = Math.round((amountCents * percent) / 100);
  }

  let prezzo = "N/A";
  if (typeof amountCents === "number") {
    const currency =
      (data.price_plan?.currency ||
        data.offer_price_plan?.currency ||
        "eur"
      ).toUpperCase();
    const amount = (amountCents / 100).toFixed(2); // da centesimi a euro con 2 decimali
    prezzo = `${amount} ${currency}`;
  }

  const testo =
    `🔥 *NUOVA VENDITA!* \n` +
    `📦 Prodotto: *${prodotto}* \n` +
    `💰 Prezzo: *${prezzo}* \n` +
    `📧 Cliente: *${email}*`;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: testo,
      parse_mode: "Markdown",
    }),
  });

  return res.status(200).json({ status: "ok" });
}
