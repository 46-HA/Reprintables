import fetch from 'node-fetch';  // Ensure you have node-fetch installed (npm install node-fetch)
import dotenv from 'dotenv';     // For loading environment variables from the .env file
import readline from 'readline'; // For getting user input from the command line

// Load environment variables from .env file
dotenv.config();

const UNSPLASH_API_KEY = process.env.ACCESS; // Get the API key from the .env file

// Initialize readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to search photos on Unsplash
async function searchPhotos(query, page = 1, per_page = 1) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}&client_id=${UNSPLASH_API_KEY}`;

  try {
    // Fetch data from Unsplash
    const response = await fetch(url);

    // Handle if the response is not ok (status code not in 200 range)
    if (!response.ok) {
      throw new Error(`Error fetching data from Unsplash: ${response.statusText}`);
    }

    // Parse JSON response
    const data = await response.json();

    // Check if we have results
    if (data.results && data.results.length > 0) {
      // Log the image URL(s) of the fetched photos
      data.results.forEach((photo, index) => {
        console.log(`Photo ${index + 1}: ${photo.urls.small}`); // URL to small-sized image
      });
    } else {
      console.log('No images found for your search.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ask the user for a search query
rl.question('Enter a search term (e.g., "dog"): ', (query) => {
  // Perform the search with the user-provided query
  searchPhotos(query, 1, 5); // You can adjust the page and per_page parameters
  
  // Close the readline interface after the search is complete
  rl.close();
});
