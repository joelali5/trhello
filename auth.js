const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "822854830003-5aahbs4k3ca5mj0b00t2gaf3buiugp80.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

passport.use(
  new MicrosoftStrategy(
    {
      clientID: "d497e11f-603b-4f0a-b785-f437480a0512",
      clientSecret: "MBX8Q~ReROA78Q-j2HqdRZxx6Vq~YizKCBpVYarv",
      callbackURL: "/microsoft/callback",
      scope: ["user.read"],
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);
