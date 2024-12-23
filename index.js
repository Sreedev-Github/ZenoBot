const express = require("express");
const { Ollama } = require("ollama"); // Ensure correct library import

const app = express();
const router = express.Router();

app.use(express.json());

// Initialize the Ollama client with correct configuration
const ollama = new Ollama({
  model: 'zenobot01', // Your live model name
  baseUrl: 'http://localhost:11434', // Default Ollama server URL (adjust if needed)
});

// Define the route for handling queries
router.post('/ask-query', async (req, res) => {
  const { query } = req.body;

  try {
    // Send request to the Ollama model
    const response = await ollama.chat({
      model: 'zenobot01', // Ensure the model name matches your live model
      messages: [{ role: 'user', content: query }],
    });
    console.log(response);
    

    // Respond with the model's reply
    res.json({ reply: response.message.content });
  } catch (error) {
    console.error("Error interacting with the model:", error.message);
    res.status(500).send({ error: 'Model not found or server error' });
  }
});

app.use('/api', router);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
