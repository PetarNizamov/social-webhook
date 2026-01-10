const axios = require('axios');

async function postToLinkedIn(job) {
  try {
    const L = job.lang.toUpperCase();
    const token = process.env[`LI_TOKEN_${L}`];
    const org = process.env[`LI_ORG_${L}`];

    let asset;

    if (job.image) {
      // 1️⃣ register upload
      const register = await axios.post(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          registerUploadRequest: {
            owner: org,
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            serviceRelationships: [
              {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent',
              },
            ],
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const uploadUrl =
        register.data.value.uploadMechanism[
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
        ].uploadUrl;

      asset = register.data.value.asset;

      // 2️⃣ upload image
      const img = await axios.get(job.image, { responseType: 'arraybuffer' });
      await axios.put(uploadUrl, img.data, {
        headers: { 'Content-Type': 'image/jpeg' },
      });
    }

    // 3️⃣ create post
    await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: org,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: `${job.title}\n${job.url}` },
            shareMediaCategory: asset ? 'IMAGE' : 'NONE',
            media: asset
              ? [
                  {
                    status: 'READY',
                    media: asset,
                  },
                ]
              : [],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('LinkedIn POST OK:', job.lang);
  } catch (err) {
    console.error('LinkedIn POST FAILED:', err.message);
    throw err;
  }
}

module.exports = { postToLinkedIn };
