// jshint esversion:9

const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./titleseeds');
const Court = require('../models/court');
const { authorize } = require('passport');

mongoose.connect('mongodb://localhost:27017/streetCourtsDB', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("Connected to Mongo server");
    })
    .catch(err => {
        console.log("Mongo Connection error");
        console.log(err);
    });


const randomSample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Court.deleteMany({});
    for (i = 0; i <= 450; i++) {
        const rand = Math.floor(Math.random() * 1000);
        const randPrice = Math.floor(Math.random() * 20) + 10;
        const seedCourts = new Court({
            location: `${cities[rand].city}, ${cities[rand].state}`,
            title: `${randomSample(descriptors)} ${randomSample(places)}`,
            geometry:{
                type : "Point",
                coordinates: [ 
                    cities[rand].longitude, 
                    cities[rand].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/parthpatel6347/image/upload/v1607086966/starGaze/wjw8yxastojhm1qquwo8.jpg',
                    filename: 'starGaze/wjw8yxastojhm1qquwo8'
                },
                {
                    url: 'https://res.cloudinary.com/parthpatel6347/image/upload/v1607086966/starGaze/wzvatyk4zqzg3logfqwq.jpg',
                    filename: 'starGaze/wzvatyk4zqzg3logfqwq'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum, magni cumque quaerat atque aspernatur inventore harum est reiciendis recusandae adipisci non blanditiis voluptatum quam, nam similique illum cum libero fuga.',
            price: randPrice,
            author: '5fc8df095056ed40f0487272'

        });
        await seedCourts.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
    console.log("Mongo connection closed");
});