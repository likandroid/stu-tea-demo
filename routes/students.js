var express = require('express');
var router = express.Router();

var pool = require('../modules/db.js')
var md5 = require('md5');
var checkLogin = require('../modules/checkLogin');
var pager = require('../modules/pager');

router.get('/add', function (req, res, next) {
    // 查询数据库这些表，取出数据result传给专业，班级，院系有option选择项
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
    var majorId = req.body.majorId;
    var classId = req.body.classId;
    var departId = req.body.departId;
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
            address,qq,phone,email,0,new Date(),req.session.user.id];
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
router.get('/list', checkLogin, function (req, res, next) {
    var sql = `
    SELECT * FROM majors WHERE status = 0;
    SELECT * FROM classes WHERE status = 0;
    SELECT * FROM departments WHERE status = 0;
    SELECT COUNT(*) as totalCount FROM students;
    SELECT s.id,s.sno,s.name,s.sex,
    s.birthday,s.card,s.majorId,s.classId,s.departId,s.nativePlace,
    s.address,s.qq,s.phone,s.email,s.status,s.createTime,
    s.createUserId,s.updateTime,s.updateUserId, 
    d.name as departName, 
    m.name as majorName, 
    c.name as className, 
    u1.loginName as createUserName, 
    u2.loginName as updateUserName 
    FROM students s
    LEFT JOIN departments d ON s.departId = d.id
    LEFT JOIN majors m ON s.majorId = m.id
    LEFT JOIN classes c ON s.classId = c.id
    LEFT JOIN users u1 ON s.createUserId = u1.id
    LEFT JOIN users u2 ON s.updateUserId = u2.id WHERE (1=1) 
    `;
    //     /是params
    //   body接受参数的
    // query 是接受问好的
    var sno = req.query.sno -0;
    var name = req.query.name;
    var sex = req.query.sex;
    var majorId = req.query.majorId -0;
    var classId = req.query.classId;
    var departId = req.query.departId;
    var status = req.query.status;
    var birthdayBegin = req.query.birthdayBegin;
    var birthdayEnd = req.query.birthdayEnd;
    var card = req.query.card;

    if(sno){
        sql += ` AND s.sno like '%${sno}%'`;
    }
    if(name){
        sql += ` AND s.name like '%${name}%'`;
    }
    if(sex && sex != -1){
        sql += ` AND s.sex='${sex}'`;
    }
    console.log("结果是："+majorId)
    if(majorId && majorId != -1){
        sql += ` AND s.majorId=${majorId}`;
    }
    if(classId && classId != -1){
        sql += ` AND s.classId=${classId}`;
    }
    if(departId && departId != -1){
        sql += ` AND s.departId=${departId}`;
    }
    if(status && status != -1){
        sql += ` AND s.status='${status}'`;
    }
    // if(birthdayBegin){
    //     sql += ` AND s.birthday>='${birthdayBegin}'`;
    // }
    // if(birthdayEnd){
    //     sql += ` AND s.birthday<='${birthdayEnd}'`;
    // }
    if (birthdayBegin && birthdayEnd) {
        try {
            var begin = new Date(birthdayBegin);
            var end = new Date(birthdayEnd);

            if (begin >= end) {
                sql += ` AND s.birthday>='${birthdayEnd}' AND s.birthday<='${birthdayBegin}'`;
            } else {
                sql += ` AND s.birthday>='${birthdayBegin}' AND s.birthday<='${birthdayEnd}'`;
            }
        } catch (error) {
            res.json({ code: 201, message: '日期输入有误！' });
            return;
        }
    } else {
        if (birthdayBegin) {
            sql += ` AND s.birthday>='${birthdayBegin}'`;
        }
        if (birthdayEnd) {
            sql += ` AND s.birthday<='${birthdayEnd}'`;
        }
    }

    if(card){
        sql += ` AND s.card like '%${card}%'`;
    }
    /* (page - 1)*pageSize, pageSize
    0, 10
    10, 10
    20, 10 */
    var page = req.query.page || 1;
    // console.log(typeof(page));获取的是路径出入的第几页，是字符串String
    // 转为整型
    page = page - 0;
    // console.log(typeof(page)); 
    var pageSize = 10;
    sql += ` LIMIT ${(page - 1)*pageSize},${pageSize}`;

    // console.log("学"+sno);
    pool.query(sql, function (err, result) {
        if (err) {
            res.json({ code: 201, message: "数据库操作异常！" })
            return;
        }

        // 取当前表中的数据的总记录数
        var totalCount = result[3][0].totalCount;
        // console.log(totalCount);
        var totalPage = Math.ceil(totalCount / pageSize);
        
        var pages = pager(page, totalPage);
        console.log(pages);
        res.render('students/list', { title: "学生列表", 
        students: result[4],
        majors:result[0],
        classes:result[1],
        departs:result[2],
        pageInfo: {
            // 当前页数，每页显示的个数，总页数，总数据
            page,
            pages,
            pageSize, 
            totalPage,
            totalCount
        }});
    })

})

//  :id占位符，可以理解成把客户端传的数据放到id变量中
router.get('/edit/:id', checkLogin, function (req, res, next) {
    // params = parameter
    var id = req.params.id;
    if (!id) {
        res.json({ code: 201, message: '参数id必填！' });
        return;
    }

    pool.query(`
    SELECT * FROM students where id = ?;
    SELECT * FROM majors WHERE status = 0;
    SELECT * FROM classes WHERE status = 0;
    SELECT * FROM departments WHERE status = 0;
    `, [id], function (err, result) {
            if (err) {
                res.json({ code: 201, message: "数据库操作异常！" })
                return;
            }

            if (result[0].length != 1) {
                res.json({ code: 201, message: "你编辑学生不存在" })
                return;
            }
            res.render('students/edit', { title: '编辑学生', student: result[0][0], majors: result[1], classes: result[2], departs: result[3] })
        });
})

router.post('/edit', checkLogin, function (req, res, next) {
    var id = req.body.id;
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
    if (!id || !sno || !name || !sex || !birthday || !card || majorId == -1 || majorId == -1 || departId == -1) {
        res.json({ code: 201, message: '主键,学号,姓名,性别,生日,身份证,所学专业，所属班级，所属院系不能为空！' });
        return;
    }
    // url修改
    
    // json数组
    pool.query(`SELECT * FROM students WHERE id = ?`,[id],function(err,result){
        if (err) {
            res.json({ code: 201, message: "数据库操作异常！" })
            return;
        }
        // console.log(result);
        // console.log("长度："+result.length);
        if (result.length > 1 || result.length < 1) {
            res.json({ code: 201, message: "你编辑学生不存在" })
            return;
        }

        var sql = `UPDATE students set sno=?,name=?,sex=?,birthday=?,card=?,classId=?,majorId=?,departId=?,nativePlace=?,address=?,qq=?,phone=?,email=?,updateTime=?,updateUserId=? WHERE id=?`;
        var data = [sno, name, sex, birthday, card, classId, majorId, departId,nativePlace, address,qq,phone, email, new Date(), req.session.user.id, id];
        pool.query(sql, data, function(err,result1){
            if (err) {
                res.json({ code: 201, message: "数据库操作异常！" })
                return;
            }
            res.json({code:200,message:"编辑成功"})
        })
    })
})
router.post('/remove',checkLogin, function(req, res, next){
    // 传递id,进行sql语句的WHERE判断
    var id = req.body.id;
    if(!id){
        res.json({code:201,message:"参数错误！"});
        return;
    }
    // `DELETE FROM students WHERE id = ?`  删除一整条数据
    // `UPDATE students SET status=1 WHERE id=? ` 对状态进行修改 0为正常 1为删除
    var sql = `UPDATE students SET status=1 WHERE id=? `;

    pool.query(sql ,[id], function(err,result){
        if (err) {
            res.json({ code: 201, message: "数据库操作异常！" })
            return;
        }
        res.json({code:200,message:"删除成功"})
    })
})

router.post('/multiRemove',checkLogin, function(req, res,next){
    var ids = req.body.ids;
    if(!ids){
        res.json({ code: 201, message: "参数错误" })
        return;
    }
    pool.query(`UPDATE students SET status = 1 WHERE id in (${ids})`, function(err,result){
        if (err) {
            res.json({ code: 201, message: "数据库操作异常！" })
            return;
        }
        res.json({code:200,message:'批量删除成功'})
    })
    
})
module.exports = router;

