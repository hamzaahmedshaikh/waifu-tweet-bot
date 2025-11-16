const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs').promises;

// Twitter API credentials
const client = new TwitterApi({
  appKey: 'ynxP6HpMwghlc2WmxTzZOiTjD',
  appSecret: '59YhbP9UAHIwgzHveM4lH0iUk4WOPRFEMljALHhyd211uPpsp8',
  accessToken: '1983628882734665728-0EiKqwNCP53PRCYzZSzf8oCk1Hz0Ts',
  accessSecret: 'OXf05tEjc8LkKKHjBlS5Br4tjkbsuB6st3NGsZJ5x93Sx',
});

async function postToTwitter(caption, imagePath) {
  console.log("🐦 Starting Twitter API post...");

  try {
    // Read the image file
    const imageBuffer = await fs.readFile(imagePath);

    // Upload the media
    console.log("🖼️  Uploading image to Twitter...");
    const mediaId = await client.v1.uploadMedia(imageBuffer, { mimeType: 'image/png' });
    console.log("✅ Image uploaded! Media ID:", mediaId);

    // Post the tweet with the media
    console.log("📤 Posting tweet...");
    const tweet = await client.v2.tweet({
      text: caption,
      media: { media_ids: [mediaId] }
    });

    console.log("✅ Tweet posted successfully! Tweet ID:", tweet.data.id);
  } catch (error) {
    console.error("❌ Error posting to Twitter:", error.message);
    throw error;
  }
}

module.exports = { postToTwitter };
