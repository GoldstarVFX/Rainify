import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import axios from 'axios';

// Create a new express app and set the port
const app = express();
const port = 3000;
let tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow = tomorrow.toISOString().split('T')[0];

//configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

//Variables (API Key and Base URL)
//(Fill in your own API Key)
const apiKey = 'YOUR_API_KEY';

//Function to convert city name to latitude and longitude
async function convertLatLon(city) {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    let latLon = [];
    try {
        const response = await axios.get(url);
        latLon.push(response.data[0].lat);
        latLon.push(response.data[0].lon);
    } catch (error) {
        console.log('Error, please try again');
    }
    return latLon;
}

//Home Route
app.get('/', (req, res) => {
    res.render('index.ejs');
});

//Post Route
app.post('/search', async (req, res) => {
    const city = req.body.city;
    const latLon = await convertLatLon(city);
    const lat = latLon[0];
    const lon = latLon[1];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=rain_sum&timezone=auto&forecast_days=1`;
    try {
        const response = await axios.get(url);
        const rain = response.data.daily.rain_sum[0];
        const city = response.data.timezone.split('/')[1];
        res.render('index.ejs', {rain: rain, city: city});
    } catch (error) {
        console.log('Error, please try again');
    }
});

//Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});