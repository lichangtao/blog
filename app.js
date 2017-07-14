const http = require('http'), //http是安装好node就有的一个模块，是用来创建http服务器的
      express = require('express'),//引入express框架
      app = express(), //初始化  执行并把结果保存到app
      bodyParser = require('body-parser'),//post请求
      cookieParser = require('cookie-parser'),//cookie
      session = require('express-session'),//session
      sql = require('./module/mysql'),//引入MySQL
      fs = require('fs');
//响应浏览器的方法，有get和post
module.exports = app;
//设置模板引擎目录
app.set('views',__dirname+'/views');
//设置使用的模板引擎是什么
app.set('view engine','ejs');
//设置静态资源目录
app.use('/',express.static(__dirname+'/public'));
//接收json数据
app.use(bodyParser.json());
//extended:true代表可以接收任何数据类型的数据
app.use(bodyParser.urlencoded( { extended : true } ));
//设置cookie密钥
app.use(cookieParser('oiwaersdngfjkah'));//密钥，任意写，最好设置随机数
//设置session密钥
app.use(session({ secret : 'koko' }));//密钥，任意写，最好设置随机数
// configdata 没有暴露出去任何内容 引入所有代码
require('./module/configdata');
app.post('/fs',(req,res) => {
    const imgdata = req.body.data,
        //用正则匹配掉base64编码之前的路径 data:image/xxx:base64,
          data = imgdata.replace(/^data:image\/\w+;base64,/,'');
          buffdata = Buffer.from(data,'base64'),
          filename = Date.now();
    fs.writeFile(`./${filename}.jpg`,buffdata,(err,data) => {
       res.json({
           upimg : filename
       });
    });
});
app.use('/ueditor/ue',require('./ue'));
//访问当前路径的时候  使用index文件里的 路由方法
app.use('/',require('./routor/index'));
//app.use('/admin',require('./routor/index_1'));

//创建http服务器
http.createServer(app).listen(1000);
