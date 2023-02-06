require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const myRes = require("./helper/response");
const express = require("express");
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(express.static(__dirname + "/views"));
app.set("view engine", "ejs");

const { mongoConnect } = require("./helper/dbconnect");
mongoConnect();
const { getAvailableProviders,
    passportfun,
    providers,
} = require("./passport");
const passport = passportfun();
const authUser = require("./user_profile");

const port = process.env.PORT || 3000;

let otherCache = {};
app.use(authUser.verifyJWT);

app.get("/auth/:provider", (req, res, next) => {
    const provider = req.params.provider;
    passport.authenticate(provider, providers[provider].options)(req, res, next);
});

app.get("/auth/:provider/callback", (req, res, next) => {
    const provider = req.params.provider;
    passport.authenticate(
        provider,
        { failureRedirect: "/login" },
        async (err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect("/login");
            }
            //set the provider to user object
            user.provider = provider;
            //set this to local cache
            otherCache[provider] = user;
            let mCookies = req.cookies;
            if (mCookies === undefined) mCookies = {};
            //update user
            let dbResult, updatedUser;
            if (!req.user) {
              dbResult = await authUser.login(user, true);
              if (dbResult.sCode > 200)
                return myRes.sendResponse({ mRes: dbResult }, res);
            } else {
              updatedUser = authUser.oAuthMulti(req.cookies.user, user);
              dbResult = await authUser.update(updatedUser);
              if (dbResult.sCode > 200)
                return myRes.sendResponse({ mRes: dbResult }, res);
            }
            updatedUser = dbResult.result[0];
            const expiresInDays = process.env.COOKIE_TIME || 1;
            const cookies_options = {
              expires: new Date(
                Date.now() + expiresInDays * 24 * 60 * 60 * 1000
                // Date.now() + 24 * 60 * 60 * 1000 * 24 //24 days i guess
              ),
              httpOnly: true,
            };
            mCookies[provider] = user;
            mCookies["user"] = updatedUser;
            mCookies["token"] = updatedUser.token;
            otherCache["token"] = updatedUser.token;
            // console.log(mCookies);
      
            res.cookie(provider, mCookies[provider], cookies_options);
            res.cookie("token", mCookies["token"], cookies_options);
            res.cookie("user", mCookies["user"], cookies_options);
            return res.redirect(`/`);
        }
    )(req, res, next);
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/providers", (req, res) => {
    let availableProviders = getAvailableProviders();
    console.log(availableProviders);
    res.json({ providers: availableProviders });
});

app.get("/user", (req, res) => {
    if (Object.keys(otherCache).length === 0 && req.cookies !== undefined) {
        for (const key in req.cookies)
            if (
                [
                    "google",
                    "github",
                    "linkedin",
                    "microsoft",
                    "facebook",
                    "slack",
                    "twitter",
                ].includes(key)
            )
                otherCache[key] = req.cookies[key];
    }
    return res.send(otherCache || {});
});
app.get("/me", async (req, res) => {
    const result = await authUser.me(req);
    return myRes.sendResponse({ mRes: result }, res);
});

app.get("/", (req, res) => {
    if (req.user === undefined || req.user.length === 0)
        return res.redirect("/login");
    else return res.sendFile(__dirname + "/views/profile.html");
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
