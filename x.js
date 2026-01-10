const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');

async function postToX(job) {
  const L = job.lang.toUpperCase();

  const client = new TwitterApi({
    appKey: process.env[`X_API_KEY_${L}`],
    appSecret: process.env[`X_API_SECRET_${L}`],
    accessToken: process.env[`X_ACCESS_TOKEN_${L}`],
    accessSecret: process.env[`X_ACCESS_SECRET_${L}`],
  });

  let mediaId;
  if (job.image) {
    const img = await axios.get(job.image, { responseType: 'arraybuffer' });
    mediaId = await client.v1.uploadMedia(img.data, { mimeType: 'image/jpeg' });
  }

  await client.v2.tweet({
    text: `${job.title}\n${job.url}`,
    media: mediaId ? { media_ids: [mediaId] } : undefined,
  });
}

module.exports = { postToX };
