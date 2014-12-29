// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
	res.render('hello', { message: 'Congrats, you just set up your app!' });
});


app.get('/youmi', function(req, res){

	AV.Cloud.httpRequest({
		method: 'POST',
		url: 'https://leancloud.cn/1.1/classes/YoumiRecord',
		headers: {
			'Content-Type': 'application/json',
			'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w',
			'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg'
		}
		body: {
			callback: 'testing'
		},
		success: function(httpResponse) {
			console.log(httpResponse.text);
		},
		error: function(httpResponse) {
			console.error('Request failed with response code ' + httpResponse.status);
		}
	});
	res.json({});
});


// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
