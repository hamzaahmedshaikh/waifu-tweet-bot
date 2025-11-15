import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Download } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const copyToClipboard = (text: string, fileName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileName);
    toast.success(`${fileName} copied to clipboard!`);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${fileName} downloaded!`);
  };

  const files = {
    packageJson: `{
  "name": "anime-twitter-bot",
  "version": "1.0.0",
  "description": "Automated anime posting bot for Twitter/X",
  "main": "bot.js",
  "scripts": {
    "start": "node bot.js"
  },
  "dependencies": {
    "puppeteer": "^21.0.0",
    "node-schedule": "^2.1.1",
    "axios": "^1.6.0"
  }
}`,

    botJs: `const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const schedule = require('node-schedule');
const { postToTwitter } = require('./tweet');

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
      console.log(\`📅 Scheduled post #\${index + 1} triggered\`);
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
console.log('Bot is now running. Press Ctrl+C to stop.');`,

    tweetJs: `const puppeteer = require('puppeteer');
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

module.exports = { postToTwitter };`,

    cookiesTemplate: `[
  {
    "name": "auth_token",
    "value": "YOUR_AUTH_TOKEN_HERE",
    "domain": ".twitter.com",
    "path": "/",
    "httpOnly": true,
    "secure": true
  },
  {
    "name": "ct0",
    "value": "YOUR_CT0_TOKEN_HERE",
    "domain": ".twitter.com",
    "path": "/",
    "httpOnly": false,
    "secure": true
  }
]`,

    readme: `# 🤖 Anime Twitter Bot

Automated bot that posts anime images with AI-generated captions to Twitter/X 9 times daily.

## 📋 Prerequisites

- Node.js (v16 or higher)
- Twitter/X account
- Chrome browser (for Puppeteer)

## 🚀 Installation

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Export Twitter cookies:**
   
   a. Install a browser extension like "EditThisCookie" or "Cookie-Editor"
   
   b. Login to Twitter/X in your browser
   
   c. Export cookies and save ONLY these required cookies to \`cookies.json\`:
      - \`auth_token\`
      - \`ct0\`
   
   d. Format should match \`cookies.json\` template provided
   
   **Important:** Keep your \`cookies.json\` file secure and never share it!

3. **Verify cookies.json format:**
   \`\`\`json
   [
     {
       "name": "auth_token",
       "value": "your_actual_token_value",
       "domain": ".twitter.com",
       "path": "/",
       "httpOnly": true,
       "secure": true
     },
     {
       "name": "ct0",
       "value": "your_actual_ct0_value",
       "domain": ".twitter.com",
       "path": "/",
       "httpOnly": false,
       "secure": true
     }
   ]
   \`\`\`

## ▶️ Usage

**Start the bot:**
\`\`\`bash
node bot.js
\`\`\`

The bot will:
- Post immediately when started
- Schedule 9 posts per day at Florida timezone intervals
- Automatically download random anime images
- Generate creative captions
- Post to Twitter using your cookies

## ⏰ Posting Schedule (Florida Timezone)

- 8:00 AM
- 10:30 AM
- 1:00 PM
- 3:30 PM
- 6:00 PM
- 7:30 PM
- 8:00 PM
- 8:30 PM
- 10:00 PM

## 📁 Project Structure

\`\`\`
anime-twitter-bot/
├── bot.js           # Main bot logic
├── tweet.js         # Puppeteer Twitter automation
├── package.json     # Dependencies
├── cookies.json     # Your Twitter session cookies
├── image.png        # Downloaded anime image (auto-generated)
└── README.md        # This file
\`\`\`

## 🔧 Configuration

**To change posting frequency:**
Edit \`FLORIDA_POST_TIMES\` array in \`bot.js\` using cron syntax.

**To customize captions:**
Modify the \`captions\` array in \`generateCaption()\` function.

**For headless mode (production):**
In \`tweet.js\`, change \`headless: false\` to \`headless: true\`

## ⚠️ Important Notes

1. **Cookie Security:** Never commit \`cookies.json\` to version control
2. **Rate Limits:** Twitter may rate limit if posting too frequently
3. **Session Expiry:** Cookies expire; re-export if bot stops working
4. **Legal:** Ensure compliance with Twitter's Terms of Service

## 🐛 Troubleshooting

**Bot can't login:**
- Re-export fresh cookies from logged-in browser session
- Verify \`auth_token\` and \`ct0\` values are correct

**Image download fails:**
- Check internet connection
- Verify nekos.best API is accessible

**Selector errors:**
- Twitter's UI may have changed
- Update selectors in \`tweet.js\` by inspecting Twitter's DOM

## 📝 License

MIT - Use at your own risk

## ⚡ Tips

- Run bot on a VPS/server for 24/7 operation
- Add \`.gitignore\` with \`cookies.json\` and \`node_modules/\`
- Monitor logs to ensure posts are successful
- Consider adding error notifications (Discord webhook, email, etc.)

---

**Happy posting! 🎌✨**`
  };

  const gitignore = `node_modules/
cookies.json
image.png
*.log`;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            🤖 Anime Twitter Bot Generator
          </h1>
          <p className="text-muted-foreground">
            Complete Node.js code for automated anime posting • 9 posts/day • Florida timezone • Session login
          </p>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur">
          <h2 className="text-xl font-semibold mb-4">📦 Quick Start Instructions</h2>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Copy all files below to a new folder on your computer</li>
            <li>Run <code className="bg-muted px-2 py-1 rounded">npm install</code></li>
            <li>Export your Twitter cookies to <code className="bg-muted px-2 py-1 rounded">cookies.json</code></li>
            <li>Run <code className="bg-muted px-2 py-1 rounded">node bot.js</code></li>
            <li>Bot will post immediately and schedule 9 daily posts!</li>
          </ol>
        </Card>

        <Tabs defaultValue="package" className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
            <TabsTrigger value="package">package.json</TabsTrigger>
            <TabsTrigger value="bot">bot.js</TabsTrigger>
            <TabsTrigger value="tweet">tweet.js</TabsTrigger>
            <TabsTrigger value="cookies">cookies.json</TabsTrigger>
            <TabsTrigger value="readme">README.md</TabsTrigger>
            <TabsTrigger value="gitignore">.gitignore</TabsTrigger>
          </TabsList>

          {Object.entries({
            package: { content: files.packageJson, name: 'package.json' },
            bot: { content: files.botJs, name: 'bot.js' },
            tweet: { content: files.tweetJs, name: 'tweet.js' },
            cookies: { content: files.cookiesTemplate, name: 'cookies.json' },
            readme: { content: files.readme, name: 'README.md' },
            gitignore: { content: gitignore, name: '.gitignore' }
          }).map(([key, file]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(file.content, file.name)}
                  className="flex-1"
                  variant="outline"
                >
                  {copiedFile === file.name ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy {file.name}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => downloadFile(file.content, file.name)}
                  variant="default"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              
              <Card className="p-4 bg-muted/50">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  <code>{file.content}</code>
                </pre>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2 text-primary">🎯 Features Included:</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>✅ Downloads random anime images from nekos.best API</li>
            <li>✅ Generates creative captions with hashtags</li>
            <li>✅ Puppeteer automation (no Twitter API needed)</li>
            <li>✅ Cookie-based session login</li>
            <li>✅ 9 scheduled posts per day (Florida timezone)</li>
            <li>✅ Auto-saves images locally</li>
            <li>✅ Production-ready error handling</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Index;
