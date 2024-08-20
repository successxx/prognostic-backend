const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

let latestText = '';

// Function to convert Markdown to actual HTML, avoiding HTML entities
function markdownToHtml(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Handle bold properly
    .replace(/### (.*)/g, '<h3>$1</h3>')  // Handle H3 headers
    .replace(/## (.*)/g, '<h2>$1</h2>')   // Handle H2 headers
    .replace(/# (.*)/g, '<h1>$1</h1>')    // Handle H1 headers
    .replace(/\n/g, '<br>');              // Convert line breaks
}

// POST endpoint to accept text and convert it to HTML
app.post('/setText', (req, res) => {
  try {
    if (!req.body || typeof req.body.text !== 'string') {
      console.error('Invalid request body received:', req.body);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body. Expected {text: string}' 
      });
    }
    // Convert Markdown to HTML and save the result
    latestText = markdownToHtml(req.body.text);

    // Respond with success
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /setText:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET endpoint to return the latest converted HTML
app.get('/getText', (req, res) => {
  // Directly return the HTML, no need for further encoding
  res.json({ text: latestText });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
