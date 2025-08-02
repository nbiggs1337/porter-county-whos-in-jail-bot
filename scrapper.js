const puppeteer = require('puppeteer');

async function scrapeInmates() {
  const url = 'https://www.portercountysheriff.com/whosinjail';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Find the iframe element (adjust selector if needed)
  const iframeElement = await page.$('iframe'); // or use a more specific selector
  const frame = await iframeElement.contentFrame();
  console.log(frame)

  // Wait for the .list element inside the iframe
  await frame.waitForSelector('.list', { timeout: 10000 });
  console.log("found list in iframe");

  const inmates = await frame.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.list'));
    return rows.map(row => {
      const name = row.querySelector('.ocv-feed-widget-item-container')?.innerText.trim() || '';
      const details = row.querySelector('.ocv-feed-widget-item-images')?.innerText.trim() || '';
      const chargeList = Array.from(row.querySelectorAll('.ocv-feed-widget-item-content')).map(c => c.innerText.trim());
      return { name, details, charges: chargeList };
    });
  });

  await browser.close();

  return inmates;
}

scrapeInmates().then(inmates => {
  console.log(JSON.stringify(inmates, null, 2));
}).catch(err => {
  console.error('Error scraping:', err);
});
