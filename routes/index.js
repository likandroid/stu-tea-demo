var express = require('express');
var router = express.Router();
var checkLogin = require('../modules/checkLogin.js')
/* GET home page. */
// 两个函数，先执行checkLogin，只不过它是匿名函数
router.get('/',checkLogin, function(req, res, next) {
  res.render('index', { title: '学生管理系统' });
});

module.exports = router;
