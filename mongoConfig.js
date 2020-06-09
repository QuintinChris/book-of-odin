const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Set up mongoDB connection
const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));
