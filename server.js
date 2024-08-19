const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

let latestText = '';

app.post('/setText', (req, res) => {
  latestText = req.body.text;
  res.json({ success: true });
});

app.get('/getText', (req, res) => {
  res.json({ text: latestText });
});

app.listen(port, () => {
  console.log(Server running on port ${port});
});
