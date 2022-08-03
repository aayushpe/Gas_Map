if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
const path = require('path');
const ejsMate = require('ejs-mate');
const express = require('express');

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const stations = require('./routes/stations');
app.use('/', stations);

app.listen(3000, () => {
    console.log('Listening on port 3000');
})