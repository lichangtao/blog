/**
 * Created by Administrator on 2017/5/5.
 */
const sql = require('./mysql');

let fn = function (i,firstNavData) {
    return new Promise(function (resolve,reject) {
        //根据navid查询二级导航
        sql('select * from `nav` where `level` = 2 and `navid` = ?',[firstNavData[i]['navid']],(err,secondNavData) => {
            //把二级导航数据保存到一级导航的child下面
            firstNavData[i].child = secondNavData;
            resolve();
            //console.log(firstNavData);
        })
    });
}
module.exports = function (cb) {
    sql('select * from `nav` where `level` = 1', (err, firstNavData) => {
        let arr = [];//定义一个空数组
        //遍历一级导航
        for (let i in firstNavData) {
            //调用函数fn，传递参数i和firstNavData，并把结果报存到arr数组
            arr[i] = fn(i, firstNavData);
            //console.log(arr)
        }
        Promise.all(arr).then(function () {
            //res.render('nav',{ navData : firstNavData });
            cb(firstNavData);
        })
        //all接收一组数组，里面保存的是arr数组的状态，如果都成功的话就执行.then
    });
}
