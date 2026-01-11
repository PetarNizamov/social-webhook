require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const { enqueue, dequeue } = require('./queue');
const { postToX } = require('./x');
const { postToLinkedIn } = require('./linkedin');
const uploadYouTube = require('./youtube');
const uploadTikTok = require('./tiktok');

const app = express();
app.use(express.json());

const LOG_FILE = path.join(__dirname, 'webhook.log');
const MAX_ATTEMPTS = 3;
const WORKER_DELAY = 3000;

// ---------- LOGGER ----------
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(line.trim());
}

// ---------- DISPATCH ----------
async function dispatch(job) {
  switch (job.network) {
    case 'x':
      return postToX(job);
    case 'linkedin':
      return postToLinkedIn(job);
    case 'youtube':
      return uploadYouTube(job);
    case 'tiktok':
      return uploadTikTok(job);
    default:
      throw new Error(`Unknown network: ${job.network}`);
  }
}

// ---------- WORKER ----------
setInterval(async () => {
  const job = await dequeue();
  if (!job) return;

  job.attempts = (job.attempts || 0) + 1;
  log(`PROCESS ${job.network} | attempt ${job.attempts}`);

  try {
    await dispatch(job);
    log(`SUCCESS ${job.network} | ${job.lang}`);
  } catch (err) {
    log(`ERROR ${job.network}: ${err.message}`);

    if (job.attempts < MAX_ATTEMPTS) {
      log(`RETRY ${job.network}`);
      await enqueue(job);
    } else {
      log(`FAILED ${job.network} after ${MAX_ATTEMPTS} attempts`);
    }
  }
}, WORKER_DELAY);

// ---------- WEBHOOK ----------
app.post('/social-webhook', async (req, res) => {
  const payload = {
    ...req.body,
    attempts: 0,
    createdAt: Date.now()
  };

  await enqueue(payload);
  log(`QUEUED ${payload.network} | ${payload.lang}`);

  res.json({ status: 'queued' });
});

// ---------- DASHBOARD ----------
app.get('/dashboard', async (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// ---------- START ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  log(`Webhook running on port ${PORT}`);
});
