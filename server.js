const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('./path-to-your-firebase-admin-sdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://prognosticai-default-rtdb.firebaseio.com"
});

app.use(express.json({ limit: '50mb' }));

const corsOptions = {
  origin: '*', // In production, replace with your frontend's domain
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.post('/setResult', async (req, res, next) => {
  try {
    const { userId, quizId, result } = req.body;
    if (!userId || !quizId || !result) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    await admin.database().ref(`quiz_results/${quizId}/${userId}`).set({ result });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get('/getResult/:quizId/:userId', async (req, res, next) => {
  try {
    const { quizId, userId } = req.params;
    const snapshot = await admin.database().ref(`quiz_results/${quizId}/${userId}`).once('value');
    const data = snapshot.val();

    if (!data || !data.result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Result not found' 
      });
    }

    res.json({ success: true, result: data.result });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
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
