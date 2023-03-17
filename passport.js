const passport = require("passport");
const axios = require("axios");
const authProUser = require("./helper/o_auth_user_ptofile");
const FacebookStrategy = require("passport-facebook").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const SlackStrategy = require("passport-slack-oauth2").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const LocalStrategy = require("passport-local").Strategy;

const host = process.env.HOST || "localhost";
const port = process.env.PORT;
const scheme = process.env.SCHEME || "https";
const callBackUrl = (strat) => {
    const value = `${scheme}://${host}${port === undefined || port.length === 0 ? "" : `:${port}`
        }/auth/${strat}/callback`;
    //  console.log(value);
    return value;
};

const providers = {
    local: {
        clientID: "yes",
        clientSecret: "yes",
        options: {
            session: false,
            // successRedirect: callBackUrl("local"),
            failureRedirect: "/login",
        },
    },
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        options: {
            scope: ["profile", "email"],
            accessType: "offline",
            failureRedirect: "/login",
        },
    },
    github: {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        options: { scope: ["user:email"], failureRedirect: "/login" },
    },
    linkedin: {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        options: {
            failureRedirect: "/login",
        },
    },
    microsoft: {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        options: {
            failureRedirect: "/login",
        },
    },
    facebook: {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        options: {
            failureRedirect: "/login",
        },
    },
    slack: {
        clientID: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        options: {
            failureRedirect: "/login",
        },
    },
    twitter: {
        clientID: process.env.TWITTER_CONSUMER_KEY,
        clientSecret: process.env.TWITTER_CONSUMER_SECRET,
        options: {
            failureRedirect: "/login",
        },
    },
};
const getAvailableProviders = () => {
    let availableProviders = [];
    for (const provider in providers) {
        if (providers[provider].clientID && providers[provider].clientSecret) {
            availableProviders.push(provider);
        }
    }
    // console.log(availableProviders);
    return availableProviders;
};


const passportfun = () => {
    passport.use(
        new LocalStrategy(function (username, password, done) {
            return done(null, { email: username, password });
        })
    );

    if (!providers.google.clientID) console.log(providers.google.clientID);
    else
        passport.use(
            new GoogleStrategy(
                {
                    clientID: providers.google.clientID,
                    clientSecret: providers.google.clientSecret,
                    callbackURL: callBackUrl("google"),
                },
                (accessToken, refreshToken, profile, cb) => {
                    // save user to your database
                    console.log(accessToken, refreshToken, profile);
                    const user = authProUser.providerToProfile(
                        {
                            accessToken,
                            refreshToken,
                            profile,
                            provider: "google",
                        },
                        "google"
                    );
                    return cb(null, user);
                }
            )
        );
    if (!providers.github.clientID) console.log(providers.github.clientID);
    else
        passport.use(
            new GitHubStrategy(
                {
                    clientID: providers.github.clientID,
                    clientSecret: providers.github.clientSecret,
                    callbackURL: callBackUrl("github"),
                },
                async (accessToken, refreshToken, profile, cb) => {
                    if (
                        providers.github.options &&
                        providers.github.options.scope &&
                        providers.github.options.scope.includes("user:email")
                    ) {
                        try {
                            const response = await axios.get(
                                "https://api.github.com/user/emails",
                                {
                                    headers: {
                                        Authorization: `token ${accessToken}`,
                                    },
                                }
                            );

                            for (const e of response.data) {
                                if (e.verified) {
                                    profile.apiEmail = e.email;
                                    profile.apiEmailVerify = e.verified;
                                    break;
                                }
                            }
                            // ...
                        } catch (error) {
                            console.error(error);
                        }
                    } else {
                        console.error("Scope does not include 'user:email'");
                    }
                    // save user to your database
                    console.log(accessToken, refreshToken, profile);
                    const user = authProUser.providerToProfile(
                        {
                            accessToken,
                            refreshToken,
                            profile,
                            provider: "github",
                        },
                        "github"
                    );
                    return cb(null, user);
                }
            )
        );
    if (!providers.linkedin.clientID) console.log(providers.linkedin.clientID);
    else
        passport.use(
            new LinkedInStrategy(
                {
                    clientID: providers.linkedin.clientID,
                    clientSecret: providers.linkedin.clientSecret,
                    callbackURL: callBackUrl("linkedin"),
                    scope: ["r_emailaddress", "r_liteprofile"],
                },
                (accessToken, refreshToken, profile, cb) => {
                    // save user to your database
                    console.log(accessToken, refreshToken, profile);
                    const user = authProUser.providerToProfile(
                        {
                            accessToken,
                            refreshToken,
                            profile,
                            provider: "linkedin",
                        },
                        "linkedin"
                    );
                    return cb(null, user);
                }
            )
        );
    if (!providers.twitter.clientID) console.log(providers.twitter.clientID);
    else
        passport.use(
            new TwitterStrategy(
                {
                    consumerKey: providers.twitter.clientID,
                    consumerSecret: providers.twitter.clientSecret,
                    callbackURL: callBackUrl("twitter"),
                },
                (accessToken, refreshToken, profile, cb) => {
                    // save user to your database
                    console.log(accessToken, refreshToken, profile);
                    return cb(null, { accessToken, refreshToken, profile });
                }
            )
        );
    if (!providers.slack.clientID) console.log(providers.slack.clientID);
    else
        passport.use(
            new SlackStrategy(
                {
                    clientID: providers.slack.clientID,
                    clientSecret: providers.slack.clientSecret,
                    callbackURL: callBackUrl("slack"),
                },
                (accessToken, refreshToken, profile, cb) => {
                    // save user to your database
                    console.log(accessToken, refreshToken, profile);
                    return cb(null, { accessToken, refreshToken, profile });
                }
            )
        );
    if (!providers.microsoft.clientID) console.log(providers.microsoft.clientID);
    else
        passport.use(
            new MicrosoftStrategy(
                {
                    clientID: providers.microsoft.clientID,
                    clientSecret: providers.microsoft.clientSecret,
                    callbackURL: callBackUrl("microsoft"),
                },
                function (accessToken, refreshToken, profile, cb) {
                    // code to find or create user in database
                    return cb(null, { accessToken, refreshToken, profile });
                }
            )
        );
    if (!providers.facebook.clientID) console.log(providers.facebook.clientID);
    else
        passport.use(
            new FacebookStrategy(
                {
                    clientID: providers.facebook.clientID,
                    clientSecret: providers.facebook.clientSecret,
                    callbackURL: callBackUrl("facebook"),
                    profileFields: ["id", "displayName", "photos", "email"],
                },
                function (accessToken, refreshToken, profile, cb) {
                    // code to find or create user in database
                    return cb(null, { accessToken, refreshToken, profile });
                }
            )
        );
    return passport;
};

module.exports = { getAvailableProviders, passportfun, providers };
