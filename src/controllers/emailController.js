import { query } from "../config/db.js";
import * as gmailService from "../services/gmailService.js";


export async function getAll(req, res) {
  const result = await query("SELECT * FROM emails ORDER BY date DESC");
  res.json(result.rows);
}

export async function getPending(req, res) {
  const result = await query("SELECT * FROM emails WHERE classified = false ORDER BY date DESC");
  res.json(result.rows);
}

export async function getClassified(req, res) {
  const result = await query("SELECT * FROM emails WHERE classified = true ORDER BY date DESC");
  res.json(result.rows);
}

export async function create(req, res) {
  const { id, sender, recipient, subject, body, date, state, city, classified } = req.body;

  const sql = `
    INSERT INTO emails (id, sender, recipient, subject, body, date, state, city, classified)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
  `;

  await query(sql, [id, sender, recipient, subject, body, date, state, city, classified]);

  res.json({ message: "Email criado!" });
}

export async function classify(req, res) {
  const { id } = req.params;
  const { state, city } = req.body;

  await query(
    "UPDATE emails SET state=$1, city=$2, classified=true WHERE id=$3",
    [state, city, id]
  );

  res.json({ message: "Classificado!" });
}

export async function remove(req, res) {
  await query("DELETE FROM emails WHERE id=$1", [req.params.id]);
  res.json({ message: "Removido!" });
}

export async function syncGmail(req, res) {
  try {
    const result = await gmailService.syncUnread();
    res.json({ ok: true, result });
  } catch (err) {
    console.error("Erro syncGmail:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}