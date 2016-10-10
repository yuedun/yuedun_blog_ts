import * as express from 'express';
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '基于Express的typescript开发的项目,hhh' });
});

module.exports = router;
