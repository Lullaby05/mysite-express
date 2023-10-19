// 引包
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { expressjwt } = require('express-jwt');
const md5 = require('md5');
const session = require("express-session");
const { ForbiddenError, ServiceError, UnknownError } = require('./utils/errors');

// 默认读取项目根目录下.env文件
require("dotenv").config()
require("express-async-errors");
// 引入数据库
require('./dao/db');

// 引入路由
var adminRouter = require('./routes/admin');
var bannerRouter = require('./routes/banner');
var captchaRouter = require('./routes/captcha');
var uploadRouter = require('./routes/upload');
var blogTypeRouter = require('./routes/blogType');
var blogRouter = require('./routes/blog');

// 创建实例
var app = express();

// 使用session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))

// 使用中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 配置验证token接口
app.use(expressjwt({
  secret: md5(process.env.JWT_SECRET), // 密钥
  algorithms: ['HS256'] // 指定算法
}).unless({
  // 需要排除token验证的路由
  path:[
    { "url": "/api/admin/login", methods: ["POST"] },
    { "url": "/res/captcha", methods: ["GET"] },
    { "url": "/api/blog", methods: ["GET"] },
    { "url": /\/api\/blog\/\d/, methods: ["GET"] },
    { "url": "/api/banner", methods: ["GET"] },
    { "url": "/res/blogtype", methods: ["GET"] }
  ]
}))

// 使用路由中间件
app.use('/api/admin', adminRouter);
app.use('/api/banner', bannerRouter);
app.use('/res/captcha', captchaRouter);
app.use('/api/blogType', blogTypeRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/blog', blogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// 错误处理
app.use(function(err, req, res, next) {
  console.log('err.name>>>', err.name);
  console.log('err>>>', err);
  if(err.name === "UnauthorizedError") {
    res.send(new ForbiddenError("未登录，或登录已过期").toResponseJSON())
  } else if(err instanceof ServiceError) {
    res.send(err.toResponseJSON());
  } else {
    res.send(new UnknownError().toResponseJSON());
  }
});

module.exports = app;
