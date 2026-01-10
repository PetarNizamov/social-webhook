const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

async function enqueue(job) {
  await redis.lpush('social_queue', JSON.stringify(job));
}

async function dequeue() {
  const job = await redis.rpop('social_queue');
  return job ? JSON.parse(job) : null;
}

module.exports = { enqueue, dequeue };
