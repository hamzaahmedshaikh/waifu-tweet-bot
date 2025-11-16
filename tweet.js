const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function postToTwitter(caption, imagePath) {
  console.log('🐦 Starting Twitter post automation...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    // Load cookies
    console.log('🍪 Loading cookies from cookies.json...');
    const cookiesPath = path.join(__dirname, 'cookies.json');
    const cookiesString = await fs.readFile(cookiesPath, 'utf-8');
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
    
    // Navigate to Twitter compose
    console.log('🌐 Navigating to Twitter...');
    await page.goto('https://twitter.com/compose/tweet', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await page.waitForTimeout(2000);
    
    // Type caption
    console.log('⌨️  Typing caption...');
    const textSelector = '[data-testid="tweetTextarea_0"]';
    await page.waitForSelector(textSelector, { timeout: 10000 });
    await page.click(textSelector);
    await page.type(textSelector, caption, { delay: 50 });
    
    await page.waitForTimeout(1000);
    
    // Upload image
    console.log('🖼️  Uploading image...');
    const fileInputSelector = 'input[type="file"][accept*="image"]';
    const fileInput = await page.$(fileInputSelector);
    
    if (fileInput) {
      await fileInput.uploadFile(imagePath);
      console.log('✅ Image uploaded!');
      await page.waitForTimeout(3000); // Wait for upload to complete
    } else {
      throw new Error('File input not found');
    }
    
    // Click Tweet button
    console.log('📤 Clicking Tweet button...');
    const tweetButtonSelector = '[data-testid="tweetButtonInline"]';
    await page.waitForSelector(tweetButtonSelector, { timeout: 5000 });
    await page.click(tweetButtonSelector);
    
    // Wait for post confirmation
    await page.waitForTimeout(5000);
    
    console.log('✅ Tweet posted successfully!');
    
  } catch (error) {
    console.error('❌ Error posting to Twitter:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = { postToTwitter };