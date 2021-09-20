const v1 = require("express").Router();

v1.use(require("../global/getIndex"));
v1.use(require("./getAllClass"));
v1.use(require("./postPrediction"));
v1.use(require("./getSimilarImages"));

module.exports = v1;
