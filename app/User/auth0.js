const express = require('express');
const db = require('../db');
const router = express.Router();
const { auth } = require('express-oauth2-jwt-bearer');

const jwtCheck = auth({
    audience: 'https://finalproject',
    issuerBaseURL: 'https://dev-wg2x3rls3me8udhz.jp.auth0.com/',
    tokenSigningAlg: 'RS256'
  });
  
  // enforce on all endpoints
  router.use(jwtCheck);
  
  router.get('/authorized', function (req, res) {
      res.send('Secured Resource');
  });
  






module.exports = router;