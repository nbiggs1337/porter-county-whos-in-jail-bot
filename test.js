const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const FEED_URL = "https://s3.amazonaws.com/myocv/ocvapps/a19946304/jail.json"

async function fetchJsonFromFeed() {
  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    data.push({
    name: 'HEINTZ, DALE  GERARD JR',
    address: 'CROWN POINT, IN',
    gender: 'M',
    race: 'W',
    age: '42',
    bookingNumber: '2404792',
    arrestDate: '8/1/2025 08:47',
    charges: '35-48-4-6 6 FEL    POSSESSION COCAINE O',
    imageLink: 'https://s3.amazonaws.com/myocv/ocvapps/a19946304/MugshotsImages/2404792.jpeg'
  },)
    return data;
  } catch (err) {
    console.error('Error fetching JSON:', err);
    return null;
  }
}

// Example usage:
fetchJsonFromFeed().then(data => {
  if (data) {
    const now = Date.now();
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;
    const recent = data.filter(item => {
      if (!item.arrestDate) return false;
      const d = Date.parse(item.arrestDate);
      return d > fortyEightHoursAgo;
    });
    console.log('Arrests in last 48 hours:', recent);
  }
});

