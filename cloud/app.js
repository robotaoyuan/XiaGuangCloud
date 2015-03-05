// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var crypto = require('crypto');
var querystring = require('querystring');
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
	callback = req.param('callback_url');
	mac = req.param('mac');
	ifa = req.param('ifa');

	AV.Cloud.httpRequest({
		method: 'POST',
		url: 'https://leancloud.cn/1.1/classes/YoumiRecord',
		headers: {
			'Content-Type': 'application/json',
			'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w',
			'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg'
		},
		body: {
			'ifa': ifa,
			'callback': callback,
			'mac': mac,
			'sent': false
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

app.get('/dianping_has_groupBuying',function(req,res){
    var json = {};
    var shopId = req.param("shopId");
    if (shopId == undefined) {
        res.json({});
    }
    avCloudHttp(shopId,function(has){
        if(has != null){
            json = {
                status: 'OK',
                has : has
            };
        }else{
            json = {
                status: 'Error',
                message: 'return error'
            };
        }
        res.json(json);
    });
});

app.post('/update_xiaguang_cloud',function(req,res){
    var shopId = req.body.shopId;
    var objectId = req.body.objectId;
    if (shopId == undefined || objectId == undefined){
        res.json({
            'status':'Error',
            'message':'无效参数shopId或objectId'
        });
    }
    shopId = parseInt(shopId);
    AV.Cloud.httpRequest({
        method:'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        url:'http://xiaguang.avosapps.com//dianping_has_groupBuying?shopId=' + shopId,
        success: function(response){
            var json = JSON.parse(response.text);
            if (json['status'] == "OK"){
                var has_deal = json['has'];
                AV.Cloud.httpRequest({
                    method: 'PUT',
                    url: 'https://leancloud.cn/1.1/classes/Merchant/' + objectId,
                    headers:{
                        'Content-Type': 'application/json',
                        'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w',
                        'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg'
                    },
                    body: {
                        'has_deal':has_deal
                    },
                    success: function(response){
                        res.json({
                            'status':'OK',
                            'message':'Update success'
                        });
                    },
                    error: function(response){
                        res.json({
                            'status':'Error',
                            'message':'Update Error'
                        });
                    }
                });

            }
        },
        error: function(response){
            res.json({
                'status': 'Error',
                'message': '请求错误'
            });
        }
    });
});

function avCloudHttp(shopId,callBack){
    //参数列表
    var param = {};
    param["business_id"] = shopId;
    param["sign"] = appSign(param,_dzdpAppKey,_dzdpSecret);
    param["appkey"] = _dzdpAppKey;

    AV.Cloud.httpRequest({
        method:'GET',
        url:'http://api.dianping.com/v1/business/get_single_business?' + querystring.stringify(param),
        success:function(httpResults){
            var result = JSON.parse(httpResults.text);
            var _has;
            if (result['status'] == 'OK'){
                var businesses = result['businesses'][0];
                callBack(businesses['has_deal']);
            }
        },
        error: function(httpResults){
            callBack(null);
        }
    });
}

function appSign(param,appkey,secret){
    var array = new Array();
    for (var key in param) {
        array.push(key);
    }
    array.sort();

    var paramArray = new Array();
    paramArray.push(appkey);
    for (var index in array){
        var key = array[index];
        var paramKey = param[key];
        paramArray.push(key + paramKey);
    }
    paramArray.push(secret);

    var shaSource = paramArray.join("");
    var sign =  crypto.createHash('sha1').update(shaSource , 'utf8').digest('hex').toUpperCase();
    return sign;
}
// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
