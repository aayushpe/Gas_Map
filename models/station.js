const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const StationSchema = new Schema ({
    title: String,
    
    images: [{
        url: String,
        filename: String
    }],
    price: String,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
});

module.exports = mongoose.model('Station', StationSchema);