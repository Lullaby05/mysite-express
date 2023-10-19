var express = require('express');
var router = express.Router();
const { formatResponse, analysisToken } = require("../utils/tool");

const { loginService, updateService } = require("../service/adminService");
const { ValidationError } = require('../utils/errors');

/* 登录 */
router.post('/login', async function(req, res, next) {
  // 首先验证验证码
  if(req.body.captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
    // 验证码没通过
    throw new ValidationError("验证码错误");
  }
  
  // 验证码通过，验证账号密码
  const result = await loginService(req.body)
  // 有token则登录成功，否则返回null
  if(result.token) {
    res.setHeader("authentication", result.token);
  }
  res.send(formatResponse(200, "", result.data));
});

/* 恢复登录状态 */
router.get('/whoami', async function(req, res, next) {
  // 从客户端请求获取token，解析token，还原信息
  const token = analysisToken(req.get("Authorization"))
  // 返回客户端
  res.send(formatResponse(200, "", { 
    id: token.id, 
    loginId: token.loginId, 
    name: token.name 
  }))
})

/* 修改管理员 */
router.put('/', async function(req, res, next) {
  res.send(await updateService(req.body));
})


module.exports = router;
