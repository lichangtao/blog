const express = require('express'),//引入框架
      router = express.Router(),//使用Router()方法
      sql = require('../module/mysql'),
      fs = require('fs'),
      upload = require('../module/multer'),
      crypto = require('crypto');//引入加密模块



//判断登录用户是否为管理员
router.use((req,res,next) => {
    username = res.locals.login;
    if(req.session.admin){
        next();
    }else{
        res.send('请用管理员帐号登录！');
    }
});

//个人资料
router.get('/',(req,res) => {
    sql('select * from user where username = ?',[username],(err,data) => {
        if(err) throw err;
        res.render('admin/admin.ejs',{ user : data })
    })
});

//修改资料
router.post('/updateuData',upload.single('file'),(req,res) => {
    const id = req.body.id,
        nickname = req.body.nickname,
        tel = req.body.tel,
        email = req.body.email,
        user = req.body.user,
        psw = req.body.password,
        prepsw = req.body.prepassword,
        md5 = crypto.createHash('md5');
    var photo,newpass;
    if(req.file){
        sql('select * from user where id = ?',[id],(err,data)=> {
            var preptoho = data[0]['photo'];
            if(preptoho){
                fs.unlink( process.cwd()+'/public'+preptoho, function(err) {
                    if (err) {
                        return console.error(err);
                    }
                    console.log("文件删除成功！");
                });
                sql('update user set photo = "" where id = ?',[id],(err,data) => {
                    if (err) {
                        return console.error(err);
                    }
                    console.log("路径删除成功！");
                })
            }
        });
        photo = '/img/'+req.file.filename;
    }else{
        photo = req.body.photo;
    }
    if( prepsw != psw ){
        newpass = md5.update(psw).digest('hex');
    }else{
        newpass = psw;
    }
    setTimeout(function () {
        sql('update `user` set `photo` = ? , `nickname` = ? , `tel` = ? , `email` = ? , `username` = ? , `password` = ?  where `id` = ?',[photo,nickname,tel,email,user,newpass,id],(err,data) => {
            res.cookie('login',{ name : user },{ maxAge:1000*60*60*24*2 });
            if(err){
                res.send('修改失败');
                return;
            }
            res.json({
                result : '修改成功'
            });
        });
    },600)
});

//用户管理
router.get('/user',(req,res) => {
    sql('select * from user',(err,data) => {
        if(err) throw err;
        res.render('admin/user.ejs',{ user : data })
    })
});

//添加用户
router.get('/addUser',(req,res) => {
    sql('select * from user',(err,data) => {
        if(err) throw err;
        res.render('admin/addUser.ejs',{ user : data })
    })
});
router.post('/addUser',upload.single('file'),(req,res) => {
    const nickname = req.body.nickname,
          tel = req.body.tel,
          email = req.body.email,
          user = req.body.user,
          password = req.body.password,
          d = new Date(),
          time = d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';
          md5 = crypto.createHash('md5');
    var photo;
    /*判断用户是否上传封面*/
    if(req.file){
        photo = '/img/' + req.file.filename
    }else{
        photo = '';
    }
    sql('select * from `user` where `username` = ?',[user],(err,data) => {
        if (data.length === 0){//可以注册
            let newpass = md5.update(password).digest('hex');
            sql('insert into `user` (`id`,`username`,`password`,`nickname`,`tel`,`email`,`photo`,`time`,`admin`) values (0,?,?,?,?,?,?,?,0)',[user,newpass,nickname,tel,email,photo,time],(err,data) => {
                if(err){
                    res.send({ err : '失败' });
                    return;
                }
                res.send({
                    succ : '保存成功'
                });
            });
        }else{//不可以注册
            res.send({
                result : '用户名已存在'
            });
        }
    });
});

//修改用户
router.get('/updateUser',(req,res) => {
    sql('select * from `user` where id = ?',[req.query.id],(err,data) => {
        res.render('admin/updateUser.ejs',{ user : data })
    })
});
router.post('/updateUser',upload.single('file'),(req,res) => {
    const id = req.body.id,
        nickname = req.body.nickname,
        tel = req.body.tel,
        email = req.body.email,
        user = req.body.user,
        preuser = req.body.preuser,
        psw = req.body.password,
        prepsw = req.body.prepassword,
        md5 = crypto.createHash('md5');
    var photo,newpass;
    if(req.file){
        sql('select * from user where id = ?',[id],(err,data)=> {
            var prephoto = data[0]['photo'];
            if(prephoto){
                fs.unlink( process.cwd()+'/public'+prephoto, function(err) {
                    if (err) {
                        return console.error(err);
                    }
                    console.log("文件删除成功！");
                });
                sql('update user set photo = "" where id = ?',[id],(err,data) => {
                    if (err) {
                        return console.error(err);
                    }
                    console.log("路径删除成功！");
                })
            }
        });
        photo = '/img/'+req.file.filename;
    }else{
        photo = req.body.photo;
    }
    if( prepsw != psw ){
        newpass = md5.update(psw).digest('hex');
    }else{
        newpass = psw;
    }
    //如果修改之前的名字是当前登录名，那就更改cookie
    if( preuser == res.locals.login  ){
        res.cookie('login',{ name : user },{ maxAge:1000*60*60*24*2 });
    }
    setTimeout(function () {
        sql('update `user` set `photo` = ? , `nickname` = ? , `tel` = ? , `email` = ? , `username` = ? , `password` = ?  where `id` = ?',[photo,nickname,tel,email,user,newpass,id],(err,data) => {
            if(err){
                res.send({ err : '失败' });
                return;
            }
            res.send({
                succ : '成功'
            });
        });
    },600)
});

//删除用户
router.post('/deleteUser',(req,res) => {
    const id = req.body.id;
    sql('select * from user where id = ?',[id],(err,data1)=> {
        if (err) {
            return console.error(err);
        }
        var photo = data1[0]['photo'];
        if (photo) {
            fs.unlink(process.cwd() + '/public' + photo, function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log("文件删除成功！");
            });
            sql('update user set photo = "" where id = ?', [id], (err, data2) => {
                if (err) {
                    return console.error(err);
                }
                console.log("路径删除成功！");
            })
        }
        sql('delete from `user` where `id` = ?',[id],(err,data) => {
            if (err) {
                return console.error(err);
            }
        });
    })
    res.json({ succ : '成功' });
});

//文章列表
router.get('/articleList',(req,res) => {
    sql('select article.*,user.username,user.nickname from article join user on article.uid = user.id order by article.id asc',(err,data) => {
        sql('select * from `user` where username = ?',[username],(err,data1) => {
            res.render('admin/articleList.ejs',{ art : data , user : data1 });
        })
    })
});

//我的文章
router.get('/myArticle',(req,res) => {
    sql('select article.*,user.username,user.nickname from article join user on article.uid = user.id where username = ? order by article.id asc',[username],(err,data) => {
        sql('select * from `user` where username = ?',[username],(err,data1) => {
            res.render('admin/myArticle.ejs',{ art : data , user : data1 });
        })
    })
});

//添加文章
router.get('/addArticle',(req,res) => {
    sql('select * from `user`',(err,data) => {
        sql('select * from `menu2`',(err,data1) => {
            res.render('admin/addArticle.ejs',{ user : data, menu : data1 });
        })
    })
});
router.post('/addArticle',upload.single('file'),(req,res) => {
    const title = req.body.title,
        tag = req.body.tag,
        author = req.body.author,
        abstract = req.body.abstract,
        content = req.body.content,
        leveid = req.body.leveid,
        d = new Date(),
        time = d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';
    var img;
    /*判断用户是否上传封面*/
    if(req.file){
        img = '/img/' + req.file.filename
    }else{
        img = '';
    }
    /*插入文章相关信息*/
    sql('select * from user where username = ?',[username],(err,data) => {
        uid = data[0]['id'];
        sql('insert into `article` (id,uid,title,tag,author,abstract,content,time,img,type) values (0,?,?,?,?,?,?,?,?,?)',[uid,title,tag,author,abstract,content,time,img,leveid],(err,data) => {
            if(err){
                res.send({ err : '失败' });
                return;
            }
            res.send({
                succ : '保存成功'
            });
        });
    });
});
router.get('/addSelfArticle',(req,res) => {
    sql('select * from `user`',(err,data) => {
        sql('select * from `menu2`',(err,data1) => {
            res.render('admin/addSelfArticle.ejs',{ user : data, menu : data1 });
        })
    })
});
router.post('/addSelfArticle',upload.single('file'),(req,res) => {
    const title = req.body.title,
        tag = req.body.tag,
        author = req.body.author,
        abstract = req.body.abstract,
        content = req.body.content,
        leveid = req.body.leveid,
        d = new Date(),
        time = d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';
    var img;
    /*判断用户是否上传封面*/
    if(req.file){
        img = '/img/' + req.file.filename
    }else{
        img = '';
    }
    /*插入文章相关信息*/
    sql('select * from user where username = ?',[username],(err,data) => {
        uid = data[0]['id'];
        sql('insert into `article` (id,uid,title,tag,author,abstract,content,time,img,type) values (0,?,?,?,?,?,?,?,?,?)',[uid,title,tag,author,abstract,content,time,img,leveid],(err,data) => {
            if(err){
                res.send({ err : '失败' });
                return;
            }
            res.send({
                succ : '保存成功'
            });
        });
    });
});

//修改文章
router.get('/updateArticle',(req,res) => {
    sql('select * from `user`',(err,data) => {
        sql('select * from `article` where `id` = ?',[req.query.id],(err,data1) => {
            sql('select * from menu2',(err,data2) => {
                res.render('admin/updateArticle.ejs', {user: data, art: data1, menu : data2});
            });
        });
    })
});
router.post('/updateArticle',upload.single('file'),(req,res) => {
    const id = req.body.id;
          title = req.body.title,
          tag = req.body.tag,
          author = req.body.author,
          abstract = req.body.abstract,
          content = req.body.content,
          leveid = req.body.leveid;
    var img;
    /*判断用户是否上传封面*/
    if(req.file){
        img = '/img/' + req.file.filename
    }else{
        sql('select img from article where id = ?',[id],(err,data) => {
            img = data[0]['img'];
        })
    }
    /*插入文章相关信息*/
    setTimeout(function () {
        sql('update `article` set `title` = ? , `tag` = ? , `author` = ? , `abstract` = ? , `content` = ? , `img` = ?, `type` = ? where `id` = ?',[title,tag,author,abstract,content,img,leveid,id],(err,data1) => {
            if(err){
                res.send({ err : '失败' });
                return;
            }
            res.send({
                succ : '成功'
            });
        })
    },500)
});
router.get('/updatesArticle',(req,res) => {
    sql('select * from `user`',(err,data) => {
        sql('select * from `article` where `id` = ?',[req.query.id],(err,data1) => {
            sql('select * from menu2',(err,data2) => {
                res.render('admin/updatesArticle.ejs', {user: data, art: data1, menu : data2});
            });
        });
    })
});
router.post('/updatesArticle',upload.single('file'),(req,res) => {
    const id = req.body.id;
    title = req.body.title,
        tag = req.body.tag,
        author = req.body.author,
        abstract = req.body.abstract,
        content = req.body.content,
        leveid = req.body.leveid;
    var img;
    /*判断用户是否上传封面*/
    if(req.file){
        img = '/img/' + req.file.filename
    }else{
        sql('select img from article where id = ?',[id],(err,data) => {
            img = data[0]['img'];
        })
    }
    /*插入文章相关信息*/
    setTimeout(function () {
        sql('update `article` set `title` = ? , `tag` = ? , `author` = ? , `abstract` = ? , `content` = ? , `img` = ?, `type` = ? where `id` = ?',[title,tag,author,abstract,content,img,leveid,id],(err,data1) => {
            if(err){
                res.send({ err : '失败' });
                return;
            }
            res.send({
                succ : '成功'
            });
        })
    },500)
});

//删除文章
router.post('/deleteArticle',(req,res) =>{
    const pid = req.body.pid;
    sql('select * from article where id = ?',[pid],(err,data1)=> {
        if (err) {
            return console.error(err);
        }
        var img = data1[0]['img'];
        if (img) {
            fs.unlink(process.cwd() + '/public' + img, function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log("文件删除成功！");
            });
            sql('update article set img = "" where id = ?', [pid], (err, data2) => {
                if (err) {
                    return console.error(err);
                }
                console.log("路径删除成功！");
            })
        }
        sql('delete from `article` where `id` = ?',[pid],(err,data1) => {
            sql('delete from `comment` where `pid` = ?',[pid],(err,data2) => {
                if (err) {
                    return console.error(err);
                }
            });
        });
    })
    res.json({ succ : '成功' });
});

//评论列表
router.get('/commentList',(req,res) => {
    /*select ll.*,user.username un,user.nickname nn (SELECT l.*,article.title,article.author,article.uid auid FROM ( SELECT COMMENT . * , user.* FROM COMMENT left JOIN user ON comment.uid = user.id) l left JOIN article ON l.pid = article.id ) ll left join user on ll.auid = user.id */
    sql('SELECT a . * , user.username un, user.nickname nn FROM (SELECT l . * , article.title, article.author, article.uid auid FROM (SELECT COMMENT. * , user.nickname, user.username FROM COMMENT LEFT JOIN user ON comment.uid = user.id)l LEFT JOIN article ON l.pid = article.id)a LEFT JOIN user ON a.auid = user.id order by id asc',(err,data) => {
        sql('select * from `user` where username = ?',[username],(err,data1) => {
            res.render('admin/commentList.ejs',{ data : data , user : data1 });
        })
    })
});

//删除评论
router.post('/deleteComment',(req,res) =>{
    const cid = req.body.cid;
    sql('delete from `comment` where `id` = ?',[cid],(err,data) => {
        if (err) {
            res.json({ err : '错误' })
        }
        res.json({ succ : '成功' });
    });
});

//我的评论
router.get('/mycommentList',(req,res) => {
    sql('SELECT a . * , user.username un, user.nickname nn FROM (SELECT l . * , article.title, article.author, article.uid auid FROM (SELECT COMMENT. * , user.nickname, user.username FROM COMMENT LEFT JOIN user ON comment.uid = user.id)l LEFT JOIN article ON l.pid = article.id)a LEFT JOIN user ON a.auid = user.id where a.username = ? order by id asc',[username],(err,data) => {
        sql('select * from `user` where username = ?',[username],(err,data1) => {
            res.render('admin/myComment.ejs',{ data : data , user : data1 });
        })
    })
});

//删除评论
router.post('/deletesComment',(req,res) => {
    const cid = req.body.cid;
    sql('delete from `comment` where `id` = ?',[cid],(err,data) => {
        if (err) {
            return console.error(err);
        }
    });
    res.json({ succ : '成功' });
});

//修改评论
router.post('/updatesComment',(req,res) => {
    const cid = req.body.cid;
    value = req.body.value;
    sql('update `comment` set `content` = ? where `id` = ?',[value,cid],(err,data1) => {
        if(err){
            res.send({ err : '失败' });
            return;
        }
        res.send({
            succ : '成功'
        });
    })

});

//点赞文章
router.post('/praiseArticle',(req,res) => {
    const pid = req.body.pid,
        uid = req.body.uid,
        d = new Date(),
        time = d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';
    sql('select * from praise where pid = ? and uid = ?',[pid,uid],(err,data) => {
        if(data.length == 0){
            sql('insert into praise (id,uid,pid,time) values (0,?,?,?)',[uid,pid,time],(err,data1) => {
                sql('update article set praise = praise +1 where id = ?',[pid],(err,data2) => {
                    res.send({ succ : 'sussess' });
                    return;
                });
            });
        }else{
            res.send({ res : 'res' });
        }
    });
});

//我的点赞
router.get('/mypraise',(req,res) => {
    if(username == undefined){
        res.send('请先登录!');
        return;
    }else {
        sql('SELECT a . * , user.username un, user.nickname nn FROM (SELECT l . * , article.title, article.author, article.uid auid,article.praise FROM (SELECT praise. * , user.username,user.nickname FROM praise LEFT JOIN user ON praise.uid = user.id)l LEFT JOIN article ON l.pid = article.id)a LEFT JOIN user ON a.auid = user.id where a.username = ? order by id asc', [username], (err, data) => {
            if (err) throw err;
            sql('select * from user where username = ?', [username], (err, data1) => {
                res.render('admin/mypraise.ejs', {data: data, user: data1})
            });
        })
    }
});

//取消点赞
router.post('/cancelPraise',(req,res) => {
    const pid = req.body.pid,
        uid = req.body.uid;
    sql('delete from praise where uid = ? and pid = ?',[uid,pid],(err,data1) => {
        sql('update article set praise = praise - 1 where id = ?',[pid],(err,data2) => {
            res.send({ succ : 'success' });
            return;
        });
    });
});

//收藏文章
router.post('/collectArticle',(req,res) => {
    const pid = req.body.pid,
        uid = req.body.uid,
        d = new Date(),
        time = d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';
    sql('select * from collect where pid = ? and uid = ?',[pid,uid],(err,data) => {
        if(data.length == 0){
            sql('insert into collect (id,uid,pid,time) values (0,?,?,?)',[uid,pid,time],(err,data1) => {
                sql('update article set collect = collect +1 where id = ?',[pid],(err,data2) => {
                    res.send({ succ : '已收藏' });
                    return;
                });
            });
        }else{
            res.send({ res : '已收藏' });
        }
    });
});

//我的收藏
router.get('/mycollect',(req,res) => {
    if(username == undefined){
        res.send('请先登录!');
        return;
    }else{
        sql('SELECT a . * , user.username un, user.nickname nn FROM (SELECT l . * , article.title, article.author, article.uid auid,article.collect FROM (SELECT collect. * , user.username,user.nickname FROM collect LEFT JOIN user ON collect.uid = user.id)l LEFT JOIN article ON l.pid = article.id)a LEFT JOIN user ON a.auid = user.id where a.username = ? order by id asc',[username],(err,data) => {
            if(err) throw err;
            sql('select * from user where username = ?',[username],(err,data1) => {
                res.render('admin/mycollect.ejs',{ data : data, user : data1 })
            });
        })
    }
});

//取消收藏
router.post('/cancelCollect',(req,res) => {
    const pid = req.body.pid,
        uid = req.body.uid;
    sql('delete from collect where uid = ? and pid = ?',[uid,pid],(err,data1) => {
        sql('update article set collect = collect - 1 where id = ?',[pid],(err,data2) => {
            res.send({ succ : 'success' });
            return;
        });
    });
});

//版块
router.get('/menu',(req,res) => {
    sql('select * from user where username = ?',[username],(err,data1) => {
        sql('select * from menu1',(err,data2) => {
            res.render('admin/article-section.ejs',{ user : data1, data : data2 });
        });
    })

})
router.post('/menu',(req,res) => {
    const title = req.body.title;
    sql('insert into `menu1` (id,title,level) values (0,?,1)',[title],(err,data) =>{
        if(err){
            res.json({ err : 'err' });
            return;
        }
        res.json({ succ : 'success' });
    });
});
router.post('/smenu',upload.single('sfile'),(req,res) => {
    const leveid = req.body.leveid,
          title = req.body.stitle,
          abs = req.body.sabs;
    var img;
    /*判断用户是否上传封面*/
    if(req.file){
        img = '/img/' + req.file.filename
    }else{
        img = '';
    }
    sql('insert into `menu2` (id,leveid,title,img,abstract) values (0,?,?,?,?)',[leveid,title,img,abs],(err,data) =>{
        if(err){
            res.json({ err : 'err' });
            return;
        }
        res.json({ succ : 'success' });
    });
});

//删除版块
router.get('/delmenu',(req,res) => {
    sql('select * from user where username = ?',[username],(err,data1) => {
/*
        sql('SELECT menu1.*,menu2.id sid,menu2.title stitle FROM menu1 join menu2 on menu1.id = menu2.leveid',(err,data2) => {
*/
        sql('select * from menu2',(err,data2) => {
            sql('select * from menu1',(err,data3) => {
                res.render('admin/del-article-section.ejs',{ user : data1, menu2 : data2 , menu1 : data3});
            });
        });
    })

})
router.post('/delmenu1',(req,res) => {
    const id = req.body.id;
    sql('delete from menu1 where `id` = ?',[id],(err,data1) => {
        sql('DELETE menu2.*,article.* FROM menu2 INNER JOIN article ON menu2.id = article.type WHERE menu2.leveid  = ?',[id],(err,data2) => {
            if (err) {
                return console.error(err);
            }
        });
    });
    res.json({ succ : '成功' });
})
router.post('/delmenu2',(req,res) => {
    const sid = req.body.sid;
    sql('select * from menu2 where id = ?',[sid],(err,data1)=> {
        if (err) {
            return console.error(err);
        }
        var img = data1[0]['img'];
        if (img) {
            fs.unlink(process.cwd() + '/public' + img, function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log("文件删除成功！");
            });
            sql('update menu2 set img = "" where id = ?', [sid], (err, data2) => {
                if (err) {
                    return console.error(err);
                }
                console.log("路径删除成功！");
            })
        }
        sql('delete from menu2 where `id` = ?',[sid],(err,data) => {
            sql('delete from article where `type` = ?',[sid],(err,data1) => {
                if (err) {
                    return console.error(err);
                }
            });
        });
    })
    res.json({ succ : '成功' });
})









//用户修改并保存到数据库
router.post('/user/updateUser',(req,res) => {
    const id = req.body.id,
          preName = req.body.preName,
          name = req.body.name,
          admin = req.body.admin;
          //preName 代表当前没修改的用户名  name 代表修改之后的用户名
    sql('update `user` set `username` = ? , `admin` = ? where `id` = ?',[name,admin,id],(err,data) => {
        if(err){
            res.send('更新失败');
            return;
        }
        if( res.locals.login == preName ){
            //判断如果修改的是当前用户的用户名，那么同时修改cookie和session
            res.cookie('login',{ name : name },{ maxAge:1000*60*60*24 });
            req.session.admin = Number(admin);
            //注意这里！！由于前端提交的数据类型都是字符串，因此admin需要转为number类型！！
            //如果写这样req.session.admin = admin; 那么session改变了但是要重启浏览器或者服务才能生效！
        }
        res.json({
            result : '更新成功'
        });
    });
});

//后台导航管理
router.get('/nav',(req,res) => {
    //只查询一级的
    sql('select * from `nav` where `level` = 1',(err,data) => {
        res.render('admin/nav',{ data : data });
    });
});
//
router.post('/nav',(req,res) => {
    sql('insert into `nav` (id,title,navid,level,url) values (1,?,?,1,?)',[],(err,data) =>{

    });
    console.log(req.body)
});
//修改前台模板文件
router.get('/views',(req,res) => {
    let dir = fs.readdirSync(`${process.cwd()}/views`);
    res.render('admin/views',{ dir : dir });
});
router.post('/views',(req,res) => {
    //接收前台传来的值
    let dirname = req.body.dirname,
        dirtype = req.body.dirtype,
        content = req.body.content;
    //判断文件类型  注：前台传来的为字符串类型
    //如果类型为1,读取文件
    if(dirtype === '1'){
        fs.readFile(`${process.cwd()}/views/${dirname}`,'utf-8',(err,data) => {
            res.json({
                dirname : dirname,
                content : data
            })
        });
        return;
    }
    //如果类型为2,读取目录
    if(dirtype === '2'){
        fs.readdir(`${process.cwd()}/views/${dirname}`,(err,data) => {
            res.json({
                dirtype : '2',
                dirname : dirname,
                content : data
            })
        });
        return;
    }
    //如果类型为3,修改文件内容
    if(dirtype === '3'){
        fs.writeFile(`${process.cwd()}/views/${dirname}`,content,(err,data) => {
            res.json({
                result:'成功'
            })
        })
    }
    // 在后台把所有的一起读取出来 返回给前台
    let dir = fs.readdirSync(`${process.cwd()}/views`);
    for(let i in dir){
        dir[i].includes('.')
    }
});

module.exports = router;