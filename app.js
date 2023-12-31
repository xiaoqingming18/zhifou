var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();
const dbConfig = require('./database/dbConfig');

// 解决跨域问题
app.all("*",function(req,res,next){
  // 设置允许跨域的域名,*代表允许任意域名跨域
  res.header('Access-Control-Allow-Origin','*');
  // 允许的header类型
  res.header('Access-Control-Allow-Headers','content-type');
  // 跨域允许的请求方式
  res.header('Access-Control-Allow-Methods','DELETE,PUT,POST,GET,OPTIONS');
  if(req.method.toLowerCase() == 'options')
      res.send(200); // 让options 尝试请求快速结束
  else
      next();
})

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/api', indexRouter);
app.listen(3030,() => {
    console.log("后台服务已启动！");
    dbConfig.testConnect();
})




