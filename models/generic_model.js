const mongoose = require("mongoose");

const genericSchema = new mongoose.Schema({}, { strict: false });

const model = function (str) {
  if (mongoose.models[str] !== undefined) return mongoose.models[str];
  return mongoose.model(str, genericSchema, str);
};

module.exports = model;
