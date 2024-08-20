const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Move this middleware before route definitions
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

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
      console.error('Invalid request body received:', JSON.stringify(req.body));
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body. Expected {text: string}' 
      });
    }
    // Decode the incoming text
    const decodedText = decodeURIComponent(req.body.text);
    // Convert Markdown to HTML and save the result
    latestText = markdownToHtml(decodedText);
    // Respond with success
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /setText:', error.message, '\nStack:', error.stack);
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
