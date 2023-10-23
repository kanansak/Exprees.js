const jwt = require("jsonwebtoken")
const passport = require('passport');
require('../config/passport');
const jwtAccessKey = "my_secret_key"
const jwtRefreshKey = "my_secret_key"
const jwtAccessExpiry = 300
const jwtRefreshExpiry = 21600

const mongo = require('../configure/mongo');
const Account = mongo.accounts;

exports.login = async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
			if (err || !user) {
				const error = new Error('An error occurred.');
				console.log(err)
				if (err === null) { res.status(401).send({status: 401,message: "invalid username or password"}) }
				return next(error);
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error);

				const body = { id: user.id, username: user.username };
				const token = jwt.sign({ user: body }, jwtAccessKey, {
					algorithm: "HS256",
					expiresIn: jwtAccessExpiry,
				});
				const refreshToken = jwt.sign({ user: body }, jwtRefreshKey, {
					algorithm: "HS256",
					expiresIn: jwtRefreshExpiry,
				});
				var response = {token: token, refreshToken: refreshToken ,user: user.username,id: user.id }
				return res.status(200).send(response);
			});
		} catch (error) {
			console.log(error);
          return next(error);
        }
    })(req, res, next);
}

exports.renew = async (req, res, next) => {
	passport.authenticate('jwt', { session: false }, async (err, user) => {
		try {
			if (err || !user) {
				console.log(err);
				console.log(user);
				const error = new Error('An error occurred.');
				return next(error);
			}
			const body = { id: user.id, username: user.username };
			const token = jwt.sign({ user: body }, jwtAccessKey, {
				algorithm: "HS256",
				expiresIn: jwtAccessExpiry,
			});
			return res.status(200).send({token : token});
		} catch (error) {
			return next(error);
		}
    })(req, res, next);
}

exports.signup = async (req, res) => {
	const account = new Account({
		username: req.body.username,
		password: req.body.password
	})

	account.save(account).then(() => {
		res.status(200).send();
	}).catch(err => {
		res.status(500).send({
			message:
                err.message || "Some error occurred while interacting with the database."
		})
	})
}