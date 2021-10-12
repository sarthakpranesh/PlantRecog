const v1 = require("express").Router();

v1.use(require("../global/getIndex"));
v1.use(require("./postPrediction"));
v1.use(require("./getDetails"));

module.exports = v1;
