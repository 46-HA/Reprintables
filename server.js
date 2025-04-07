import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';  // Import the fileURLToPath utility

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware to allow CORS for development
import cors from 'cors';
app.use(cors());

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the React build files (production build)
app.use(express.static(path.join(__dirname, 'build')));

// API route to fetch data from the external URL
app.get('/api/fetch-data', async (req, res) => {
  try {
    const url = 'https://xggsokc0oko08csowos0wowo.a.selfhosted.hackclub.com/'; // The external URL

    // Make the GET request using Axios
    const response = await axios.get(url);

    // Send the response back to the frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

// Catch-all handler for any request that doesn't match an API route
// This will serve the React app for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
