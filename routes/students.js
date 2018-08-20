var express = require('express');
var router = express.Router();

var pool = require('../modules/db.js')
var md5 = require('md5');
var checkLogin = require('../modules/checkLogin');

router.get('/add', function (req, res, next) {
    // res.json({code:200,message:"添加成功"})
    res.render('students/add', { title: "学生添加" })
})
router.post('/add',checkLogin, function (req, res, next) {

    var sno = req.body.sno;
    var name = req.body.name
    var sex = req.body.sex
    var birthday = req.body.birthday
    var card = req.body.card
    var majorId = 1
    var classId = 1
    var departId = 1
    var nativePlace = req.body.nativePlace
    var address = req.body.address
    var qq = req.body.qq
    var phone = req.body.phone
    var email = req.body.email
    // 服务器

    // 操作数据库
    var sql = `INSERT INTO students(
        sno,
        name,
        sex,
        birthday,
        card,
        majorId,
        classId,
        departId,
        nativePlace,
        address,
        qq,
        phone,
        email,
        status,
        createTime,
        createUserId
        )VALUE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    var data = [sno, name, sex, birthday, card, majorId, classId, departId, nativePlace,
        address,
        qq,
        phone,
        email,
        0,
        new Date(),
        req.session.user.id];
    pool.query(sql, data, function (err, result) {
        if(err){
            res.json({code:201,message:"数据库操作异常！"})
            return;
        }
        pool.query("INSERT INTO users(loginName, password,type,status)VALUE(?,?,?,?)",[name, md5('123456'), 2, 0],function(err,result2){
            if(err){
                res.json({code:201,message:"数据库操作异常！"})
                return;
            }
            res.json({code:200,message:"保存成功"});
        })
        // res.json({code:200,message:"保存成功"})
    })
    console.log(sno);
    res.json({ code: 200, message: "保存成功" })
    // res.render('students/add',{title:"学生添加"})
})
router.get('/list', function (req, res, next) {
    // res.json({code:200,message:"查询成功"})
    res.render('students/list', { title: "学生列表" })
})



module.exports = router;