require('dotenv').config();
const express = require('express');
const { enqueue, dequeue } = require('./queue');
const { postToX } = require('./x');
const { postToLinkedIn } = require('./linkedin');

const app = express();
app.use(express.json());

setInterval(async () => {
  const job = await dequeue();
  if (!job) return;

  if (job.network === 'x') await postToX(job);
  if (job.network === 'linkedin') await postToLinkedIn(job);
}, 3000);

app.post('/social-webhook', async (req, res) => {
  await enqueue(req.body);
  res.json({ status: 'queued' });
});

app.get('/dashboard', (req, res) => {
  res.send('<h1>Webhook running</h1>');
});

app.listen(process.env.PORT || 3000);
