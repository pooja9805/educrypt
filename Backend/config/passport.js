const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
console.log("Loaded GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK, // ✅ must match .env}, async (accessToken, refreshToken, profile, done) => {

}, async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) return done(null, existingUser);

    const newUser = await User.create({
      username: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      name: profile.displayName,
      password: null, 
      role: "student" // or let them choose later
    });

    done(null, newUser);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
