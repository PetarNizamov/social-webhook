module.exports = async function postToTikTok(job) {
  if (!job.video_url) return true;

  console.log(`TIKTOK VIDEO [${job.lang}]: ${job.video_url}`);

  // TODO: TikTok API
  return true;
};
