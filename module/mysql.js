const mysql = require('mysql');//引入MySQL模块
//开放MySQL
module.exports = function (sql,value,callback) {
    //连接配置
    let config = mysql.createConnection({
        //数据库地址
        host : "127.0.0.1",
        //用户名
        user : "root",
        //密码
        password : "root",
        //端口号
        port : "3306",
        //数据库名称
        database : "node"
    });
    //开始连接
    config.connect();
    //进行数据库操作
    // 参1：数据库代码   参2：动态值   参3：回调
    config.query(sql,value,(err,data) => {
        //err 错误信息  data 返回的数据
        callback && callback(err,data);
    });
    //结束连接
    config.end();
};

