var express = require('express');
var router = express.Router();
var products_route = require('./products');
var user_route = require('./users');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/', products_route);
router.get('/',user_route);

module.exports = router;
