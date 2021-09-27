import * as tf from "@tensorflow/tfjs";
import { decodeJpeg } from "@tensorflow/tfjs-react-native";
import { toByteArray } from "base64-js";
import RNFS from "react-native-fs";

import classes from "../tfjs-models/classes.json";

export const preprocessImage = (photoUri) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await RNFS.readFile(photoUri, "base64");
      const imageData = toByteArray(response);
      const decodedImage = decodeJpeg(imageData);
      const resizeImg = tf.image
        .resizeNearestNeighbor(decodedImage, [224, 224])
        .toFloat();
      const offset = tf.scalar(127.5);
      const inputImage = resizeImg.sub(offset).div(offset).expandDims();
      resolve(inputImage);
    } catch (err) {
      console.log("Serivce->tfjs->preprocessImage:", err.message);
      reject(err);
    }
  });
};

export const getPredictedClass = (pre) => {
  return new Promise(async (resolve, reject) => {
    try {
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
      resolve(sortedResp);
    } catch (err) {
      console.log("Serivce->tfjs->getPredictedClass:", err.message);
      reject(err);
    }
  });
};
