// jshint esversion:9


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});


const opts = { toJSON: { virtuals: true } };

const courtSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String,
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

courtSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/courts/${this._id}">${this.title}</a></strong>
    <p>${this.location}</p>`;
});

module.exports = new mongoose.model('Court', courtSchema);