var express = require('express');
var router = express.Router();

var pool = require('../modules/db.js')
var md5 = require('md5');

/* GET users listing. */
router.get('/login', function (req, res, next) {
  // res.send('respond with a resource'
  res.render('login', {
    title: "登录",
    // loginName: res.cookie('loginName') || ''
  });
});
// post请求，此时如果输入不正确会一直请求/login,请求结束后会再一次渲染到页面，直到正确进行页面跳转
router.post('/login', function (req, res, next) {
  // 通过请求对象的body加上名字，去获取客户端发送的数据，作用：验证和存储
  var loginName = req.body.loginName;
  var password = req.body.password;
  var type = req.body.type;
  var remember = req.body.remember || false;

  if (!loginName || !password) {
    res.json({
      code: 201,
      message: "账号或密码不能为空"
    })
    return;

  }

  pool.query("SELECT * FROM `users` WHERE loginName = ? AND password = ? AND type = ?", [loginName, md5(password), type], function (err, result) {
    if (err) {
      res.json({ code: 202, message: "数据库操作失败！" });
      return;
    }
    if (result.length == 0) {
      res.json({ code: 203, message: "账号或密码或类型有误!" });
      return;
    }
    // 出现几率低，无论几率大小，都要写到
    if (result.length > 1) {
      res.json({ code: 204, message: "账号存在异常" });
      return;
    }

    var user = result[0];
    if (user.status != 0) {
      res.json({ code: 205, message: "账号被禁用或删除" });
      return;
    }
    delete user.password;
    /* {
     id:user.id,
     loginName:user.loginName,
     type: user.type,
     status: user.status
   }; */
  //  这个user是随便起的名字，相当于变量
    req.session.user = user;
    console.log(user);
// 再次保存一下，双保险
    req.session.save();
    // 客户端也存储，第一个参数随便起的
    res.cookie("user", user);

    if(remember === "true"){
      res.cookie("loginName",user.loginName)
    } else {
      // 原来保存的清除
      // res.clearCookie("loginName");
      res.clearCookie();
    }
    res.json({ code: 200, message: "成功！" });

  });

  /* console.log(type);
  console.log(remember);
  res.json({code:200}); */
});

router.post('/logout', function (req, res, next) {
  // 清空session和cookie
  req.session.user = null;
  // 只能清除当前的
  res.clearCookie("user");
  // 向客户端响应数据，客户端再根据获取到数据再进行跳转，我们称“客户端跳转（渲染）”推荐，客户端渲染可以吧接口和视图分成两个独立的项目，有利于业务逻辑和视图分离。
  res.json({ code: 200, message: "注销成功" });
  // 以下两种方式都是“服务器端跳转（渲染）”
  // 方式一：直接跳转到login.ejs视图，缺点是代码和router.get('/login')接口重复，并且浏览器显示的是loginout接口
  // res.render('login',{title:"登录"});
  // 方式二：解决了方式一的两个缺点，推荐使用。这个路径上是login
  // res.redirect('/login');
})

module.exports = router;
