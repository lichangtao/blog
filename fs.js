/**
 * Created by Administrator on 2017/5/12.
 */
const fs = require('fs');

//检测、创建文件
//fs.open(path, flags, [mode], [callback(err,fd)])
/*flags参数:
'r' -   以读取模式打开文件。
'r+' - 以读写模式打开文件。
'rs' - 使用同步模式打开并读取文件。指示操作系统忽略本地文件系统缓存。
'rs+' - 以同步的方式打开，读取 并 写入文件。
注意：这不是让fs.open变成同步模式的阻塞操作。如果想要同步模式请使用fs.openSync()。

'w' - 以读取模式打开文件，如果文件不存在则创建
'wx' - 和 ' w ' 模式一样，如果文件存在则返回失败
'w+' - 以读写模式打开文件，如果文件不存在则创建
'wx+' - 和 ' w+ ' 模式一样，如果文件存在则返回失败

'a' - 以追加模式打开文件，如果文件不存在则创建
'ax' - 和 ' a ' 模式一样，如果文件存在则返回失败
'a+' - 以读取追加模式打开文件，如果文件不存在则创建
'ax+' - 和 ' a+ ' 模式一样，如果文件存在则返回失败
mode    用于创建文件时给文件制定权限，默认0666*/
/*fs.open('./1.txt','wx',(err,data)=> {
    if (err) throw err;
    console.log('写入完成');
});*/
//创建文件夹
/*
 fs.mkdir('./test',(err,data) => {
 if (err) throw err;
 console.log('创建完成');
 })*/
//删除文件夹
/*
 fs.rmdir('./test');*/
//删除文件
/*fs.unlink('./123.txt');*/

// 写入并替换已有数据, 文件不存在会自动创建
/*fs.writeFile('1.txt', 'Hello Node!', function (err) {
    //123.txt 为文件名 , Hello Node为写入的内容
    if (err) throw err;
    console.log('写入完成');
});*/
// 追加数据
/*fs.appendFile('1.txt', '添加数据，默认 utf8 格式', function (err) {
    //在123.txt文件里添加内容：'添加数据，默认 utf8 格式'
    if (err) throw err;
    console.log('添加完成');
});*/
// 读取数据
/*fs.readFile('123.txt', function (err, data) {
    //读出123.txt文件里的内容
    if (err) throw err;
    console.log(data.toString());
});*/

