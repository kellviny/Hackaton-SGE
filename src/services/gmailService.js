import { google } from "googleapis";
import * as emailService from "./emailService.js";
import dotenv from "dotenv";

dotenv.config();

const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];

function createOAuthClient() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  return oAuth2Client;
}


function getBodyFromPayload(payload) {
  const getPart = (p) => {
    if (!p) return "";
    if (p.body && p.body.data) return Buffer.from(p.body.data, "base64").toString("utf-8");
    if (p.parts && p.parts.length) {
      for (const part of p.parts) {
        const v = getPart(part);
        if (v) return v;
      }
    }
    return "";
  };
  return getPart(payload);
}

export async function syncUnread() {
  const auth = createOAuthClient();
  const gmail = google.gmail({ version: "v1", auth });

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread",
    maxResults: 50
  });

  const messages = listRes.data.messages || [];
  if (messages.length === 0) return { inserted: 0, checked: 0 };

  let inserted = 0;
  let checked = 0;

  for (const m of messages) {
    const detail = await gmail.users.messages.get({
      userId: "me",
      id: m.id,
      format: "full"
    });

    const headers = detail.data.payload.headers || [];
    const header = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";

    const sender = header("From") || "unknown@domain";
    const recipient = header("To") || "";
    const subject = header("Subject") || "(sem assunto)";
    const dateRaw = header("Date");
    const date = dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString();
    const body = getBodyFromPayload(detail.data.payload) || "";

    const all = await emailService.listAll();
    const exists = all.find(e =>
      e.sender === sender &&
      e.subject === subject &&
      new Date(e.date).toISOString() === date
    );

    checked++;

    if (exists) {
      await gmail.users.messages.modify({
        userId: "me",
        id: m.id,
        resource: { removeLabelIds: ["UNREAD"] }
      });
      continue;
    }

    const newEmail = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      sender,
      recipient,
      subject,
      body,
      date,
      state: null,
      city: null,
      classified: false
    };

    try {
      await emailService.create(newEmail);
      inserted++;
      await gmail.users.messages.modify({
        userId: "me",
        id: m.id,
        resource: { removeLabelIds: ["UNREAD"] }
      });
    } catch (err) {
      console.error("Erro ao inserir email do Gmail:", err);
    }
  }

  return { inserted, checked };
}
