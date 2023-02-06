const mongoose = require("mongoose");
const genricModel = require("./generic_model");
const ModelSelector = (collection, cLog = "") => {
  if (mongoose.models[collection] !== undefined)
    return mongoose.models[collection];
  switch (collection) {
    case "todos":
      return genricModel(collection);
    case "address":
      return genricModel("address");

    default:
      return genricModel(collection);
  }
};

module.exports = ModelSelector;
