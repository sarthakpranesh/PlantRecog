const v1 = require("express").Router();

v1.use(require("../global/getIndex"));
v1.use(require("./postPrediction"));

module.exports = v1;
