const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');

async function postToX(job) {
  try {
    const L = job.lang.toUpperCase();

    const client = new TwitterApi({
      appKey: process.env[`X_API_KEY_${L}`],
      appSecret: process.env[`X_API_SECRET_${L}`],
      accessToken: process.env[`X_ACCESS_TOKEN_${L}`],
      accessSecret: process.env[`X_ACCESS_SECRET_${L}`],
    });

    let mediaIds = [];

    if (job.image) {
      const img = await axios.get(job.image, { responseType: 'arraybuffer' });
      const mediaId = await client.v1.uploadMedia(img.data, {
        mimeType: 'image/jpeg',
      });
      mediaIds.push(mediaId);
    }

    await client.v2.tweet({
      text: `${job.title}\n${job.url}`,
      media: mediaIds.length ? { media_ids: mediaIds } : undefined,
    });

    console.log('X POST OK:', job.lang);
  } catch (err) {
    console.error('X POST FAILED:', err.message);
    throw err;
  }
}

module.exports = { postToX };
