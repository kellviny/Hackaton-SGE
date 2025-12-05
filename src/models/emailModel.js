import { query } from '../config/db.js'


export async function getAll() {
    const res = await query('SELECT * FROM emails ORDER BY date DESC')
    return res.rows
}


export async function getPending() {
    const res = await query('SELECT * FROM emails WHERE NOT classified ORDER BY date DESC')
    return res.rows
}


export async function getClassified() {
    const res = await query('SELECT * FROM emails WHERE classified ORDER BY date DESC')
    return res.rows
}


export async function findById(id) {
    const res = await query('SELECT * FROM emails WHERE id = $1', [id])
    return res.rows[0]
}


export async function create(email) {
    const text = `INSERT INTO emails(id, sender, recipient, subject, body, date, state, city, classified)
VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
    const values = [
        email.id,
        email.sender,
        email.recipient,
        email.subject || null,
        email.body || null,
        email.date,
        email.state || null,
        email.city || null,
        email.classified || false
    ]
    const res = await query(text, values)
    return res.rows[0]
}


export async function update(id, data) {
    const fields = []
    const values = []
    let idx = 1
    for (const key of Object.keys(data)) {
        fields.push(`${key} = $${idx}`)
        values.push(data[key])
        idx++
    }
    if (fields.length === 0) return await findById(id)
    const text = `UPDATE emails SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`
    values.push(id)
    const res = await query(text, values)
    return res.rows[0]
}


export async function remove(id) {
    const res = await query('DELETE FROM emails WHERE id = $1 RETURNING *', [id])
    return res.rows[0]
}