const app = require('../app'),
      sql = require('./mysql'),//  ./代表当前目录
      navData = require('./nav');

//判断cookie和session状态
app.use(function (req,res,next) {
    //注意：当没有加next参数的时候，到了这个函数是不会跳出去的，会一直在里面执行，所以需要加上一个条件使得它跳出这个函数，就是执行next跳出。
    if(req.cookies['login']){
        res.locals.login = req.cookies.login.name;
        //console.log('app - cookie : '+res.locals.login);
    }
    //为登陆状态 并且 管理员状态为undefined、改变的时候进行查询
    //console.log('app - session : '+req.session.admin);
    if(res.locals.login && (req.session.admin == undefined || req.session.admin == 0 || req.session.admin == 1)){
        sql('SELECT * FROM user where username = ?',[res.locals.login],(err,data) => {
            if(!data.length){
                res.clearCookie('login');//清除cookie，退出
                res.redirect('/');//网络重定向，到首页
                return;
            }else{
                req.session.admin = Number(data[0]['admin']);
                next();
            }
        })
    }else{
        next();
    }
});
//获取导航数据
app.use(function (req,res,next){
    //如果导航数据不存在
    if(req.session.navData === undefined){
        //获取导航数据并保存
        navData(ondata => {
            req.session.navData = ondata;
            next()
        });
    }else{
        next()
    }
});