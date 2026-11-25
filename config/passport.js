import passport from 'passport';
import { Strategy as GitHubStrategy } from'passport-github2';
import User from '../models/User.js';
 
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL, // e.g., 'http://localhost:3001/api/users/auth/github/callback'
    },
    // This is the "verify" callback
    async (accessToken, refreshToken, profile, done) => {
      try {
        // The "profile" object contains the user's GitHub information
        const existingUser = await User.findOne({ githubId: profile.id });
 
        if (existingUser) {
          // If user already exists, pass them to the next middleware
          return done(null, existingUser);
        }
        const email = profile.emails[0].value;
        const emailUser = await User.findOne({email: email})
        if(emailUser) {
            emailUser.githubId = profile.id;
            await emailUser.save();
            return done(null, emailUser);
        }
        // If it's a new user, create a record in our database
        const newUser = new User({
          githubId: profile.id,
          username: profile.username,
          email: email, // Some providers return an array of emails
        });
 
        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err);
      }
    }
  )
);
export default passport;