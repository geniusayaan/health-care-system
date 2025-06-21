import express from "express";
import path from 'path';
import { healthRoute } from "./routes/heath-ai-routes.js";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import cors from "cors";
import serverless from "serverless-http";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, 'Frontend')));


app.use("/api/health", healthRoute);


export const handler = serverless(app);
