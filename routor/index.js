const express = require('express'),//引入框架
      router = express.Router(),//使用Router()方法
      sql = require('../module/mysql');//引入MySQL

router.get('/',(req,res) => {
    res.locals.admin = req.session.admin;//管理员字段 session
   /* SELECT Persons.LastName, Persons.FirstName, Orders.OrderNo
    FROM Persons, Orders WHERE Persons.Id_P = Orders.Id_P*/
    sql('select l.*,menu2.title mtit,menu2.id mid from (select article.*, user.nickname, user.username from article left join user on article.uid = user.id)l left join menu2 on l.type = menu2.id order by id desc limit 0,6',(err,data) => {
        if(err){
            res.send('读取失败');
            return;
        }
        sql('SELECT l.*,article.title,article.id aid FROM ( SELECT COMMENT . * , user.nickname, user.username FROM COMMENT left JOIN user ON comment.uid = user.id) l left JOIN article ON l.pid = article.id order by id desc limit 0,5',(err,data1) => {
            sql('select * from `user` where `username` = ?',[res.locals.login],(err,data2) => {
                sql('select * from  message limit 0,10',(err,data3) => {
                    sql('select * from  message',(err,data4) => {
                        sql('select * from  menu1',(err,data5) => {
                            sql('select menu1.*,menu2.* from  menu1 join menu2 on menu1.id = menu2.leveid',(err,data6) => {
                                res.render('index.ejs', {
                                    data: data,
                                    comment: data1,
                                    user: data2,
                                    mes : data3 ,
                                    meslen : data4,
                                    menu : data5,
                                    menu2 : data6
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

//文章列表
router.get('/article/list-:page.html',(req,res) => {
    const page = (req.params.page - 1) * 6;
    sql('select l.*,menu2.title mtit,menu2.id mid from (select article.*, user.nickname, user.username from article left join user on article.uid = user.id)l left join menu2 on l.type = menu2.id order by id desc limit ?,6',[page],(err,data1) => {
        if(err){
            res.send('读取失败');
            return;
        }
        sql('select * from article',(err,data2) => {
            sql('SELECT l.*,article.title,article.id aid FROM ( SELECT COMMENT . * , user.nickname, user.username FROM COMMENT left JOIN user ON comment.uid = user.id) l left JOIN article ON l.pid = article.id order by id desc limit 0,5',(err,data4) => {
                sql('select * from `user` where `username` = ?',[res.locals.login],(err,data3) => {
                    res.render('articleAll.ejs', {art: data1, alldata : data2, user: data3, comment : data4});
                });
            });
        });
   });
});

//查看用户
router.get('/usermessage/:id.html',(req,res) => {
    const id = req.params.id;
    sql('select l.*,menu2.title mtit,menu2.id mid from (select article.*, user.nickname, user.username from article left join user on article.uid = user.id)l left join menu2 on l.type = menu2.id where uid = ?',[id],(err,data)=>{
        sql('select comment.*,article.title from article join comment on article.id = comment.pid where comment.uid = ?',[id],(err,data1)=> {
            res.render('umessage.ejs',{ data : data, comm: data1 });
        })
    })
});

//退出按钮，清除cookie
router.get('/logout',(req,res) => {
    res.clearCookie('login');//清除cookie，退出
    res.redirect('/');//网络重定向，到首页
});

//nav测试
router.get('/nav',(req,res) => {
    res.render('nav.ejs',{ navData: req.session.navdata})
})

//文章详情页
router.get('/article/:id.html',(req,res) => {
    res.locals.admin = req.session.admin;//管理员字段 session
    //根据前台模板article.ejs传过来的id值进行数据库查询
    //使用'/article/:id.html'这种方式接收参数，那么获取id的方式就由req.query.id改为req.params.id
    const id = req.params.id;
    sql('select * from `article` order by id desc limit 0,8',(err,dataall) => {
        sql('select user.nickname,user.username,article.* from user join article on user.id = article.uid where article.id = ?',[id],(err,data) => {
            if (data.length == 0){
                res.status(404).render('404.ejs');
                return;
            }
            /*select a.*,b.* from a join b on a.id = b.id where             */
            sql('select * from `article` where `id` < ? order by id desc limit 0,1',[id],(err,data2) => {
                sql('select * from `article` where `id` > ? limit 0,1',[id],(err,data3) => {
                    sql('select user.*,comment.* from user join comment on user.id = comment.uid where comment.pid = ? order by comment.id asc',[id],(err,data1) => {
                        sql('select l.*,article.title,article.id aid from ( select comment . * , user.nickname, user.username from comment left join user on comment.uid = user.id) l left JOIN article ON l.pid = article.id order by id desc limit 0,5',(err,commentdata) => {
                            sql('select * from user where username = ?',[res.locals.login],(err,user) => {
                                res.render('article.ejs',{
                                    data : data ,
                                    comment : data1 ,
                                    data2 : data2 ,
                                    data3 : data3 ,
                                    dataall : dataall ,
                                    commentdata : commentdata,
                                    user : user
                                });
                            })
                        });
                    });
                })
            });

        });
    })

});

//文章评论
router.post('/article/:id.html',(req,res) =>{
    const pid = req.params.id;//文章ID
          content = req.body['content'];//评论内容
          user = res.locals.login,//用户名
          d = new Date(),
          time = d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
    if(user == undefined){
        res.json({ unlog : '未登录' });
        return;
    }
    sql('select * from `user` where `username` = ?',[user],(err,data) => {
        const uid = data[0]['id'];
        sql('INSERT INTO comment (id,uid,pid,content,time) VALUES (0,?,?,?,?)',[uid,pid,content,time],(err,data1) =>{
            if(err){
                res.json({
                    err : 'error'
                });
                return;
            }
            res.json({
                succ : 'success'
            });
        });
    })
});

//搜索功能
router.get('/search',(req,res) => {
    sql('select l.*,menu2.title mtit,menu2.id mid from (select article.*, user.nickname, user.username from article left join user on article.uid = user.id)l left join menu2 on l.type = menu2.id where l.title like ?',['%' + req.query.search + '%'],(err,data1) => {
            sql('SELECT l.*,article.title,article.id aid FROM ( SELECT COMMENT . * , user.nickname, user.username FROM COMMENT left JOIN user ON comment.uid = user.id) l left JOIN article ON l.pid = article.id order by id desc limit 0,5',(err,data4) => {
                sql('select * from `user` where `username` = ?',[res.locals.login],(err,data3) => {
                        res.render('articleSearch.ejs', {
                            menu: data1,
                            user: data3,
                            comment : data4
                        });
                });
            });
    });
})

//留言板
router.post('/message',(req,res) => {
    const con = req.body.con,
          user = res.locals.login,
          d = new Date(),
          time = d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
    var uid,name;
    sql('select * from user where username = ?',[user],(err,data) => {
       if(data.length){
           if(data[0]['nickname'].length){
               name = data[0]['nickname'];
           }else{
               name = data[0]['username'];
           }
       }else{
           name = '匿名用户';
       }
        sql('insert into message (id,name,content,time) values (0,?,?,?)',[name,con,time],(err,data) => {
            if(err){
               res.json({ err : 'err'});
               return;
            }
            res.json({
                succ : 'success'
            })
        });
    });
});
router.get('/messageAll/list-:page.html',(req,res) => {
    res.locals.admin = req.session.admin;
    const page = (req.params.page - 1) * 15;
    sql('select * from `article` order by id desc limit 0,8',(err,dataall) => {
        sql('select * from message order by id asc limit ?,15',[page],(err,data1) => {
            sql('select * from message ',(err,data2) => {
             sql('SELECT l.*,article.title,article.id aid FROM ( SELECT COMMENT . * , user.nickname, user.username FROM COMMENT left JOIN user ON comment.uid = user.id) l left JOIN article ON l.pid = article.id order by id desc limit 0,5',(err,commentdata) => {
                 sql('select * from user where username = ?', [res.locals.login], (err, user) => {
                     res.render('messaAll.ejs', {
                         comment: data1,
                         dataall: dataall,
                         commentdata: commentdata,
                         user: user,
                         page : data2
                     });
                 })
             })
             })
         });
    })
})


//文章版块
/*router.get('/aa',(req,res) => {
    res.locals.admin = req.session.admin;//管理员字段 session
    sql('select user.nickname,user.username,article.* from user,article where user.id = article.uid order by id desc limit ?,6',[0],(err,data1) => {
        if(err){
            res.send('读取失败');
            return;
        }
        sql('select * from article',(err,data2) => {
            sql('SELECT l.*,article.title,article.id aid FROM ( SELECT COMMENT . * , user.nickname, user.username FROM COMMENT left JOIN user ON comment.uid = user.id) l left JOIN article ON l.pid = article.id order by id desc limit 0,5',(err,data4) => {
                sql('select * from `user` where `username` = ?',[res.locals.login],(err,data3) => {
                    res.render('articleSection.ejs', {art: data1, alldata : data2, user: data3, comment : data4});
                });
            });
        });
    });
})*/

router.get('/section/:id.html',(req,res) => {
    const url = req.body.url,
          mid = req.body.mid,
          id = req.params.id;
    sql('select user.nickname,user.username,article.* from user,article where user.id = article.uid order by id desc limit ?,6',[0],(err,data1) => {
        sql('select * from article',(err,data2) => {
            sql('SELECT l.*,article.title,article.id aid FROM ( SELECT COMMENT . * , user.nickname, user.username FROM COMMENT left JOIN user ON comment.uid = user.id) l left JOIN article ON l.pid = article.id order by id desc limit 0,5',(err,data4) => {
                sql('select * from `user` where `username` = ?',[res.locals.login],(err,data3) => {
                    sql('select a.*,user.nickname,user.username from (SELECT l.*,article.* FROM ( SELECT menu2 . title titl,menu2.id mid , menu1.title tit FROM menu2 left JOIN menu1 ON menu2.leveid = menu1.id) l left JOIN article ON l.mid = article.type)a left join user on a.uid = user.id where a.mid = ? order by id desc',[id],(err,data5) => {
                        res.render('articleSection.ejs', {
                            art: data1,
                            alldata : data2,
                            user: data3,
                            comment : data4,
                            menu : data5
                        });
                    })
                });
            });
        });
    });
})

//管理员、注册、登录
router.use('/admin',require('./admin.js'));
router.use('/useradmin',require('./user.js'));
router.use('/reg',require('./reg.js'));
router.use('/login',require('./login.js'));
module.exports = router;