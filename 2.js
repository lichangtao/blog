const express = require('express'),
      router = express.Router(),
      sql = require('./module/mql');

router.get('/',(req,res) => {
    res.render('idx.ejs');
 });
router.get('/post',(req,res) => {
    res.render('post.ejs');
});

router.get('/reg',(req,res) => {
    //res.render('idx.ejs',{ title : 'Express' });
    /*sql('select * from user',(err,result) => {
        res.render('idx',{
            data : result,
            title : 'Expresss'
        });
    });*/
    sql('insert into `user` (`id`,`username`,`password`) values (0,?,?)',[req.query.name,req.query.password],(err,result) => {

    });
});

router.post('/reg',(req,res) => {

});

module.exports = router;