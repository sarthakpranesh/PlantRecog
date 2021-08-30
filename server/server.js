const tf = require("@tensorflow/tfjs-node");
const cors = require("cors");
const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");

app = express();

// global holder variables for ML model
const models = {};
let latestVer = "";

// using some middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// root route for server availability check
app.get("/", (res, req) => {
  return res.res.setHeader("Content-type", "application/json").send(
    JSON.stringify({
      status: 1,
      message: "Server Up and Fine",
    })
  );
});

// get all model recognized classes
app.get("/all", (res, req) => {
  return res.res.setHeader("Content-type", "application/json").send(
    JSON.stringify({
      status: 2,
      message: "Success",
      payload: {
        recognized: Object.keys(models[latestVer].classes),
      },
    })
  );
});

// predict the class of an image
app.post("/predict", async (res, req) => {
  try {
    if (req.req.files.image === undefined) {
      return res.res
        .setHeader("Content-type", "application/json")
        .status(400)
        .send(
          JSON.stringify({
            status: 9,
            message: "Bad Request!",
          })
        );
    }

    const image = req.req.files.image;
    const version = req.req.body.version ? req.req.body.version : latestVer;
    const { model, classes } = models[version];

    const decodedImage = tf.node.decodeImage(image.data);
    const resizeImg = tf.image
      .resizeNearestNeighbor(decodedImage, (size = [224, 224]))
      .toFloat();
    const offset = tf.scalar(127.5);
    const inputImage = resizeImg.sub(offset).div(offset).expandDims();
    const pre = await model.predict(inputImage);
    const preArr = pre.arraySync();
    const respPre = {};
    for (const k of Object.keys(classes)) {
      respPre[k] = preArr[0][classes[k]];
    }
    const sortedResp = Object.keys(respPre)
      .sort((k1, k2) => (respPre[k1] > respPre[k2] ? -1 : 1))
      .slice(0, 5)
      .map((v) => ({
        name: v,
        score: respPre[v],
      }));
    res.res
      .setHeader("Content-type", "application/json")
      .status(200)
      .end(
        JSON.stringify({
          status: 2,
          messages: "Success",
          payload: {
            predictions: sortedResp,
          },
        })
      );
  } catch (err) {
    console.log(err.message);
    res.res
      .setHeader("Content-type", "application/json")
      .status(500)
      .end(
        JSON.stringify({
          status: 3,
          messages: "Failed",
          payload: {
            prediction: null,
            score: null,
          },
        })
      );
  }
});

app.listen(process.env.PORT || 8080, async () => {
  console.log("Server started!");
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
