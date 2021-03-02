const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const cors = require("cors");

// routes
const userRoute = require("./api/routes/users");

const mongoUrl = `mongodb://${
    process.env.MONGO_USER
}:${
    process.env.MONGO_PASS
}@cluster0-shard-00-00.me7gh.mongodb.net:27017,cluster0-shard-00-01.me7gh.mongodb.net:27017,cluster0-shard-00-02.me7gh.mongodb.net:27017/${
    process.env.MONGO_DB
}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`;

const rootRoute = "/api/v1";

try {
    mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Database connected...");
} catch (error) {
    console.error(error);
}

app.use(cors());
app.use(`${rootRoute}/users`, userRoute);

app.use(express.static(path.join(__dirname, "build"))); // defining the directory name for the path

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build/index.html")); // defining the path for running the index.html file on the express app
});

module.exports = app;
