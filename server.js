const admin = require('firebase-admin');
const serviceAccount = require('./prognosticai-firebase-adminsdk-3wsmj-2bd5c20060.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://prognosticai-default-rtdb.firebaseio.com"
});

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
  origin: ['https://see.prognostic.ai', 'https://prognostic-backend.herokuapp.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

function markdownToHtml(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/### (.*)/g, '<h3 class="text-xl font-bold mb-2">$1</h3>')
    .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mb-4">$1</h2>')
    .replace(/# (.*)/g, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
    .replace(/\[SECTION:(.*?)\]\((.*?)\)\n([\s\S]*?)(?=\[SECTION|$)/g, (match, title, icon, content) => `
      <div class="section-container mb-8">
        <div class="section-icon mb-4">
          <i class="fas fa-${icon} text-4xl text-blue-500"></i>
        </div>
        <div class="section-content">
          <h2 class="text-2xl font-bold mb-4">${title}</h2>
          ${content}
        </div>
      </div>
    `)
    .replace(/\[FEATURES\]\n((?:- .*\n)+)/g, (match, list) => {
      const items = list.split('\n').filter(item => item.trim() !== '').map(item => {
        const [icon, text] = item.replace('- ', '').split(':');
        return `<div class="feature-item flex items-center mb-2"><i class="fas fa-${icon} mr-2 text-blue-500"></i>${text}</div>`;
      }).join('');
      return `<div class="feature-list">${items}</div>`;
    })
    .replace(/\[BULLETS\]\n((?:> .*\n)+)/g, (match, list) => {
      const items = list.split('\n').filter(item => item.trim() !== '').map(item => {
        return `<li class="mb-2">${item.replace('> ', '')}</li>`;
      }).join('');
      return `<ul class="bullet-list list-disc pl-5">${items}</ul>`;
    })
    .replace(/\[REPLACEMENTS\]\n((?:- .*\n)+)/g, (match, list) => {
      const items = list.split('\n').filter(item => item.trim() !== '').map(item => {
        return `<span class="replacement-logo inline-block mr-4 mb-2">${item.replace('- ', '')}</span>`;
      }).join('');
      return `<div class="replacements flex flex-wrap">${items}</div>`;
    })
    .replace(/\[CTA:(.*?)\]/g, '<a href="#" class="cta-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block mt-4">$1</a>')
    .replace(/\n/g, '<br>');
}

app.post('/setResult', (req, res, next) => {
  console.log('Received POST request to /setResult');
  console.log('Request body:', JSON.stringify(req.body));
  
  try {
    if (!req.body || typeof req.body.text !== 'string' || !req.body.userId || !req.body.quizId) {
      console.error('Invalid request body received:', JSON.stringify(req.body));
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body. Expected {text: string, userId: string, quizId: string}' 
      });
    }
    
    const decodedText = decodeURIComponent(req.body.text);
    console.log('Decoded text:', decodedText);
    
    const processedText = markdownToHtml(decodedText) || '';
    
    admin.database().ref(`quizzes/${req.body.quizId}/responses/${req.body.userId}`).set({
      content: processedText,
      timestamp: admin.database.ServerValue.TIMESTAMP
    }).then(() => {
      res.json({ success: true, length: processedText.length });
    }).catch((error) => {
      next(error);
    });
  } catch (error) {
    next(error);
  }
});

app.get('/getText', (req, res, next) => {
  console.log('Received GET request to /getText');
  
  try {
    const { userId, quizId } = req.query;
    if (!userId || !quizId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and Quiz ID are required' 
      });
    }

    admin.database().ref(`quizzes/${quizId}/responses/${userId}`).once('value').then((snapshot) => {
      const data = snapshot.val();
      if (!data || !data.content) {
        return res.status(404).json({ 
          success: false, 
          error: 'No content available for this user and quiz' 
        });
      }
      res.json({ success: true, text: data.content, length: data.content.length });
    }).catch((error) => {
      next(error);
    });
  } catch (error) {
    next(error);
  }
});

app.get('/getClickFunnelsStyle', (req, res, next) => {
  try {
    const { userId, quizId } = req.query;
    if (!userId || !quizId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and Quiz ID are required' 
      });
    }

    admin.database().ref(`quizzes/${quizId}/responses/${userId}`).once('value').then((snapshot) => {
      const data = snapshot.val();
      if (!data || !data.content) {
        return res.status(404).json({ 
          success: false, 
          error: 'No content available for this user and quiz' 
        });
      }

      const content = data.content;
      const sections = content.split('<h2>').slice(1).map(section => {
        const [title, ...content] = section.split('</h2>');
        return {
          title: title.trim(),
          bullets: content.join('</h2>').split('<br>').filter(bullet => bullet.trim())
        };
      });

      const clickFunnelsContent = {
        title: "Your PrognosticAI Vision",
        sections: sections
      };

      res.json({ success: true, content: clickFunnelsContent });
    }).catch((error) => {
      next(error);
    });
  } catch (error) {
    next(error);
  }
});

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
