var express = require("express");
var router = express.Router();
const { uploading, formatResponse } = require("../utils/tool");
const { UploadError } = require("../utils/errors");
const multer = require("multer");

// 上传图片
router.post('/', async function(req, res,next) {
  // single方法写上传控件的name
  uploading.single("file")(req, res, function(err) {
    if(err instanceof multer.MulterError) {
      next(new UploadError("上传文件失败，请检查文件大小，控制在2MB以内"));
    } else {
      const resp = {
        mes: "上传文件成功",
        path: "/static/uploads" + req.file.filename
      }
      res.send(formatResponse(200, "", resp.path))
    }
  })
})


module.exports = router;