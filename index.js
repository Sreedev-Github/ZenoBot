import express from "express";
import { Ollama } from "ollama"; // Ensure correct library import
import connectDB from "./db/dbConnect.js";
import ResponseModel from "./schema/data.model.js";

// Initialize the Ollama client with correct configuration
const ollama = new Ollama({
  model: "zenobot01", // Your live model name
  baseUrl: "http://localhost:11434", // Default Ollama server URL (adjust if needed)
});

const app = express();
const router = express.Router();

app.use(express.json());

connectDB();

// Function to save query and response to the database
const saveQueryResponse = async (query, answer) => {
  try {
    const data = new ResponseModel({
      query,
      answer
    });
    
    await data.save();
    console.log("Data saved to the database:", data);
  } catch (error) {
    console.error("Error saving data to the database:", error);
    throw new Error("Error saving data to the database");
  }
};

// Define the route for handling queries
router.post("/ask-query", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    // Send request to the Ollama model
    const response = await ollama.generate({
      model: "zenobot01", // Ensure the model name matches your live model
      prompt: query,
    });
    const responseText = response.response;

    const cleanedResponse = responseText.replace(/^```(?:json)?\n|```$/g, ''); // Removes starting and ending backticks
    
    console.log("Model response:", cleanedResponse);
    
    
    
    // Save the query and response to the database
    await saveQueryResponse(query, cleanedResponse);

    // Respond with the model's reply
    res.json({ reply: responseText });
  } catch (error) {
    console.error("Error interacting with the model:", error.message);
    res.status(500).send({ error: "Model not found or server error" });
  }
});

app.use("/api", router);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
