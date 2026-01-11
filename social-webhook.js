require('dotenv').config();
const express = require('express');
const fs = require('fs');

const { enqueue, dequeue } = require('./queue');
const { postToX } = require('./x');
const { postToLinkedIn } = require('./linkedin');
const postToYouTube = require('./youtube');
const postToTikTok = require('./tiktok');

const app = express();
app.use(express.json());

/* ================= LOGGER ================= */
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync('./webhook.log', line + '\n');
}

/* ================= WEBHOOK ================= */
app.post('/social-webhook', async (req, res) => {
  const job = {
    ...req.body,
    attempts: 0,
    createdAt: Date.now()
  };

  await enqueue(job);
  log(`QUEUED ${job.network} | ${job.lang}`);

  res.json({ status: 'queued' });
});

/* ================= WORKER ================= */
async function worker() {
  const job = await dequeue();
  if (!job) return;

  try {
    job.attempts++;
    log(`PROCESS ${job.network} | try ${job.attempts}`);

    await dispatch(job);

    log(`SUCCESS ${job.network}`);
  } catch (e) {
    log(`ERROR ${job.network}: ${e.message}`);

    if (job.attempts < 3) {
      await enqueue(job);
      log(`RETRY ${job.network}`);
    } else {
      log(`FAILED ${job.network}`);
    }
  }
}

/* ================= DISPATCH ================= */
async function dispatch(job) {
  if (job.network === 'x') return postToX(job);
  if (job.network === 'linkedin') return postToLinkedIn(job);
  if (job.network === 'youtube') return postToYouTube(job);
  if (job.network === 'tiktok') return postToTikTok(job);

  throw new Error('Unknown network');
}

/* ================= DASHBOARD ================= */
app.get('/dashboard', async (req, res) => {
  res.sendFile(__dirname + '/public/dashboard.html');
});

/* ================= START ================= */
setInterval(worker, 3000);

app.listen(process.env.PORT || 3000, () => {
  log('Webhook server started');
});
