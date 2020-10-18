const mongoose = require('mongoose');
const geoCoder = require('../utils/geocoder');

const PlaceSchema = new mongoose.Schema({
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        city: String,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    fullName: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    gender: {
        type: String,
    },
    age: {
        type: Number
    },
    bloodType: {
        type: String
    },
    recoveryDate: {
        type: Date
    },
    diseases: {
        type: String
    },
    swab: {
        type: String
    }
});

// Before saving, convert address to geoCode
PlaceSchema.pre('save', async function(next) {
    const loc = await geoCoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        city: loc[0].city,
        formattedAddress: loc[0].formattedAddress
    };

    // Do not save address
    this.address = undefined;
    next();
});

module.exports = mongoose.model('Place', PlaceSchema);