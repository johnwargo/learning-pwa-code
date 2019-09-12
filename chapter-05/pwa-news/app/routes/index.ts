var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req: any, res: any, next: any) {
  res.set('Cache-Control', 'max-age=10');
  res.render('index');
});

module.exports = router;
