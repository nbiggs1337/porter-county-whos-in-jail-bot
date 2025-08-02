# Porter County Whos In Jail Bot

This project scrapes recent inmate bookings from the Porter County Sheriff public feed and posts the information to Facebook (and optionally Twitter and email). It is designed to run as a scheduled cron job.

## Features
- Fetches new bookings from the Porter County Sheriff feed (last 48 hours)
- Posts booking info and mugshot to a Facebook page using the Graph API
- (Optional) Can post to Twitter and send email notifications
- Configurable via environment variables

## Requirements
- Node.js 18+
- Facebook Page access token and Page ID
- (Optional) Twitter API credentials
- (Optional) SMTP credentials for email

## Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/nbiggs1337/porter-county-scraper.git
   cd porter-county-scraper
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the project root with the following:
   ```env
   PAGE_ID=your_facebook_page_id
   ACCESS_TOKEN=your_facebook_page_access_token
   # Optional for Twitter and email
   # TWITTER_APP_KEY=...
   # TWITTER_APP_SECRET=...
   # TWITTER_ACCESS_TOKEN=...
   # TWITTER_ACCESS_SECRET=...
   # SMTP_USER=...
   # SMTP_PASS=...
   ```
4. (Optional) Edit `fetchAndParse.cron.js` to enable/disable Twitter and email features as needed.

## Usage
- To run once manually:
  ```sh
  node fetchAndParse.cron.js
  ```
- To run automatically every 6 hours (default):
  The cron job is set up in the script using `node-cron`.

## Security
- **Never commit secrets or API keys to git.**
- If you accidentally commit secrets, follow the instructions in the README to remove them from git history and rotate your keys.

## License
MIT
