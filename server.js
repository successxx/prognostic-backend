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

const corsOptions = {
  origin: '*', // In production, replace with your frontend's domain
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

let latestText = '';

function markdownToHtml(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/# (.*)/g, '<h1>$1</h1>')
    .replace(/\n/g, '<br>');
}

app.post('/setText', (req, res, next) => {
  console.log('Received POST request to /setText');
  console.log('Request body:', JSON.stringify(req.body));
  
  try {
    if (!req.body || typeof req.body.text !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body. Expected {text: string}' 
      });
    }
    
    const decodedText = decodeURIComponent(req.body.text);
    console.log('Decoded text:', decodedText);
    
    latestText = markdownToHtml(decodedText) || '';
    console.log('Converted HTML:', latestText);
    console.log('latestText length:', latestText.length);
    
    res.json({ success: true, length: latestText.length });
  } catch (error) {
    next(error);
  }
});

app.get('/getText', (req, res, next) => {
  console.log('Received GET request to /getText');
  console.log('Current latestText content:', latestText);
  console.log('latestText length:', latestText.length);
  
  try {
    if (!latestText) {
      return res.status(404).json({ 
        success: false, 
        error: 'No content available' 
      });
    }
    res.json({ success: true, text: latestText, length: latestText.length });
  } catch (error) {
    next(error);
  }
});

// Add the error handling middleware here, after all your routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
