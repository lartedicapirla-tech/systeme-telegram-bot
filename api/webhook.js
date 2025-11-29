export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  // --- CONFIG TELEGRAM ---
  const BOT_TOKEN = "8274645524:AAEqCYhyImPc44xKnUoFk3OzigdM8ZBbf0E";
  const CHAT_ID = "17414289";

  const payload = req.body || {};
  const data = payload.data || {};

  // --- CUSTOMER ---
  const customer = data.customer || {};
  const fields = customer.fields || {};

  const firstName =
    fields.first_name && typeof fields.first_name === "string"
      ? fields.first_name.trim()
      : "Nome non trovato";

  const lastName =
    fields.surname && typeof fields.surname === "string"
      ? fields.surname.trim()
      : "Cognome non trovato";

  const email =
    customer.email && typeof customer.email === "string"
      ? customer.email.trim()
      : "Email non trovata";

  const paymentProcessor = customer.payment_processor
    ? customer.payment_processor.toUpperCase()
    : "N/D";

  // --- PRODOTTO / PREZZO ---
  const pricePlan = data.price_plan || {};
  const offerPricePlan = data.offer_price_plan || {};

  const prodotto =
    pricePlan.name ||
    offerPricePlan.name ||
    "Prodotto non trovato";

  // prezzo
  let amountCents = null;
  if (typeof pricePlan.amount === "number") {
    amountCents = pricePlan.amount;
  } else if (typeof offerPricePlan.direct_charge_amount === "number") {
    amountCents = offerPricePlan.direct_charge_amount;
  }

  let prezzo = "N/A";
  if (typeof amountCents === "number") {
    const currency =
      (pricePlan.currency || offerPricePlan.currency || "eur").toUpperCase();
    const amount = (amountCents / 100).toFixed(2);
    prezzo = `${amount} ${currency}`;
  }

  // --- ORDINE ---
  const order = data.order || {};
  const orderId = order.id || "N/D";

  // --- DATA / ORA ---
  const createdAtRaw = order.created_at || payload.created_at || null;
  let createdAtFormatted = "N/D";

  if (createdAtRaw) {
    const d = new Date(createdAtRaw);
    if (!isNaN(d.getTime())) {
      createdAtFormatted = d.toLocaleString("it-IT", {
        timeZone: "Europe/Rome",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }
  }

  // --- MESSAGGIO TELEGRAM ---
  const testo =
    `🔥 *NUOVA VENDITA!* \n` +
    `👤 Cliente: *${firstName} ${lastName}* \n` +
    `📧 Email: *${email}* \n` +
    `📦 Prodotto: *${prodotto}* \n` +
    `💰 Prezzo: *${prezzo}* \n` +
    `🏦 Metodo di pagamento: *${paymentProcessor}* \n` +
    `🧾 ID ordine: *${orderId}* \n` +
    `🕒 Data e ora: *${createdAtFormatted}*`;

  // --- INVIO TELEGRAM ---
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: testo,
        parse_mode: "Markdown"
      })
    });
  } catch (err) {
    console.error("Errore invio telegram:", err);
  }

  return res.status(200).json({ status: "ok" });
}
