const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');
const axios = require("axios");
require("dotenv").config()

const PAGE_ID = process.env.PAGE_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const GRAPH_API_URL = `https://graph.facebook.com/v23.0/${PAGE_ID}`;

console.log(PAGE_ID)
console.log(ACCESS_TOKEN)

// Test Twitter client connection


// Run test if called directly
if (true) {
//   testTwitterClient();
}
const FEED_URL = 'https://apps.myocv.com/feed/rtjb/a19946304/inmateSearch';

async function fetchNewBookings() {
  const res = await fetch(FEED_URL);
  const data = await res.json();

  // temp test data
  // data.push({
  //   "title": "ADAMS, MICHAEL  LEE",
  //   "date": { "sec": 1763818487, "usec": 0 },
  //   "content": "<p><b>Inmate Information:</b><br />Gender : M <br />Race : W <br />Age : 51 <br />Location : VALPARAISO, IN <br />Booking Number : 2405209 <br />Charges : 16-42-19-18 6 FEL    POSSESSION HYPODERMI <br /> <br /> </p>",
  //   "creator": "system",
  //   "images": [
  //     { "small": "https://s3.amazonaws.com/myocv/ocvapps/a19946304/MugshotsImages/2405209.jpeg", "large": "https://s3.amazonaws.com/myocv/ocvapps/a19946304/MugshotsImages/2405209.jpeg" }
  //   ],
  //   "status": 1,
  //   "_id": { "$id": "cc95b947126a9fa7e36f1178ab095494" },
  //   "blogID": "https://s3.amazonaws.com/myocv/ocvapps/a19946304/jail.json"
  // });

  const nowSec = Math.floor(Date.now() / 1000);
  console.log(nowSec, Date(nowSec))
  
  const oneDayAgoSec = nowSec - 48 * 60 * 60;
  // Filter using inmate.date.sec (Unix timestamp)
  console.log(data.length, "currently sitting in PCJ")
  const newBookings = data.filter(inmate => {
    // console.log(inmate.date.sec,  oneDayAgoSec)
    return inmate.date.sec > oneDayAgoSec;
  });
  console.log(newBookings)
  return newBookings;
}

function extractBookingDetails(inmate) {
  const name = inmate.title || 'Unknown';
  let charges = '';
  let gender = '', race = '', age = '', location = '', bookingNumber = '';
  if (inmate.content) {
    // Extract charges
    const chargesMatch = inmate.content.match(/Charges ?:([^<]*)/i);
    if (chargesMatch && chargesMatch[1]) {
      charges = chargesMatch[1].replace(/<br\s*\/>/gi, '').replace(/\s+/g, ' ').trim();
    }
    // Extract Gender
    const genderMatch = inmate.content.match(/Gender ?: ?([^<]*)/i);
    if (genderMatch && genderMatch[1]) gender = genderMatch[1].trim();
    // Extract Race
    const raceMatch = inmate.content.match(/Race ?: ?([^<]*)/i);
    if (raceMatch && raceMatch[1]) race = raceMatch[1].trim();
    // Extract Age
    const ageMatch = inmate.content.match(/Age ?: ?([^<]*)/i);
    if (ageMatch && ageMatch[1]) age = ageMatch[1].trim();
    // Extract Location
    const locationMatch = inmate.content.match(/Location ?: ?([^<]*)/i);
    if (locationMatch && locationMatch[1]) location = locationMatch[1].trim();
    // Extract Booking Number
    const bookingNumberMatch = inmate.content.match(/Booking Number ?: ?([^<]*)/i);
    if (bookingNumberMatch && bookingNumberMatch[1]) bookingNumber = bookingNumberMatch[1].trim();
  }
  const bookingDate = inmate.date && inmate.date.sec ? new Date(inmate.date.sec * 1000).toLocaleString() : new Date().toLocaleString();
  const imageUrl = inmate.images && inmate.images[0] && inmate.images[0].large ? inmate.images[0].large : (inmate.images && inmate.images[0] && inmate.images[0].small ? inmate.images[0].small : '');
  return { name, charges, bookingDate, imageUrl, gender, race, age, location, bookingNumber };
}

async function postUpdate(params) {
  const res = await fetch(FEED_URL);
  const data = await res.json();
const textResponse = await await axios.post(`${GRAPH_API_URL}/feed`, {
      message:`Update: PCSO has not updated the database in 24 hours.\nData: ${data.length} currently sitting in PorterCounty Jail.   \n \n \n \n ** this is an automated post from ArrestBot.js! **`,
      access_token: ACCESS_TOKEN
    });
    console.log('Text Post Response:', textResponse.data);


}



async function postToFacebook(booking) {

  const data = extractBookingDetails(booking)
  
  async function postText(message) {
  try {
    const response = await axios.post(`${GRAPH_API_URL}/feed`, {
      message,
      access_token: ACCESS_TOKEN
    });
    return response.data;
  } catch (error) {
    console.error('Error posting text:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to post an image
async function postImage(imageUrl, caption = '') {
  try {
    const response = await axios.post(`${GRAPH_API_URL}/photos`, {
      url: imageUrl,
      caption,
      access_token: ACCESS_TOKEN
    });
    return response.data;
  } catch (error) {
    console.error('Error posting image:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Example usage
(async () => {
  try {

    // // Post a text message
    // const textResponse = await postText('It appears the PCSO Website only updates every X number of hours. Updates will be immediately posted. \n \n \n \n ** this is an automated post from ArrestBot.js! **');
    // console.log('Text Post Response:', textResponse);

    // Post an image
    const imageResponse = await postImage(
       data.imageUrl,
      ` ${data.charges}\n NAME: ${data.name} - GENDER: ${data.gender} \nAGE: ${data.age} - RACE: ${data.race} - LOCATION: ${data.location} \nBOOKED: ${data.bookingDate}`
    );
    console.log('ARREST POSTED:', imageResponse);
  } catch (error) {
    console.error('Main error:', error);
  }
})();
 
}

// Example usage: fetch, then post to both
async function processBookings() {
  const bookings = await fetchNewBookings();
  for (const booking of bookings) {
    // await postToTwitter(booking);
    await postToFacebook(booking);
    // await sendArrestEmail(booking);
  }
}
processBookings();
// postUpdate()


// Run every hour
cron.schedule('0 */6 * * *', processBookings);


console.log('Cron job scheduled: will POST new bookings every 6th hour.');