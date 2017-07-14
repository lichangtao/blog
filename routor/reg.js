const express = require('express'),//引入框架
      router = express.Router(),//使用Router()方法
      sql = require('../module/mysql'),//引入MySQL
      crypto = require('crypto');//引入加密模块

router.get('/',(req,res) => {
    res.render('reg.ejs');
});
router.post('/',(req,res) => {
    const user = req.body.name,
          password = req.body.password,
          d = new Date(),
          time = d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日',
          md5 = crypto.createHash('md5');
    sql('select * from `user` where `username` = ?',[user],(err,data) => {
        //console.log(data);
        if (data.length === 0){//可以注册
            //                 密码加密           编码格式
            let newpass = md5.update(password).digest('hex');
            sql('insert into `user` (`id`,`username`,`password`,`time`,`admin`) values (0,?,?,?,0)',[user,newpass,time],(err,data) => {
                if(err){
                    res.render('err.ejs');
                    return;
                }
                res.render('login.ejs');
            });
        }else{//不可以注册
            res.send({
                err : '用户名已存在'
            });
            //疑问：在reg.ejs模板文件写注册方式的时候用form方式提交，当用户名冲突的时候会响应跳转到err.ejs，用ajax方式提交则不会响应，为什么？
        }
    });
});
module.exports = router;