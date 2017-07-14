const multer = require('multer'),
      path = require('path');

//  上传路径处理 上传之后重命名
let storage = multer.diskStorage({
    //设置上传文件路径
    destination : path.join(process.cwd(),'public/img'),
    filename : function (req,file,callback){
        let filename = (file.originalname).split(".");
        callback(null, `${Date.now()}.${filename[filename.length-1]}` );
    }
});
//添加配置文件到multer对象。
let upload = multer({
    storage : storage,
});

//导出对象
module.exports = upload;
