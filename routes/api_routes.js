module.exports = app => {
    var router = require("express").Router();
    var api = require("../controller/api");
    var passport = require("passport")
    
    router.get("/", api.index);

    app.use('/api', passport.authenticate('jwt', { session: false }), router)
};