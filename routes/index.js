var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'TrunkMonWS', creator: 'Nikita Sharma', email: 'nikita.sharma@idt.net' });
});

module.exports = router;
