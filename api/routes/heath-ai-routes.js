import { Router } from "express";

import { getHealthData, transcribeAudio} from "../controller/health-ai-controller.js"
import {upload} from "../controller/multer.js";


 export const healthRoute = Router();

 

 healthRoute.post("/getHealthData",getHealthData);


 healthRoute.post("/transcribeAudio",transcribeAudio);

 

