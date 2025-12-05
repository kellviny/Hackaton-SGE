import { statesData } from '../data/states.js'
import pool from '../config/db.js'


function randFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}


async function seed() {
    try {
        const senders = ["joao@empresa.com", "maria@empresa.com", "ana@empresa.com", "pedro@empresa.com", "lucia@empresa.com"]
        const recipients = ["clienteA@dominio.com", "clienteB@dominio.com", "clienteC@dominio.com", "clienteD@dominio.com"]
        const subjects = ["Proposta Comercial", "Fatura", "Agendamento", "Relatório", "Orçamento", "Cotação"]


        const client = await pool.connect()
        try {
            for (let i = 0; i < 50; i++) {
                const id = Date.now() + i
                const date = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                const stateKeys = Object.keys(statesData)
                const state = Math.random() > 0.3 ? randFrom(stateKeys) : null
                const city = state ? randFrom(statesData[state]) : null
                const classified = state !== null


                await client.query(`INSERT INTO emails(id,sender,recipient,subject,body,date,state,city,classified) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`, [
                    id,
                    randFrom(senders),
                    randFrom(recipients),
                    randFrom(subjects) + " #" + (i + 1),
                    "Corpo de exemplo",
                    date.toISOString(),
                    state,
                    city,
                    classified
                ])
            }
        } finally {
            client.release()
        }


        console.log('Seed completo')
        process.exit(0)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}


seed()