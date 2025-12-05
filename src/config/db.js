import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("Conectado ao PostgreSQL da Render com SSL!"))
  .catch(err => console.error("Erro ao conectar ao banco:", err));

export async function query(text, params) {
  return pool.query(text, params);
}

export async function initDb() {
  const create = `
    CREATE TABLE IF NOT EXISTS emails (
      id BIGINT PRIMARY KEY,
      sender VARCHAR(255) NOT NULL,
      recipient VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      body TEXT,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      state VARCHAR(5),
      city VARCHAR(255),
      classified BOOLEAN DEFAULT false
    );
  `;
  await pool.query(create);
}

export default pool;
