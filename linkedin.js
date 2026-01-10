const axios = require('axios');

async function postToLinkedIn(job) {
  const L = job.lang.toUpperCase();

  await axios.post(
    'https://api.linkedin.com/v2/ugcPosts',
    {
      author: process.env[`LI_ORG_${L}`],
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: `${job.title}\n${job.url}` },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env[`LI_TOKEN_${L}`]}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

module.exports = { postToLinkedIn };
