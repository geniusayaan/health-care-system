// api/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { healthRoute } from "./routes/heath-ai-routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "welcome" });
});

app.use("/api/health", healthRoute);

export default app; 
