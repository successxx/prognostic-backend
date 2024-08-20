const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.text({ type: 'text/plain', limit: '50mb' }));
app.use(cors());

let latestText = '';

app.post('/setText', (req, res) => {
  try {
    latestText = req.body; // Store the raw HTML text
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
