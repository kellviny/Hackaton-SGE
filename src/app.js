import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import emailRoutes from "./routes/emailRoutes.js";
import { initDb } from "./config/db.js";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await initDb();

app.use("/api/emails", emailRoutes);

app.use(express.static(path.join(__dirname, "../public")));

app.get((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

export default app;
