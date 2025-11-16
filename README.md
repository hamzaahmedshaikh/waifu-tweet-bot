# 🤖 Anime Twitter Bot

Automated bot that posts anime images with AI-generated captions to Twitter/X 9 times daily.

## 📋 Prerequisites

- Node.js (v16 or higher)
- Twitter/X account
- Chrome browser (for Puppeteer)

## 🚀 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Export Twitter cookies:**
   
   a. Install a browser extension like "EditThisCookie" or "Cookie-Editor"
   
   b. Login to Twitter/X in your browser
   
   c. Export cookies and save ONLY these required cookies to `cookies.json`:
      - `auth_token`
      - `ct0`
   
   d. Format should match `cookies.json` template provided
   
   **Important:** Keep your `cookies.json` file secure and never share it!

3. **Verify cookies.json format:**
   ```json
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
   ```

## ▶️ Usage

**Start the bot:**
```bash
node bot.js
```

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

```
anime-twitter-bot/
├── bot.js           # Main bot logic
├── tweet.js         # Puppeteer Twitter automation
├── package.json     # Dependencies
├── cookies.json     # Your Twitter session cookies
├── image.png        # Downloaded anime image (auto-generated)
└── README.md        # This file
```

## 🔧 Configuration

**To change posting frequency:**
Edit `FLORIDA_POST_TIMES` array in `bot.js` using cron syntax.

**To customize captions:**
Modify the `captions` array in `generateCaption()` function.

**For headless mode (production):**
In `tweet.js`, change `headless: false` to `headless: true`

## ⚠️ Important Notes

1. **Cookie Security:** Never commit `cookies.json` to version control
2. **Rate Limits:** Twitter may rate limit if posting too frequently
3. **Session Expiry:** Cookies expire; re-export if bot stops working
4. **Legal:** Ensure compliance with Twitter's Terms of Service

## 🐛 Troubleshooting

**Bot can't login:**
- Re-export fresh cookies from logged-in browser session
- Verify `auth_token` and `ct0` values are correct

**Image download fails:**
- Check internet connection
- Verify nekos.best API is accessible

**Selector errors:**
- Twitter's UI may have changed
- Update selectors in `tweet.js` by inspecting Twitter's DOM

## 📝 License

MIT - Use at your own risk

## ⚡ Tips

- Run bot on a VPS/server for 24/7 operation
- Add `.gitignore` with `cookies.json` and `node_modules/`
- Monitor logs to ensure posts are successful
- Consider adding error notifications (Discord webhook, email, etc.)

---

**Happy posting! 🎌✨**