import * as express from 'express';
let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
let a=6;
let b=1;
let c=2;

module.exports = router;
