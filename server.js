const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      console.error('Invalid JSON received:', buf.toString());
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(cors());

let latestText = '';

function markdownToHtml(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/# (.*)/g, '<h1>$1</h1>')
    .replace(/\n/g, '<br>');
}

app.post('/setText', (req, res) => {
  console.log('Received POST request to /setText');
  console.log('Request body:', JSON.stringify(req.body));
  
  try {
    if (!req.body || typeof req.body.text !== 'string') {
      console.error('Invalid request body received:', JSON.stringify(req.body));
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body. Expected {text: string}' 
      });
    }
    
    const decodedText = decodeURIComponent(req.body.text);
    console.log('Decoded text:', decodedText);
    
    latestText = markdownToHtml(decodedText);
    console.log('Converted HTML:', latestText);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /setText:', error.message, '\nStack:', error.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/getText', (req, res) => {
  console.log('Received GET request to /getText');
  console.log('Sending latestText:', latestText);
  res.json({ text: latestText });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
