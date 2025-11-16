const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const schedule = require('node-schedule');
const { postToTwitter } = require('./tweet.cjs');

// Florida timezone posts: 9 times a day (every 2.5 hours from 8 AM to 10 PM)
const FLORIDA_POST_TIMES = [
  '0 8 * * *',   // 8:00 AM
  '30 10 * * *', // 10:30 AM
  '0 13 * * *',  // 1:00 PM
  '30 15 * * *', // 3:30 PM
  '0 18 * * *',  // 6:00 PM
  '30 19 * * *', // 7:30 PM
  '0 20 * * *',  // 8:00 PM
  '30 20 * * *', // 8:30 PM
  '0 22 * * *'   // 10:00 PM
];

async function downloadAnimeImage() {
  console.log('📥 Downloading random anime image...');
  
  try {
    const response = await axios.get('https://nekos.best/api/v2/waifu?amount=1');
    const imageUrl = response.data.results[0].url;
    
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imagePath = path.join(__dirname, 'image.png');
    
    await fs.writeFile(imagePath, imageResponse.data);
    console.log('✅ Image downloaded successfully!');
    
    return imagePath;
  } catch (error) {
    console.error('❌ Error downloading image:', error.message);
    throw error;
  }
}

function generateCaption() {
  const captions = [
    "Name the anime! ✨ #waifu #anime",
    "Who's this cutie? 🌸 #anime #waifu",
    "Guess the series! 💫 #animegirl #waifu",
    "Can you recognize her? 🎌 #anime #otaku",
    "Which anime is this from? 🌺 #waifu #manga",
    "Drop the anime name! ⭐ #animelover #waifu",
    "Know this character? 🌙 #anime #waifu",
    "Tell me the anime! 🎨 #otaku #waifu"
  ];
  
  const caption = captions[Math.floor(Math.random() * captions.length)];
  console.log('📝 Generated caption:', caption);
  return caption;
}

async function runBot() {
  console.log('🤖 Bot started at:', new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  
  try {
    // Download image
    const imagePath = await downloadAnimeImage();
    
    // Generate caption
    const caption = generateCaption();
    
    // Post to Twitter
    await postToTwitter(caption, imagePath);
    
    console.log('✅ Post successful!');
  } catch (error) {
    console.error('❌ Bot error:', error.message);
  }
}

// Schedule posts for Florida timezone
function setupSchedule() {
  console.log('⏰ Setting up schedule for 9 daily posts (Florida timezone)...');
  
  FLORIDA_POST_TIMES.forEach((cronTime, index) => {
    schedule.scheduleJob(cronTime, () => {
      console.log(`📅 Scheduled post #${index + 1} triggered`);
      runBot();
    });
  });
  
  console.log('✅ Schedule configured! Bot will post 9 times daily.');
  console.log('Next posts at (Florida time): 8am, 10:30am, 1pm, 3:30pm, 6pm, 7:30pm, 8pm, 8:30pm, 10pm');
}

// Run immediately on start
console.log('🚀 Anime Twitter Bot Starting...');
runBot();

// Setup recurring schedule
setupSchedule();

// Keep process running
console.log('Bot is now running. Press Ctrl+C to stop.');