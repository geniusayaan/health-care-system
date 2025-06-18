import connectToMongo from "../db/callMongoDb.js";
import User from "../db/models/user-model.js";
import { groq } from "../utils/GroqApi.js";
import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from "dotenv";
import { upload } from './multer.js';
import multer from "multer";




dotenv.config();


connectToMongo();


export const getHealthData = async (request, response) => {
  try {


    const { id, userData } = request.body;

    console.log(id)

    if (!userData || typeof userData !== 'string') {
      return response.status(400).json({ error: "Invalid user data. Please provide valid input." });
    }

    let user = null;

    if (id) {
      user = await User.findById(id);
    }

    const previousProblems = user ? user.problems.join(', ') : '';

    const systemMessage = `
      You are used as a doctor in an app. You have to give the user full information about their illness, what they should do, and even suggest medications.
      Be as detailed as possible and provide professional medical advice.
      And if the preovious problems are relted to the current problem then include that and think and give user a good and better response if not then leave that prevoius problem and he is having the same probelm which was his prevoius problem then do not include anything value in the Problem one. and do not include anything wihtout these things.
      Talk to them like a human and do not add anything unnecessary like "here is", etc. 
      and give everything if the prevoius problem are relted to the current problem and decribe it in response and give your full appreouch to think of it if there is anything else in the user input without the medicl or dieses thing then leave it and in the advice tell that i am only for health not for these kind of things and you dont have to add anything else in the response only the thing i gave you if there are soe other illogical thing then dont ask about it leave it there and only tell i am a health care profeesional and i am not created for this.
      and if there are issues related to the helth then give full approuch and get the serches and think ctitically about it as you can get.
      Give it in this format only:
      - Problem: [problem as string.give evry problem which user has so it can be stored]
      - Advice: [advice as string]
    `;

    const userMessage = `Please give advice and suggestions based on this input: "${userData}". Previous problems: ${previousProblems}`;

    const aiResponse = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const aiText = aiResponse.choices[0]?.message?.content || '';

    const match = aiText.match(/Problem:\s*(.+?)\s*Advice:\s*(.+)/s);

    if (!match) {
      return response.status(500).json({ error: "Could not extract problem and advice from AI response." });
    }

    const extractedProblem = match[1].trim();
    const extractedAdvice = match[2].trim();

    if (!user) {
      user = new User({ problems: [extractedProblem] });
      await user.save();
    } else {
      if (!extractedProblem.length === 0 || !extractedProblem == "") {
        user.problems.push(extractedProblem);
        await user.save();
      }
    }

    return response.json({ advice: extractedAdvice, id: user._id });

  } catch (error) {
    console.error("Error while fetching AI advice:", error);
    return response.status(500).json({ error: "An error occurred while fetching the advice." });
  }
};

  export const transcribeAudio = async (req, res) => {
    upload.single("audio")(req, res, async (err) => {
      if (err instanceof multer.MulterError || err) {
        console.log(err.message)
        return res.status(400).json({ error: "Multer upload failed", detail: err.message });
      }

      if (!req.file) {

        return res.status(400).json({ error: "No audio file uploaded" });
      }

      try {
        const audioFilePath = req.file.path;

        console.log(audioFilePath)

        const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
          method: 'POST',
          headers: {
            'authorization': process.env.ASSEMBLYAI_API_KEY,
            'transfer-encoding': 'chunked',
          },
          body: fs.createReadStream(audioFilePath),
        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.upload_url) {
          return res.status(500).json({ error: "Failed to upload audio to AssemblyAI" });
        }

        const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
          method: 'POST',
          headers: {
            'authorization': process.env.ASSEMBLYAI_API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ audio_url: uploadData.upload_url }),
        });

        const transcriptData = await transcriptResponse.json();


        
        let polling = true;
        let transcriptResult;
        while (polling) {
          const status = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptData.id}`, {
            headers: {
              'authorization': process.env.ASSEMBLYAI_API_KEY,
            },
          });
          transcriptResult = await status.json();

          if (transcriptResult.status === 'completed') {
            polling = false;
          } else if (transcriptResult.status === 'error') {
            return res.status(500).json({ error: transcriptResult.error });
          } else {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        // fs.unlink(audioFilePath, () => { });
  
        console.log(transcriptResult)


        return res.json({ transcript: transcriptResult.text });

      } catch (error) {
        console.error("Transcription error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });
  };
