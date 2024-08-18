const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let storedText = '';

app.post('/setText', (req, res) => {
    storedText = req.body.text;
    res.json({ success: true });
});

app.get('/getText', (req, res) => {
    res.json({ text: storedText });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});