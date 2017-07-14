/*
const http = require('http');

http.createServer( (request,response) => {
    response.writeHead(200,{'Content-Type':'text/html'});
    response.end('hello World');
}).listen(233);*/

const http = require('http'),
      express = require('express'),
      app = express(),
      bodyParser = require('body-parser');

//设置模板引擎目录
app.set('views',__dirname+'/views');
app.set('view engine','ejs');
//设置静态资源目录
app.use('/',express.static(__dirname+'/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));


app.use('/',require('./2.js'));

http.createServer(app).listen(233);
