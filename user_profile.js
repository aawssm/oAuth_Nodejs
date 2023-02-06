const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const modelSelector = require("./models/model_selector");
const myRes = require("./helper/response");
const authProUser = require("./helper/o_auth_user_ptofile");

class UserProfile {
  //login
  login = async (user, isFromCallBack = false) => {
    console.log("login start");
    try {
      let model = modelSelector("user");
      const find = { "providers.email": user.email };
      let doc = await model.findOne(find);
      if (!doc)
        if (!isFromCallBack) return myRes.retErrorMap("No user found.", 401);
        else return this.register(user, isFromCallBack);
      //if request from callback not from user
      if (!isFromCallBack) {
        // check if the password is valid
        let passwordIsValid =
          doc.password === doc.password ||
          bcrypt.compareSync(doc.password, doc.password);
        if (!passwordIsValid) myRes.retErrorMap("No user found.", 401);
      }
      console.log("login user foundn loggin in");
      let mData = { ...doc._doc };
      if (mData.password) delete mData.password;
      return this.genrateJWT(mData);
    } catch (error) {
      console.log("UserProfile login ", error);
      return myRes.retErrorMap("Error on the server.", 500);
    }
  };
  //register
  register = async (user, isFromCallBack = false) => {
    console.log("register start");
    let milliseconds = new Date().getTime();
    let updateUser = { ...user };
    console.log(milliseconds);
    updateUser["dateJoin"] = milliseconds;
    if (!isFromCallBack) {
      if (!updateUser.password) return myRes.retErrorMap("Password required");
      updateUser.password = bcrypt.hashSync(updateUser.password, 8);
    }
    try {
      let model = modelSelector("user");
      if (updateUser.token) delete updateUser.token;
      const doc = await model.create(updateUser);
      var mData = { ...doc._doc };
      if (mData.password) delete mData.password;
      return this.genrateJWT(mData);
    } catch (error) {
      console.log("UserProfile register ", error);
      return myRes.retErrorMap("Error on the server.", 500);
    }
  };

  //update user prfile
  update = async (user) => {
    console.log("update start");
    if (user.password) user.password = bcrypt.hashSync(user.password, 8);
    if (user.token) delete user.token;
    try {
      let model = modelSelector("user");
      let doc = await model.updateOne({ _id: user._id }, { $set: user });
      // var mData = { ...doc };
      if (user.password) delete mData.password;
      return this.genrateJWT(user);
    } catch (error) {
      console.log("UserProfile update ", error);
      return myRes.retErrorMap("Error on the server.", 500);
    }
  };
  //from token UserProfile
  me = async (req) => {
    if (!req.user) return myRes.retErrorMap("Jwt Missing", 500);
    try {
      let model = modelSelector("user");
      const find = { _id: req.user._id };
      let doc = await model.findOne(find);
      if (!doc) return myRes.retErrorMap("No user found.", 401);
      //if request from callback not from user
      let mData = { ...doc._doc };
      if (mData.password) delete mData.password;
      return this.genrateJWT(mData);
    } catch (error) {
      console.log("UserProfile login ", error);
      return myRes.retErrorMap("Error on the server.", 500);
    }
  };
  //genrate JWT
  genrateJWT = (user) => {
    const expiresInDays = process.env.COOKIE_TIME || 1;
    let token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWTSEC,
      {
        expiresIn: 86400 * expiresInDays, // seconds in a day X number of days
      }
    );
    let userss = { ...user, token: token };

    const options = {
      expires: new Date(
        Date.now() + expiresInDays * 24 * 60 * 60 * 1000
        // Date.now() + 24 * 60 * 60 * 1000 * 24 //24 days i guess
      ),
      httpOnly: true,
    };
    return myRes.retSucMap(true, { result: [userss] });
  };
  //verfiy JWT
  verifyJWT = (req, res, next) => {
    let token = req.cookies.token || req.headers["x-access-token"];
    console.log(req.cookies);
    console.log("verifyJWT", token);
    if (!token) {
      console.log("tokenDecode no token found");
      return next();
    }
    jwt.verify(token, process.env.JWTSEC, function (err, decoded) {
      if (err) {
        console.log("tokenDecode ", err);
        return next();
      }
      //console.log("tokenDecode decoded", decoded);
      let user = { ...decoded };
      req.user = user;
      // console.log(req.user);
      next();
    });
  };
  //handel oAuth Multiprovider
  oAuthMulti = (oUser, nUser) => {
    if (!oUser) return nUser;
    return authProUser.updateUser(oUser, nUser);
  };

  //refresh app token
  //forgot password
  //genrate MagicLink
  //verify and delete MagicLink
}

module.exports = new UserProfile();
