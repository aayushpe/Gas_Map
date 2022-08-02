const mongoose = require('mongoose');
const Station = require('../models/station');
const {places, descriptors} = require('./seedHelpers');
const cities = require('./cities');
// https://source.unsplash.com/collection/3125808
// 'https://media.istockphoto.com/vectors/gas-station-solid-icon-fuel-and-refill-sign-vector-id810426832?k=20&m=810426832&s=612x612&w=0&h=Og19SBdhUUM2MPXqnmJlDqxed-AfmYCSXOOHjBJJSgM=

async function main() {
    await mongoose.connect('mongodb://localhost:27017/gas_map')
    console.log('Connection to database successful!')
} main().catch(err => console.log(`Connection error!-${err}`));

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB =  async () => {
    await Station.deleteMany({});
    for(let i = 0; i <= 10; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random() * 6) + 1; 
        const station = new Station({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}`,
            images:[{
                url: 'https://media.istockphoto.com/vectors/gas-station-solid-icon-fuel-and-refill-sign-vector-id810426832?k=20&m=810426832&s=612x612&w=0&h=Og19SBdhUUM2MPXqnmJlDqxed-AfmYCSXOOHjBJJSgM=',
                filname: 'seed'
            }],
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            description: 'N/A',
            price: price
        });
        await station.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})