const tf = require("@tensorflow/tfjs-node");
const app = require("express")();
const fetch = require("node-fetch");

// predict the class of an image
app.post("/predict", async (res, req) => {
  try {
    let image;
    if (req.req.files.image === undefined) {
      return res.res
        .status(400)
        .setHeader("Content-type", "application/json")
        .send(
          JSON.stringify({
            message: "Bad Request!",
          })
        );
    } else {
      image = req.req.files.image;
    }

    const { model, classes } = req.req.mlModel;

    // preprocessing image and do prediction
    const decodedImage = tf.node.decodeImage(image.data);
    const resizeImg = tf.image
      .resizeNearestNeighbor(decodedImage, [224, 224]) // original is [224, 224]
      .toFloat();
    const offset = tf.scalar(127.5); // default value is 127.5
    const inputImage = resizeImg.sub(offset).div(offset).expandDims();
    const pre = await model.predict(inputImage);

    // make sense of predictions
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

    // If gyan is configured then fetch gyan data as well
    let gyanData = null;
    if (process.env.GYAN) {
      try {
        const mainPredict = sortedResp[0].name;
        const response = await fetch(
          `${process.env.GYAN}/${mainPredict}`
        );
        gyanData = await response.json();
      } catch (err) {
        console.log(err);
      }
    }

    // send the top 5 predictions back to client
    return res.res
      .status(200)
      .setHeader("Content-type", "application/json")
      .send(
        JSON.stringify({
          message: "Success",
          payload: {
            predictions: sortedResp,
            gyanData,
          },
        })
      );
  } catch (err) {
    console.log(err.message);
    return res.res
      .status(500)
      .setHeader("Content-type", "application/json")
      .send(
        JSON.stringify({
          messages: "Failed",
          payload: {
            prediction: null,
            score: null,
          },
        })
      );
  }
});

module.exports = app;
