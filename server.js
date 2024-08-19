const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.text({ limit: '50mb' }));
app.use(cors());

let latestText = '';

// Helper function to sanitize logged text
const sanitizeForLog = (text) => {
  if (text.length <= 50) return text;
  return text.substring(0, 25) + '...' + text.substring(text.length - 25);
};

app.post('/setText', (req, res) => {
  try {
    let text;
    if (typeof req.body === 'string') {
      text = req.body;
    } else if (req.body && typeof req.body.text === 'string') {
      text = req.body.text;
    } else {
      console.error('Invalid request body received:', req.body);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body. Expected string or {text: string}' 
      });
    }

    latestText = text;
    console.log(`Received text (length: ${latestText.length}). Preview: ${sanitizeForLog(latestText)}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /setText:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/getText', (req, res) => {
  try {
    res.json({ text: latestText });
    console.log(`Sent text (length: ${latestText.length}). Preview: ${sanitizeForLog(latestText)}`);
  } catch (error) {
    console.error('Error in /getText:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
