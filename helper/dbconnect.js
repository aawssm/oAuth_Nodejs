const mongoose = require("mongoose");

exports.mongoConnect = function () {
  console.log(process.env.MONGO_URL.split("@")[2]);
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((result) => {
      console.log("connected to db");
    })
    .catch((err) => {
      console.log(err);
    });
};