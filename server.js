const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());
let latestText = '';
function markdownToHtml(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Handle bold properly
    .replace(/### (.*)/g, '<h3>$1</h3>')  // Handle H3 headers
    .replace(/## (.*)/g, '<h2>$1</h2>')   // Handle H2 headers
    .replace(/# (.*)/g, '<h1>$1</h1>')    // Handle H1 headers
    .replace(/\n/g, '<br>');              // Convert line breaks
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
    // Convert Markdown to HTML
    latestText = markdownToHtml(req.body.text);

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
  console.log(Server running on port ${port});
});
