const express = require('express');
const router = express.Router();

const methodOverride = require('method-override')
const path = require('path');
const ejsMate = require('ejs-mate');
const port = 3000;
const mongoose = require('mongoose');
const Station = require('../models/station');
const multer = require('multer');
const {storage, cloudinary} = require('../cloudinary');
const { url } = require('inspector');
const { stat } = require('fs');
const upload = multer({storage});
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const vision = require ('@google-cloud/vision');
const { resourceLimits } = require('worker_threads');

router.use(express.urlencoded({extended:true}));
router.use(methodOverride('_method'));

let cloudFile = '';

async function main() {
    await mongoose.connect('mongodb://localhost:27017/gas_map')
    console.log('Connection to database successful!')
} main().catch(err => console.log(`Connection error!-${err}`));

const CONFIG = {
  credentials: {
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.CLIENT_EMAIL
  }
};


router.get('/', (req, res) => {
    res.render('home');
})

router.get('/stations', async (req, res) => {
    const allStations = await Station.find({}).catch(err => console.log(err));
    res.render('stations', {allStations});
})

router.get('/stations/new', async (req, res) => {
    res.render('new');
})

router.get('/stations/new/detect', async(req, res) => {
    res.render('detect');
})

router.get('/stations/confirm/:id', async (req, res) => {
    const {id} = req.params;
    const station = await Station.findById(id);
    res.render('confirm', {station})
})

router.post('/stations/confirm', upload.single('image'), async(req, res) => {
    req.body.images = [{url: req.file.path, filename: req.file.filename}]; 
    cloudFile = req.file.filename;
    const url = req.file.path;
    
    const client = new vision.ImageAnnotatorClient(CONFIG);

    const detectText = async (file_path) => {
        let[result] = await client.textDetection(url).catch(err => res.send(err));
  
        let[logoResult] = await client.logoDetection(url).catch(err => res.send(err));
        if(result.fullTextAnnotation && logoResult.logoAnnotations){
            const text = result.fullTextAnnotation.text;
            const logo = logoResult.logoAnnotations[0].description;
        
            const nums = /\d+/g;
            const whole = text.match(nums); 
            const decimal = whole[1];
            req.body.price = (`${whole[0]}.${decimal}`); 
            req.body.title = logo;

            const station = new Station (req.body);
            station.geometry = geoData.body.features[0].geometry;
            await station.save().catch(err => console.log(err));
    
            res.redirect(`/stations/confirm/${station._id}`);
        } else res.send('This feature is not working at this time');
      }

      const geoData = await geocoder.forwardGeocode({
          query: req.body.location,
          limit: 1
      }).send()
    
      detectText();
})

router.post('/stations', upload.single('image'), async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    req.body.images = [{url: req.file.path, filename: req.file.filename}]; 
    cloudFile = req.file.filename;
    const station = new Station (req.body);
    station.geometry = geoData.body.features[0].geometry;
    await station.save().catch(err => res.send(err.message));
    res.redirect(`/stations`);
})

router.get('/stations/:id', async (req, res) => {
    const {id} = req.params; 
    const foundStation = await Station.findById(id).catch(err => res.send('No Station found with that ID'));
    res.render('show', {foundStation});
})

router.get('/stations/:id/edit', async (req, res) => {
    const {id} = req.params; 
    const foundStation = await Station.findById(id).catch(err => res.send('No Station found with that ID'));
    res.render('edit', {foundStation});
})

router.delete('/stations/:id', async (req, res) => {
    const{id} = req.params;
    if(cloudFile !== ''){
        await cloudinary.uploader.destroy(cloudFile);
    }
    await Station.findByIdAndDelete(id).catch(err => res.send(err.message));
    res.redirect('/stations');
})

router.put('/stations/:id', async (req, res) => {
    const {id} = req.params; 
    
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    
    const newStation = req.body; 
    newStation.geometry = geoData.body.features[0].geometry;
    await Station.findByIdAndUpdate(id, newStation).catch(err => res.send(err.message));
    res.redirect(`/stations/${id}`)
})

module.exports = router;
