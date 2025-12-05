import cron from "node-cron";
import * as gmailService from "./services/gmailService.js";

cron.schedule("*/20 * * * *", async () => {
  try {
    console.log("[cron] Iniciando sync Gmail...");
    const r = await gmailService.syncUnread();
    console.log("[cron] Gmail sync:", r);
  } catch (err) {
    console.error("[cron] erro:", err);
  }
});