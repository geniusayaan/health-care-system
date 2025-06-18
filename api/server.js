import express from "express";
import path from 'path';
import { healthRoute } from "./routes/heath-ai-routes.js";
import dotenv from "dotenv";
import { log } from "console";
import { fileURLToPath } from 'url';
import cors from "cors"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




dotenv.config();


log(process.env.GROQ_API_KEY)

const app = express();



app.use(express.json());


app.use(cors());



app.use(express.static(path.join(__dirname, 'Frontend')));




app.use("/api/health", healthRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
