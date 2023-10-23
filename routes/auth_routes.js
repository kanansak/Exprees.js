module.exports = app => {
    var router = require("express").Router();
    var auth = require("../controller/auth_api");

    router.post("/login", auth.login);

    router.get("/renew", auth.renew);
    
    router.post("/signup", auth.signup);

    app.use('/auth', router);
};