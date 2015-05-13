// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var querystring = require('querystring');
var crypto = require('crypto');
var path = require('path');
var request = require('request');
var app = express();

//大众点评应用key和secret
var _dzdpAppKey = '57766395';
var _dzdpSecret = 'bc60b050c4404bb4b6fb4c3739fdac56';

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
app.use(express.static(path.join(__dirname,'public')));

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

app.get('/coupon',function(req,res){
    var count = req.param('count');
    var mallId = req.param('mallId');
    var param = {
        'has_deal':true,
        'mall':{
            '__type':'Pointer',
            'className':'Mall',
            'objectId':mallId
        },
        'shopId':{
            '$exists':true,
            '$nin':['',' ']
        },
        'Icon':{
            '$exists':true
        }
    };
    request.get({
        'url':'https://leancloud.cn/1.1/classes/Merchant?limit=' + count + '&where=' + JSON.stringify(param),
        'headers':{
            'content-Type':'application/json',
            'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg',
            'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w'
        }
    },function(error,response,body){
        if(error){
            res.send({
                'status':'Error',
                'message':'请联系管理人员解决'
            });
            return;
        }
        var results = JSON.parse(body)['results'];
        if (results.length > 0){
            var shopIds = undefined;
            results.forEach(function(result){
                if(shopIds == undefined){
                    shopIds = result.shopId;
                }else{
                    shopIds = shopIds + ',' + result.shopId;
                }
            });
            param = {};
            param['business_ids'] = shopIds;
            param['sign'] = appSign(param,_dzdpAppKey,_dzdpSecret);
            param['appkey'] = _dzdpAppKey;
            request.get({
                'url':'http://api.dianping.com/v1/business/get_batch_businesses_by_id?' + querystring.stringify(param)
            },function(error,response,body){
                if(error){
                    res.send({
                        'status':'Error',
                        'message':'请联系管理人员解决'
                    });
                    return;
                }
                var result = JSON.parse(body);
                var businesses = result.businesses;
                var coupons = [];
                for (var index = 0; index < businesses.length; ++index){
                    var business = businesses[index];
                    var coupon = {};
                    results.forEach(function(merchant){
                        if (merchant.shopId == business.business_id){
                            coupon['merchant'] = merchant.objectId;
                            coupon['deal'] = business.deals[0];
                            coupons.push(coupon);
                        }
                    });
                }
                res.send(coupons);
            });
        }else{
            res.send({
                'status':'OK',
                'results':[]
            });
        }
    });
});

app.get('/coupon_1',function(req,res){
    var count = req.param('count');
    var mallId = req.param('mallId');
    var param = {
        'has_deal':true,
        'mall':{
            '__type':'Pointer',
            'className':'Mall',
            'objectId':mallId
        },
        'shopId':{
            '$exists':true,
            '$nin':['',' ']
        },
        'Icon':{
            '$exists':true
        }
    };
    request.get({
        'url':'https://leancloud.cn/1.1/classes/Merchant?limit=' + count + '&where=' + JSON.stringify(param),
        'headers':{
            'content-Type':'application/json',
            'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg',
            'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w'
        }
    },function(error,response,body){
        if(error){
            res.send({
                'status':'Error',
                'message':'请联系管理人员解决'
            });
            return;
        }
        var results = JSON.parse(body)['results'];
        if (results.length > 0){
            var shopIds = undefined;
            results.forEach(function(result){
                if(shopIds == undefined){
                    shopIds = result.shopId;
                }else{
                    shopIds = shopIds + ',' + result.shopId;
                }
            });
            param = {};
            param['business_ids'] = shopIds;
            param['sign'] = appSign(param,_dzdpAppKey,_dzdpSecret);
            param['appkey'] = _dzdpAppKey;
            request.get({
                'url':'http://api.dianping.com/v1/business/get_batch_businesses_by_id?' + querystring.stringify(param)
            },function(error,response,body){
                if(error){
                    res.send({
                        'status':'Error',
                        'message':'请联系管理人员解决'
                    });
                    return;
                }
                var result = JSON.parse(body);
                var businesses = result.businesses;
                var coupons = [];
                for (var index = 0; index < businesses.length; ++index){
                    var business = businesses[index];
                    var coupon = {};
                    results.forEach(function(merchant){
                        if (merchant.shopId == business.business_id){
                            coupon['merchant'] = merchant.objectId;
                            coupon['name'] = merchant.name;
                            coupon['icon'] = merchant.Icon.url;
                            coupon['shopId'] = merchant.shopId;
                            coupon['address'] = merchant.address;
                            coupon['type'] = merchant.type;
                            coupon['deal'] = business.deals[0];
                            coupons.push(coupon);
                        }
                    });
                }
                res.send({'results':coupons});
            });
        }else{
            res.send({
                'status':'OK',
                'results':[]
            });
        }
    });
});

app.get('/not_icon_merchant',function(req,res){
    var mallId = '5510f93ee4b0e3088f8d428a';
    var param = {
        'mall': {
            '__type': 'Pointer',
            'className': 'Mall',
            'objectId': mallId
        },
        'Icon':{
            '$exists':false
        }
    };
    request.get({
        'url':'https://leancloud.cn/1.1/classes/Merchant?where=' + JSON.stringify(param),
        'headers':{
            'content-Type':'application/json',
            'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg',
            'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w'
        }
    },function(error,response,body){
        if(error){
            res.send({
                'status':'Error',
                'message':'请联系管理员'
            });
            return;
        }
        var results = JSON.parse(body)['results'];
        var objects = [];
        results.forEach(function(object){
            var merchant = object.name;
            objects.push(merchant);
        });
        res.send(objects);
    });
});

app.get('/near_mall',function(req,res){
    var latitude = req.query['latitude'];
    var longitude = req.query['longitude'];
    var maxMallId = req.query['maxMallId'];
    if (maxMallId == undefined){
        maxMallId = 100000;
    }else{
        if((typeof maxMallId) != 'number'){
            maxMallId = parseInt(maxMallId);
        }
    }

    if (latitude == undefined || longitude == undefined){
        res.send({
            'status':'Error',
            'message':'参数有误'
        });
        return;
    }

    var min =  Number.MAX_VALUE;
    var objectId,mallName,malllocaldbId;
    getCloudMalls(function(results){
        if (results == undefined) {
            res.send({
                'status':'Error',
                'message':'请联系管理人员'
            });
        }
        for (var index = 0; index < results.length; ++index){
            var result = results[index];
            var latitude2 = result['latitude'];
            var longitude2 = result['longitude'];
            var distance = distanceOnParams(latitude,longitude,latitude2,longitude2);
            if (distance < min){
                malllocaldbId = result['localId'];
                if (malllocaldbId != undefined || malllocaldbId != "" || parseInt(malllocaldbId) <= maxMallId){
                    min = distance;
                    objectId = result['objectId'];
                    mallName = result['name'];
                }
            }
        }

        res.send({
            'status':'OK',
            'nearMallId':objectId,
            'mallName':mallName,
            'mallLocalDBId':malllocaldbId,
            'distance':min
        });
        return;
    });


});

app.get('/new_near_mall',function(req,res){
    var latitude = req.query['latitude'];
    var longitude = req.query['longitude'];
    var localMallIds = req.query['localMallIds'];

    if (latitude == undefined || longitude == undefined){
        res.send({
            'status':'Error',
            'message':'参数有误'
        });
        return;
    }
    var mallcount = 0;
    var min =  Number.MAX_VALUE;
    var objectId,mallName,malllocaldbId;
    localMallIds.forEach(function(mallLocalId){
        if (typeof malllocalId != 'number'){
            mallLocalId = parseInt(mallLocalId);
        }
        var param = {
            'localId':mallLocalId,
            'ready':true
        };
        request({
            url:'https://leancloud.cn/1.1/classes/Mall?where=' + JSON.stringify(param),
            headers:{
                'Content-Type': 'application/json',
                'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w',
                'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg'
            }
        },function(error,response,body){
            var results = JSON.parse(body)['results'];
            ++mallcount;
            if (results.length > 0){
                var  result = results[0];
                var latitude2 = result['latitude'];
                var longitude2 = result['longitude'];
                var distance = distanceOnParams(latitude,longitude,latitude2,longitude2);
                if (distance < min){
                    malllocaldbId = result['localId'];
                    if (malllocaldbId != undefined || malllocaldbId != "" || parseInt(malllocaldbId) <= maxMallId){
                        min = distance;
                        objectId = result['objectId'];
                        mallName = result['name'];
                    }
                }
            }
            if(mallcount == localMallIds.length){
                res.send({
                    'status':'OK',
                    'nearMallId':objectId,
                    'name':mallName,
                    'localId':malllocaldbId,
                    'distance':min
                });
            }
        });
    });
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

app.get('/existence_PreferentialInformation',function(req,res){
    var mallObjectId = req.param('objectId');
    var param = {
        'mall':{"__type":"Pointer","className":"Mall","objectId":mallObjectId},
        'switch':true
    };
    request.get({
        url:'https://leancloud.cn/1.1/classes/PreferentialInformation?count=1&limit=0&where='+ JSON.stringify(param),
        headers:{
            'Content-Type': 'application/json',
            'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w',
            'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg'
        }
    },function(error,response,body){
        if(!error){
            var object= JSON.parse(body);
            if(object["count"] > 0){
                res.send({
                    'exidtence':true
                });
            }else{
                var where = {
                    'mall':{"__type":"Pointer","className":"Mall","objectId":mallObjectId},
                    'has_deal':true
                };
                request.get({
                    url:'https://leancloud.cn/1.1/classes/Merchant?count=1&limit=0&where=' + JSON.stringify(where),
                    headers:{
                        'Content-Type': 'application/json',
                        'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w',
                        'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg'
                    }
                },function(error,response,body){
                    if(!error){
                        body = JSON.parse(body);
                        if (body['count'] > 0){
                            res.send({
                                'exidtence':true
                            });
                        }else{
                            res.send({
                                'exidtence':false
                            });
                        }

                    }else{
                        res.send({
                            'exidtence':false
                        });
                    }
                });
            }
        }
    });
});



app.post('/change_merchant',function(req,res){
    var changeName = req.body.name;
    var shortName = req.body.shortName;
    if (shortName == undefined){
        shortName = changeName;
    }
    var icon = req.body.icon;
    var type = req.body.type;
    if (type == undefined){
        type = '待定 待定';
    }
    var uniId = req.body.uniId;
    console.log(changeName);
    if(uniId == undefined || changeName == undefined){
        res.send({
            'status':'Error',
            'message': '请求参数不正确'
        });
    }
    var params = {
        'uniId':uniId
    };

    AV.Cloud.httpRequest({
        method:'GET',
        headers:{
            'Content-Type': 'application/json',
            'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w',
            'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg'
        },
        url:'https://leancloud.cn/1.1/classes/Merchant?where=' + JSON.stringify(params),
        success:function(response){
            var result = JSON.parse(response.text)['results'][0];
            var objectId = result['objectId'];
            // 发送post请求时，body参数要改为字符串
            request.put({
               method:'PUT',
                url:'https://leancloud.cn/1.1/classes/Merchant/' + objectId,
                headers:{
                    'Content-Type':'application/json',
                    'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w',
                    'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg'
                },
                body: JSON.stringify({
                    'name': changeName,
                    'shortName': shortName,
                    'type':type,
                    'icon':icon
                })
            },function(error,response,body){
                if (error){
                  res.json({
                      'status':'Error',
                      'message':'更新失败'
                  });
                }else{
                    res.json(response);
                }
            });
        },
        error:function(response){
            res.json({
                'message':'更改失败,重新检查参数'
            });
        }
    });
});

app.post('/add_merchant',function(req,res){
    var uniId = req.body.uniId;
    var merchantName = req.body.name;
    var shortName = req.body.shortName;
    var mallObjectId = req.body.mallObjectId;
    var mall;
    if (mallObjectId != undefined){
        mall = {"__type":"Pointer","className":"Mall","objectId":mallObjectId};
    }else{
        mall = undefined;
    }
    var merchantAddress = req.body.address;
    var type = req.body.type;
    if (type == undefined){
        type = "待定 待定"
    }
    if (uniId == undefined || merchantName == undefined || shortName == undefined || merchantAddress == undefined){
        res.success('Error: 参数错误');
    };
    request.get({
        url:'https://leancloud.cn/1.1/classes/Merchant?where=' + JSON.stringify({'uniId':uniId}),
        headers:{
            'Content-Type':'application/json',
            'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w',
            'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg'
        }
    },function(error,response,body){
        if(error){
            res.send({
                'status':'Error',
                'message':'获取错误'
            });
        }else{
            var result = JSON.parse(body)['results'];

            if (result != undefined){
                if(result.length == 0){
                    request.post({
                        url:'https://leancloud.cn/1.1/classes/Merchant',
                        headers:{
                            'Content-Type':'application/json',
                            'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w',
                            'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg'
                        },
                        body: JSON.stringify({
                            'uniId':uniId,
                            'name':merchantName,
                            'shortName':shortName,
                            'address':merchantAddress,
                            'type':type,
                            'mall':mall
                        })
                    },function(error,response,body){
                        if(error){
                            res.send({
                                'status':'Error',
                                'message':'添加店铺失败'
                            });
                        }else{
                            res.send(body);
                        }
                    });
                }else{
                    res.send({
                        'status':'Error',
                        'message':'该uniId:' + uniId + '的对象已经存在'
                    });
                }
            }else {
                console.log('merchantName:' + merchantName);
            }
        }
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
        url:'http://localhost:3000/dianping_has_groupBuying?shopId=' + shopId,
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

function removeArrayItem(array,value) {
    var source = new Array();
    for (var index = 0;index < array.length; ++index){
         if (index != value){
             source.push(array[index]);
         }
    }
    return source;
}


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
            if (result['status'] == 'OK'){
                var has = undefined;
                var businesses = result['businesses'];
                if (businesses.length > 0){
                    has = businesses['has_deal'];

                }else{
                    has = false;
                }
                callBack(has);
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

function distanceOnParams(lat1,long1,lat2,long2){

    var EARTH_RADIUS = 6378137.0;
    var PI = Math.PI;
    var rad_latitude = lat1 * PI / 180;
    var rad_latitude2 = lat2 * PI / 180;
    var rad_longitude = long1 * PI / 180;
    var rad_longitude2 = long2 * PI / 180;

    var latitude_difference = rad_latitude - rad_latitude2;
    var longitude_difference = rad_longitude - rad_longitude2;

    // 备选 ： Math.sqrt(Math.pow(latitude_difference,2)  + Math.pow(longitude_difference,2)) * EARTH_RADIUS

    var ditance =  2 * Math.asin(Math.sqrt(Math.pow(Math.sin(latitude_difference / 2),2) + Math.cos(rad_latitude) * Math.cos(rad_latitude2) * Math.pow(Math.sin(longitude_difference / 2),2)));
    ditance =  ditance * EARTH_RADIUS;
    ditance = Math.round(ditance * 10000) / 10000.0;

    return ditance;
}


function getCloudMalls(callback){
    request({
        'url':'https://leancloud.cn/1.1/classes/Mall',
        'headers':{
            'content-Type':'application/json',
            'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg',
            'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w'
        }
    },function(error,res,body){
        if(!error){
            var results = JSON.parse(body)['results'];
            callback(results);
            return;
        }else{
            callback(undefined);
            return;
        }
    });
};

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
