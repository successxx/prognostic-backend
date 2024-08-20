const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

let latestText = '';

// Helper function to convert Markdown to HTML
function markdownToHtml(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>');
}

app.post('/setText', (req, res) => {
  try {
    if (!req.body || typeof req.body.text !== 'string') {
      console.error('Invalid request body received:', req.body);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body. Expected {text: string}' 
      });
    }

    // Convert Markdown to HTML and replace <br> with newlines
    latestText = markdownToHtml(req.body.text).replace(/<br>/g, '\n');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /setText:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/getText', (req, res) => {
  res.json({ text: latestText });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
