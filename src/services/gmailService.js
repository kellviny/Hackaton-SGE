import fs from "fs";
import { google } from "googleapis";
import * as emailService from "./emailService.js";

const CREDENTIALS_PATH = "credentials.json";
const TOKEN_PATH = "token.json";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) throw new Error("credentials.json não encontrado");
  return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
}

function loadToken() {
  if (!fs.existsSync(TOKEN_PATH)) throw new Error("token.json não encontrado. Gere com generate_token.mjs");
  return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
}

function createOAuthClient() {
  const creds = loadCredentials();
  const { client_id, client_secret, redirect_uris } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, (redirect_uris && redirect_uris[0]) || "urn:ietf:wg:oauth:2.0:oob");
  const token = loadToken();
  oAuth2Client.setCredentials(token);
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
  if (messages.length === 0) {
    return { inserted: 0, checked: 0 };
  }

  let inserted = 0;
  let checked = 0;

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];

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
