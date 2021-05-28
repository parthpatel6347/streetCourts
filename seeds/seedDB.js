// jshint esversion:9

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const cities = require("./cities");
const Court = require("../models/court");
const faker = require("faker");

const dbUrl =
  process.env.DATABASE_URL || "mongodb://localhost:27017/streetCourtsDB";

mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Mongo server");
  })
  .catch((err) => {
    console.log("Mongo Connection error");
    console.log(err);
  });

const randomSample = (array) => array[Math.floor(Math.random() * array.length)];

const getImages = async () => {
  const imageList = await cloudinary.search
    .expression("folder:streetCourts")
    .sort_by("public_id", "desc")
    .max_results(100)
    .execute();
  const newList = imageList.resources.map((img) => ({
    url: img.url,
    filename: img.filename,
  }));
  return newList;
};

const seedDB = async () => {
  await Court.deleteMany({});
  const imagesArray = await getImages();
  for (i = 0; i <= 450; i++) {
    const title = faker.address.streetAddress();

    const rand = Math.floor(Math.random() * 1000);

    const randPrice = Math.floor(Math.random() * 10) + 5;

    const randDescription = Math.floor(Math.random() * 2) + 1;
    const description = faker.lorem.paragraph(randDescription);

    const seedCourts = new Court({
      location: `${cities[rand].city}, ${cities[rand].state}`,
      title: title,
      geometry: {
        type: "Point",
        coordinates: [cities[rand].longitude, cities[rand].latitude],
      },
      images: [randomSample(imagesArray), randomSample(imagesArray)],
      description: description,
      price: randPrice,
      author: "60b099fdacca1c001534ab99",
    });
    await seedCourts.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
  console.log("Mongo connection closed");
});
