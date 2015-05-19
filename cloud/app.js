// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var routes = require('cloud/model/routes');
var oldRoutes = require('cloud/model/oldRoutes');
var app = express();

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

// 用路由控制文件使Express的API服务可读性更强
routes(app);

// 旧的路由控制
oldRoutes(app);

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();