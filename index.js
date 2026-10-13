require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const THEDINATOR_WEBHOOK_BASE = process.env.THEDINATOR_WEBHOOK_BASE;

if (!THEDINATOR_WEBHOOK_BASE) {
  throw new Error("THEDINATOR_WEBHOOK_BASE is missing in .env");
}

/**
 * Tries to find a value in the incoming request under several possible
 * field names, since field names can vary depending on how the
 * SmartSender "External Request" body was configured.
 */
function pickField(source, candidates) {
  for (const key of candidates) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      return source[key];
    }
  }
  return undefined;
}

async function handleIncoming(req, res) {
  // Accept data whether it arrives as a GET query string or a POST body
  const source = { ...req.query, ...req.body };

  console.log("Incoming from SmartSender:", source);

  const telegramId = pickField(source, [
    "telegramId",
    "telegram_id",
    "user_id",
    "tg_id",
    "id",
  ]);

  const subscriberId = pickField(source, [
    "subscriberId",
    "subscriber_id",
    "sub_id",
    "start_param",
    "payload",
    "ref",
  ]);

  if (!telegramId || !subscriberId) {
    console.error("Missing required fields. Full payload was:", source);
    return res.status(400).json({
      success: false,
      error: "telegramId or subscriberId missing",
      received: source,
    });
  }

  const forwardUrl = `${THEDINATOR_WEBHOOK_BASE}?user_id=${encodeURIComponent(
    telegramId
  )}&subscriber_id=${encodeURIComponent(subscriberId)}`;

  try {
    const response = await axios.get(forwardUrl);

    console.log("Forwarded to TheDinator OK:", {
      telegramId,
      subscriberId,
      status: response.status,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Failed to forward to TheDinator:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
}

// Accept both GET and POST, since the exact SmartSender configuration
// may call this endpoint either way.
app.get("/api/smartsender-hook", handleIncoming);
app.post("/api/smartsender-hook", handleIncoming);

app.get("/", (req, res) => {
  res.send("Server running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
