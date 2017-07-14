const express = require('express'),//引入框架
    router = express.Router(),//使用Router()方法
    sql = require('../module/mysql');//引入MySQL

/*router.get('/',(req,res) => {
 //res.send('this is my two node project！2333');//响应数据方法之一
 res.sendFile(process.cwd()+'/views/index.html'); //绝对路径process.cwd()去响应文件
 });*/
//添加一个访问路径123
/*router.get('/123',(req,res) =>　{
 res.send('hello world');
 })*/


router.get('/',(req,res) =>{
    sql('select * from `user`',(err,data) => {
        //console.log(data);
        res.render('index',{ data : data });
        // res.render将数据填充到模板后展示出完整的页面。
        //响应模板引擎文件index.ejs，data是mysql.js回调过来的
    });
});
//添加路径，通过该路径响应post.ejs模板
router.get('/post',(req,res) => {
    res.render('post.ejs');
});
//添加一个路由规则，通过req获取数据
router.get('/reg',(req,res) => {
    //req,浏览器发送给服务器的数据保存在这里
    //console.log(req.query.name);
    //参数1：数据库代码  参数2：动态值  参数3：回调
    sql('insert into `user` (`id`,`username`,`password`) values (0,?,?)',[req.query.name,req.query.password],(err,result) => {
        if(err){
            console.log('[INSERT ERROR] - ',err.message);
            return;
        }
        res.json({
            success : '[INSERT SUCCESS] - '
        });
    });
});

//post
router.post('/register',(req,res) => {
    //req.body 用来接收post方式提交的数据
    sql('insert into `user` (`id`,`username`,`password`) values (0,?,?)',[req.body.name,req.body.password],(err,result) => {
        if (err){
            console.log('[INSERT ERROR] - ',err.message);
            return;
        }
        res.json({
            success : '[INSERT SUCCESS] - '
        });
    });
});

module.exports = router;//开放router