const express = require('express'),//引入框架
      router = express.Router(),//使用Router()方法
      sql = require('../module/mysql'),
      fs = require('fs'),
      upload = require('../module/multer'),
      crypto = require('crypto');//引入加密模块

//判断用户是否登录
router.use((req,res,next) => {
    username = res.locals.login;
    if(!req.session.admin){
        next();
    }else{
        res.send('请用普通用户帐号登录！');
    }
});

//个人资料
router.get('/',(req,res) => {
    const user = req.params.user;
    sql('select * from user where username = ?',[username],(err,data) => {
        if(err) throw err;
        res.render('useradmin/personal.ejs',{ user : data })
    })
});

//修改资料
router.post('/updatepData',upload.single('file'),(req,res) => {
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
    },500)
});

//我的文章
router.get('/myarticle',(req,res) => {
    sql('select article.*,user.username,user.nickname from article join user on article.uid = user.id where username = ? order by article.id asc',[username],(err,data) => {
        sql('select * from `user` where username = ?',[username],(err,data1) => {
            res.render('useradmin/myarticle.ejs',{ art : data , user : data1 });
        })
    })
});

//发表文章
router.get('/userAddArticle',(req,res) => {
   sql('select * from user where username = ?',[username],(err,data) => {
       sql('select * from `article`',(err,data1) => {
           sql('select * from `menu2`',(err,data2) => {
               res.render('useradmin/userAddArticle.ejs',{ user : data, art : data1, menu : data2 });
           })
       })
   });
});
router.post('/userAddArticle',upload.single('file'),(req,res) => {
    const title = req.body.title,
          tag = req.body.tag,
          author = req.body.author,
          abstract = req.body.abstract,
          content = req.body.content,
          leveid = req.body.leveid,
          d = new Date(),
          time = d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';
    var img,uid;
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
        })

    });
});

//修改文章
router.get('/updateArticle',(req,res) => {
    sql('select * from `user`',(err,data) => {
        sql('SELECT article.*,menu2.title mtit from article join menu2 on article.type = menu2.id where article.id = ?',[req.query.id],(err,data1) => {
            sql('select * from menu2',(err,data2) => {
                res.render('useradmin/updateArticle.ejs', {user: data, art: data1, menu : data2});
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
        sql('update `article` set `title` = ? , `tag` = ? , `author` = ? , `abstract` = ? , `content` = ? , `img` = ? ,type = ? where `id` = ?',[title,tag,author,abstract,content,img,leveid,id],(err,data1) => {
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
router.post('/delArticle',(req,res) =>{
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
        sql('delete from `article` where `id` = ?',[pid],(err,data3) => {
            sql('delete from `comment` where `pid` = ?',[pid],(err,data4) => {
                if (err) {
                    return console.error(err);
                }
            });
        });
    })
    res.json({ succ : '成功' });
});

//我的评论
router.get('/mycomment',(req,res) => {
   if(username == undefined){
       res.send('请先登录!');
       return;
   }else{
       sql('SELECT a . * , user.username un, user.nickname nn FROM (SELECT l . * , article.title, article.author, article.uid auid FROM (SELECT COMMENT. * , user.nickname, user.username FROM COMMENT LEFT JOIN user ON comment.uid = user.id)l LEFT JOIN article ON l.pid = article.id)a LEFT JOIN user ON a.auid = user.id where a.username = ? order by id asc',[username],(err,data) => {
           if (err) {
               return console.error(err);
           }
           sql('select * from `user` where `username` = ?',[username],(err,data1) => {
               res.render('useradmin/mycomment.ejs', {data: data, user: data1 });
           });
       });
   }
});

//删除评论
router.post('/delcommment',(req,res) => {
    const cid = req.body.cid;
    sql('delete from `comment` where `id` = ?',[cid],(err,data) => {
        if (err) {
            return console.error(err);
        }
    });
    res.json({ succ : '成功' });
});

//修改评论
router.post('/updateComment',(req,res) => {
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
                res.render('useradmin/mycollect.ejs',{ data : data, user : data1 })
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
                res.render('useradmin/mypraise.ejs', {data: data, user: data1})
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

//退出按钮，清除cookie
router.get('/logout',(req,res) => {
    res.clearCookie('login');//清除cookie，退出
    res.redirect('/');//网络重定向，到首页
});

module.exports = router;