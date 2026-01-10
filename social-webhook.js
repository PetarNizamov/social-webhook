const express = require('express');
const app = express();

app.use(express.json());

app.post('/social-webhook', (req, res) => {
  const { network, title, url, image, lang, type } = req.body;

  console.log('INCOMING DATA:', req.body);

  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Webhook running on port', PORT);
});
