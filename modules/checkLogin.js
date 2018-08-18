function checkLogin(req,res,next){
    console.log(req.session.user);
    if(!(req.session && req.session.user)){
        // res.json({code:201,message:"你没有登录"})
        res.render('login', { title: '登录' });
        return;
    }
    next();
}
module.exports = checkLogin;