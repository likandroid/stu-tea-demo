var express = require('express');
var router = express.Router();

var pool = require('../modules/db');
var checkLogin = require('../modules/checkLogin');
var pager = require('../modules/pager');

// 向teachers/add.ejs中传递option选项的值
router.get('/add',checkLogin,function(req,res,next){
    var sql = `SELECT * FROM majors WHERE status = 0;
    SELECT * FROM classes WHERE status = 0;
    SELECT * FROM departments WHERE status = 0;
    `;
    pool.query(sql, function(err,result){
        if(err){
            res.json({code:201,message:"数据库操作异常"})
        }
        console.log(result);
        var majors = result[0];
        var classes = result[1];
        var departs = result[2];
        res.render('teachers/add',{title:"教师添加",majors, classes, departs});
    })
    // res.json({code:200,message:"添加成功"})  
})
router.post('/add',checkLogin, function(req, res, next){
    // 接收t-add中传来的添加的值
    // console.log("tec:"+req.body);
    var tno = req.body.tno;
    var name = req.body.name;
    var sex = req.body.sex;
    var birthday = req.body.birthday;
    var card = req.body.card;
    var majorId = req.body.majorId -0;
    var classId = req.body.classId -0;
    var departId = req.body.departId -0;
    var nativePlace = req.body.nativePlace;
    var address = req.body.address;
    var qq = req.body.qq;
    var phone = req.body.phone;
    var email = req.body.email;

    if (!tno || !name || !sex || !birthday || !card || majorId == -1 || classId == -1 || departId == -1) {
        res.json({code:201,message:"编号,姓名,性别,生日,身份证,所属专业，所属班级，所属院系不能为空！"});
        return;
    }
    // 首先查询数据库中是否意京存在同样的教师编号
    pool.query("SELECT * FROM teachers WHERE tno = ?",[tno], function(err, result){
        if(err){
            res.json({ code: 201, message: "数据库操作异常！" })
            return;
        }
        if(result.length > 0){
            res.json({ code: 201, message: "您添加的教师编号已存在" })
            return;
        }

        // 向teachers中插入数据
        var sql = `INSERT INTO teachers(tno,name,sex,birthday,card,
            majorId,classId,departId,nativePlace,address,qq,phone, email,status,createTime,
            createUserId)VALUE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        var data = [tno, name,sex, birthday, card, majorId, classId,departId,
            nativePlace, address, qq, phone, email, 0, new Date(), req.session.user.id];
        pool.query(sql, data, function(err, result){
            if(err){
                res.json({ code: 201, message: "数据库操作异常！" })
                return;
            }
            // 不进行将在users表中存入登陆账号密码
            res.json({code:200, message:"教师添加成功"});
        })
    })
})
router.get('/list',checkLogin,function(req,res,next){
    // res.json({code:200,message:"查询成功"})
    var sql = `
    SELECT * FROM majors WHERE status = 0;
    SELECT * FROM classes WHERE status = 0;
    SELECT * FROM departments WHERE status = 0;
    SELECT count(*) as totalCount FROM teachers; 
    SELECT t.id,t.tno,t.name,t.sex,
    t.birthday,t.card,t.majorId,t.classId,t.departId,t.nativePlace,
    t.address,t.qq,t.phone,t.email,t.status,t.createTime,
    t.createUserId,t.updateTime,t.updateUserId, 
    d.name as departName, 
    m.name as majorName, 
    c.name as className, 
    u1.loginName as createUserName, 
    u2.loginName as updateUserName 
    FROM teachers t
    LEFT JOIN departments d ON t.departId = d.id
    LEFT JOIN majors m ON t.majorId = m.id
    LEFT JOIN classes c ON t.classId = c.id
    LEFT JOIN users u1 ON t.createUserId = u1.id
    LEFT JOIN users u2 ON t.updateUserId = u2.id WHERE (1=1) `;

        var tno = req.query.tno -0;
        var name = req.query.name;
        var sex = req.query.sex;
        var majorId = req.query.majorId;
        var classId = req.query.classId -0;
        var departId = req.query.departId -0;
        var status = req.query.status;
        var birthdayBegin = req.query.birthdayBegin;
        var card = req.query.card;
        var birthdayEnd = req.query.birthdayEnd;
        
        

        if(tno){
            sql += ` AND t.tno like '%${tno}%'`;
        }
        if(name){
            sql += ` AND t.name like '%${name}%'`;
        }
        if(sex && sex != -1){
            sql += ` AND t.sex like '${sex}'`;
        }
        console.log("类型1"+typeof(majorId));
        if(majorId && majorId != -1){
            sql += ` AND t.majorId like ${majorId}`;
        }
        if(classId && classId != -1){
            sql += ` AND t.classId like '${classId}'`;
        }
        if(departId && departId != -1){
            sql += ` AND t.departId like '${departId}'`;
        }
        if(status && status != -1){
            sql += ` AND t.status like '${status}'`;
        }
        if(birthdayBegin && birthdayEnd){
            try {
                var begin = new Date(birthdayBegin);
                console.log(begin);
                var end = new Date(birthdayEnd);
                
                if(begin > end){
                    sql += ` AND t.birthday >='${birthdayEnd}' AND  t.birthday <='${birthdayBegin}'`;
                }else{
                    sql += ` AND t.birthday >='${birthdayBegin}' AND  t.birthday <='${birthdayEnd}'`;
                }
            } catch (error) {
                res.json({ code: 201, message: '日期输入有误！' });
                return;
            }
        }else{
            if(birthdayBegin){
                sql = ` AND t.birthday >='${birthdayBegin}`;
            }
            if(birthdayEnd){
                sql = ` AND t.birthday <='${birthdayEnd}`;
            }
        }
        if(card){
            sql += ` AND t.card like '%${card}%'`;
        }
       
        var page = req.query.page || 1;
        page = page -0;

        var pageSize = 10;
        console.log("page"+page);
        sql += ` LIMIT ${(page-1)*pageSize}, ${pageSize}`;

        pool.query(sql, function(err, result){
            if(err){
                res.json({code:201,message:"数据库操作异常！"});
                return;
            }

            // console.log(result[3]);
            var totalCount = result[3][0].totalCount;
            var totalPage = Math.ceil(totalCount / pageSize);

            var pages = pager(page, totalPage);
            // console.log(result[3]);
            res.render('teachers/list',{title:"教师添加",
            teachers:result[4],
            majors:result[0],
            classes:result[1],
            departs:result[2],
            // pageInfo:result[3]
            pageInfo: {
                page,
                pages,
                pageSize,
                totalPage,
                totalCount
            }
        })
    })
})

router.get('/edit/:id',checkLogin, function(req, res, next){
    // 用来接收get请求
    var id = req.params.id;
    console.log(id);
    if(!id){
        res.json({code:201, message:"参数id不存在!"});
        return;
    }
    sql = ` SELECT * FROM teachers WHERE id =?;
    SELECT * FROM majors WHERE status = 0;
    SELECT * FROM classes WHERE status = 0;
    SELECT * FROM departments WHERE status = 0; `;
    pool.query(sql, [id],function(err, result){
        if(err){
            res.json({code:201, message:"数据库出现异常!"});
            return;
        }
        // console.log(result[0]);形式是[[{id: ,name: ,...}]]
    res.render('teachers/edit', {
        title:"教师编辑",
        teacher: result[0][0],
        majors: result[1],
        classes: result[2],
        departs: result[3]
        })
    }) 
})
router.post('/edit',checkLogin,function(req,res, next){
    var id = req.body.id;
    var tno = req.body.tno;
    var name = req.body.name;
    var sex = req.body.sex;
    var birthday = req.body.birthday;
    var card = req.body.card;
    var majorId = req.body.majorId -0;
    var classId = req.body.classId -0;
    var departId = req.body.departId - 0;
    var nativePlace = req.body.nativePlace;
    var address = req.body.address;
    var qq = req.body.qq;
    var phone = req.body.phone;
    var email = req.body.email;

    if (!id || !tno || !name || !sex || !birthday || !card || majorId == -1 || classId == -1 || departId == -1) {
        res.json({ code: 201, message: '主键,学号,姓名,性别,生日,身份证,所学专业，所属班级，所属院系不能为空！' });
        return;
    }
    var sql = `SELECT * FROM teachers WHERE id = ?`;
    pool.query(sql, [id], function(err, result){
        if(err){
            res.json({code: 201, message: "数据库操作异常！"});
            return;
        }
        if (result.length > 1 || result.length < 1) {
            res.json({ code: 201, message: "你编辑学生不存在" })
            return;
        }
        var sql = `UPDATE teachers set tno=?,name=?,sex=?,birthday=?,card=?,classId=?,majorId=?,departId=?,nativePlace=?,address=?,qq=?,phone=?,email=?,updateTime=?,updateUserId=? WHERE id=?`;
        var data = [tno, name, sex, birthday, card, classId, majorId, departId, nativePlace, address, qq, phone, email, new Date(), req.session.user.id, id];
        pool.query(sql, data, function(err, result1){
            if(err){
                res.json({code: 201, message: "数据库操作异常！"});
                return;
            }
            res.json({code:200,message:"编辑成功"});
        })
    })
})
router.post('/remove', checkLogin, function(req, res, next){
    var id = req.body.id;
    console.log("获取的:"+id);
    if(!id){
        res.json({code:201,message:"参数错误！"});
        return;
    }
    var sql = `UPDATE teachers SET status=1 WHERE id=?`;
    pool.query(sql,[id],function(err,result){
        if (err) {
            res.json({ code: 201, message: "数据库操作异常！" })
            return;
        }
        res.json({code:200,message:"删除成功"});

    })
})
router.post('/multiRemove', checkLogin, function(req,res, next){
    // = 和 in的区别，  in可以规定多个值
    var ids = req.body.ids;
    if(!ids){
        res.json({ code: 201, message: "参数错误" })
        return;
    }
    sql = `UPDATE teachers SET status = 1 WHERE id in (${ids})`;
    pool.query(sql,function(err, result){
        if (err) {
            res.json({ code: 201, message: "数据库操作异常！" })
            return;
        }
        res.json({code:200,message:'批量删除成功'})
    })
})
module.exports = router;