require("@tensorflow/tfjs-backend-webgl");
require('dotenv').config()

const tf = require("@tensorflow/tfjs-node");
const cors = require("cors");
const express = require("express");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const fs = require("fs");

const app = express();

// global holder variables for ML model
const models = {};
let latestVer = "";

// using some middleware
app.use(
  rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 10,
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use((req, res, next) => {
  // models not loaded then return request with message
  if (latestVer === "") {
    return res.setHeader("Content-type", "application/json").send(
      JSON.stringify({
        message: "Models not loaded yet, try again later!",
        payload: {},
      })
    );
  }
  // if models are loaded then attach the model to request
  let model;
  if (req.body?.version && models[req.body?.version]) {
    model = models[req.body.version];
  } else {
    model = models[latestVer];
  }
  // continue with request
  req.mlModel = model;
  next();
});

// routes v1
app.use("/v1", require("./routes/v1/index"));

// default version
app.use("/", require("./routes/v1/index"));

// start server and load models
app.listen(process.env.PORT || 8080, async () => {
  console.log("Loading ML model");
  try {
    const modelVers = fs.readdirSync("./tfjs-models/");
    console.log("ML models available:", modelVers);
    latestVer = modelVers[modelVers.length - 1];
    modelVers.forEach(async (ver) => {
      const model = await tf.loadLayersModel(
        `file://tfjs-models/${ver}/model.json`,
        {
          strict: false,
        }
      );
      const classes = JSON.parse(
        fs.readFileSync(`./tfjs-models/${ver}/classes.json`)
      );
      models[ver] = {
        model,
        classes,
      };
    });
    console.log("Models loaded!");
  } catch (err) {
    console.log(err.message);
  }
});
