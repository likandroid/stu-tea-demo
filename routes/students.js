var express = require('express');
var router = express.Router();

var pool = require('../modules/db.js')
var md5 = require('md5');
var checkLogin = require('../modules/checkLogin');

router.get('/add', function (req, res, next) {

    var sql = `SELECT * FROM majors WHERE status = 0;
    SELECT * FROM classes WHERE status = 0;
    SELECT * FROM departments WHERE status = 0;
    `;

    pool.query(sql, function (err, result) {
        if (err) {
            res.json({ code: 201, message: "数据库操作异常！" })
            return;
        }
        console.log("查询的数据" + result);
        var majors = result[0];
        var classes = result[1];
        var departs = result[2];
        res.render('students/add', { title: "学生添加", majors, classes, departs });
    })
    // res.json({code:200,message:"添加成功"})

})
router.post('/add', checkLogin, function (req, res, next) {

    var sno = req.body.sno;
    var name = req.body.name;
    var sex = req.body.sex;
    var birthday = req.body.birthday;
    var card = req.body.card;
    var majorId = req.body.majorId - 0;
    var classId = req.body.classId - 0;
    var departId = req.body.departId - 0;
    var nativePlace = req.body.nativePlace;
    var address = req.body.address;
    var qq = req.body.qq;
    var phone = req.body.phone;
    var email = req.body.email;
    // 服务器端判断
    if (!sno || !name || !sex || !birthday || !card || majorId == -1 || majorId == -1 || departId == -1) {
        res.json({ code: 201, message: '学号,姓名,性别,生日,身份证,所学专业，所属班级，所属院系不能为空！' });
        return;
    }
    // 操作数据库
    // 2.1 验证数据库是否存在sno
    pool.query("SELECT * FROM students WHERE sno = ?", [sno], function (err, result) {
        if (err) {
            res.json({ code: 201, message: "数据库操作异常！" })
            return;
        }
        if (result.length > 0) {
            res.json({ code: 202, message: "你添加的学生已存在！" })
            return;
        }

        // 2.2 向students和users插入数据
        var sql = `INSERT INTO students(sno,name,sex,birthday,card,
            majorId,classId,departId,nativePlace,address,qq,phone, email,status,createTime,
            createUserId)VALUE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        var data = [sno, name, sex, birthday, card, majorId, classId, departId, nativePlace,
            address,
            qq,
            phone,
            email,
            0,
            new Date(),
            req.session.user.id];
        pool.query(sql, data, function (err, result1) {
            if (err) {
                res.json({ code: 201, message: "数据库操作异常！" })
                return;
            }

            pool.query("INSERT INTO users(loginName, password,type,status)VALUE(?,?,?,?)", [sno, md5('123456'), 2, 0], function (err, result2) {
                if (err) {
                    res.json({ code: 201, message: "数据库操作异常！" })
                    return;
                }
                res.json({ code: 200, message: "保存成功" });
                return;
            })

            
        })
        // console.log(sno);
        // res.json({ code: 200, message: "保存成功" });
        // res.render('students/add',{title:"学生添加"})
    })

})




router.get('/list', function (req, res, next) {
    // res.json({code:200,message:"查询成功"})
    console.log("准备");
    res.render('students/list', { title: "学生列表" });
})

module.exports = router;