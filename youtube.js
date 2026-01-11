module.exports = async function postToYouTube(job) {
  if (!job.video_url) return true;

  console.log(`YOUTUBE VIDEO [${job.lang}]: ${job.video_url}`);

  // TODO: OAuth + upload
  return true;
};
