const express = require('express'),
      router = express.Router(),
      sql = require('../module/mysql'),
      crypto = require('crypto');

router.get('/',(req,res) => {
    res.render('login.ejs');
});
router.post('/',(req,res) => {
    const user = req.body['name'],
          password = req.body['password'],
          md5 = crypto.createHash('md5');

    sql('select * from `user` where `username` = ?',[user],(err,data) =>{
        //先判断用户名是否存在
        if(data.length == 0){
            res.json({
                err : '用户不存在'
            });
            return;
        }
        let newpass = md5.update(password).digest('hex');
        if (data[0]['password'] == newpass){
            //参数 1：cookie名称 2.保存的数据 3.过期时间
            res.cookie('login',{ name:user },{ maxAge:1000*60*60*24*2 });//过期时间2天
            //  session 保存到服务器上面的 所有后台页面都是可以访问到的
            //  session 在关闭页面的时候 session下面保存的所有数据 会清空
            //req.session.admin = data[0]['admin'];
            //此时req.session.admin的数据类型为string，if判断都为true，因此需要转换数据类型
            req.session.admin = Number(data[0]['admin']);
            if ( data[0]['flag'] == 0){
                sql('update `user` set flag = 1 where `username` = ?',[user],(err,data1) => {});
                if(data[0]['admin'] == 1){
                    res.json({ admin : '1' });
                    return;
                }else if(data[0]['admin'] == 0){
                    res.json({ useradmin : '1' });
                    return;
                }
            }
            res.json({
                result : '成功'
            });
            //res.render('./');//不能使用这个方法，因为模板那边提交的方式是ajax，返回的数据应该是以json格式返回。
        }else{
            res.send({
                erro : '错误'
            });
        }
    });
});

module.exports = router;