const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

let latestText = '';

// POST endpoint to accept the text and replace newlines with spaces
app.post('/setText', (req, res) => {
  try {
    latestText = req.body.text.replace(/\r?\n|\r/g, ' ');  // Replace newlines with spaces
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing text:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET endpoint to retrieve the stored text
app.get('/getText', (req, res) => {
  res.json({ text: latestText });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
