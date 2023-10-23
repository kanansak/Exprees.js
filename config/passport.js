const passport = require('passport')
const localStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt"),
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt

const jwtKey = "my_secret_key"

const db = require('../config/db');
const Account = db.accounts;

passport.use('login', new localStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      try {
        const user = await Account.findOne({ username });
        
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        const validate = await user.isValidPassword(password,user.password);

        if (!validate) {
          return done(null, false, { message: 'Wrong Password' });
        }

        return done(null, user, { message: 'Logged in Successfully' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(new JWTStrategy({
      secretOrKey: jwtKey,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);