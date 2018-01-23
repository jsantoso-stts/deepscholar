const express = require("express");
const passport = require("passport");
const passportJwt = require("passport-jwt");
const GithubStrategy = require("passport-github").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const jwtOptions = {
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.DEEP_SCHOLAR_TOKEN_SECRET,
  issuer: process.env.DEEP_SCHOLAR_TOKEN_ISSUER,
  audience: process.env.DEEP_SCHOLAR_TOKEN_AUDIENCE
};
passport.use(new passportJwt.Strategy(jwtOptions, (payload, done) => {
  const user = payload.sub;
  if (user) {
    return done(null, user, payload);
  }

  return done();
}));

passport.use('google', new GoogleStrategy({
    clientID: process.env.OAUTH_GOOGLE_CLIENT_ID,
    clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.DEEP_SCHOLAR_URL}/auth/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    done(null, profile);
  }
));
passport.use('github', new GithubStrategy({
    clientID: process.env.OAUTH_GITHUB_CLIENT_ID,
    clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.DEEP_SCHOLAR_URL}/auth/github/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    done(null, profile);
  }
));
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const jwt = require("jsonwebtoken");
function generateAccessToken(type, username) {
  const expiresIn = "1 hour";
  const issuer = process.env.DEEP_SCHOLAR_TOKEN_ISSUER;
  const audience = process.env.DEEP_SCHOLAR_TOKEN_AUDIENCE;
  const secret = process.env.DEEP_SCHOLAR_TOKEN_SECRET;
  const subject = {type, username}.toString();

  const token = jwt.sign({}, secret, {
    expiresIn,
    issuer,
    audience,
    subject
  });

  return token;
}

function generateUserToken(req, res) {
  console.log(req);
  const accessToken = generateAccessToken("github", req.user.id);
  res.render('authenticated.html', {
    token: accessToken,
    user: JSON.stringify(req.user)
  });
}

module.exports = (app) => {
  app.use(passport.initialize());

  const router = express.Router();
  router.get('/google', passport.authenticate('google', {scope: ['openid', 'profile', 'email']}));
  router.get('/google/callback',
    passport.authenticate('google', {session: false}),
    generateUserToken);
  router.get('/github', passport.authenticate('github'));
  router.get('/github/callback',
    passport.authenticate('github', {session: false}),
    generateUserToken);

  return router;
};
