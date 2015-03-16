// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var querystring = require('querystring');
var crypto = require('crypto');
var request = require('request');
var app = express();

//大众点评应用key和secret
var _dzdpAppKey = '57766395';
var _dzdpSecret = 'bc60b050c4404bb4b6fb4c3739fdac56';

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

app.get('/near_mall',function(req,res){
    var latitude = req.query['latitude'];
    var longitude = req.query['longitude'];
    var maxMallId = req.query['maxMallId'];
    if (latitude == undefined || longitude == undefined){
        res.send({
            'status':'Error',
            'message':'参数有误'
        });
        return;
    }

    var min =  Number.MAX_VALUE;
    var objectId,mallName,malllocaldbId;
    getCloudMalls(maxMallId,function(results){
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
                malllocaldbId = result['localDBId'];
                if (malllocaldbId != undefined || malllocaldbId != ""){
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

function getCloudMalls(maxMallId,callback){
    var whereParam = {
        'localId':{"$lte":maxMallId}
    }
    request({
        'url':'https://leancloud.cn/1.1/classes/Mall?where=' + JSON.stringify(whereParam),
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
        headers: {
            'Content-Type': 'application/json'
        },
        url:'http://xiaguang.avosapps.com/dianping_has_groupBuying?shopId=' + shopId,
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

//app.post('/add_merchant_xlsx',function(req,res){
//    var file = req.files.file;
//    var xlsxPath = file['path'];
//    var xlsx  = nodeXlsx.parse(xlsxPath);
//    var dataArray = xlsx[0]['data'];
//    var objectId = '54f9447be4b0ec65c92f73a6';
//    dataArray = removeArrayItem(dataArray,0);
//    for (var index = 0;index < dataArray.length;++index){
//        var objcet = dataArray[index];
//        var uniId = objcet[8];
//        if (typeof uniId == "number"){
//            uniId = JSON.stringify(uniId);
//        }
//        request.post({
//            'url':'http://localhost:3000/add_merchant',
//            'headers':{
//                'content-type':'application/json'
//            },
//            'body':JSON.stringify({
//                'uniId':uniId,
//                'name':objcet[4],
//                'shortName':objcet[4],
//                'address':objcet[7],
//                'mallObjectId':objectId
//            })
//        },function(error,response,body){
//            if(!error){
//                console.log(body);
//            }else{
//
//            }
//        });
//    }
//    res.send();
//});

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
    param["sign"] = method.appSign(param,_dzdpAppKey,_dzdpSecret);
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
