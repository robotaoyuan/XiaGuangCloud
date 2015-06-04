//Create by Silence on 15/05/08

var method = require('./method');

var mall = require('./mall');

var request = require('request');

var requsetChar = require('querystring');

var async = require('async');

var utility = require('./utility');

var fs = require('fs');

/*
 * 大众点评的 Key、Secret
 */
var dzdpAppkey = '57766395';
var dzdpSecret = 'bc60b050c4404bb4b6fb4c3739fdac56';


/*
 *  3.4.x node.js 路由控制
 */
module.exports = function(app){
    /**
     *      Get请求: 寻找最近的商城
     *      @param latitude 纬度(必填)
     *      @param longitude 经度(必填)
     *
     *      @success: 返回 distance,localId,name
     */
    app.get('/mall/find_near_mall',function(req,res){
        var latitude = req.query['latitude'];
        var longitude = req.query['longitude'];
        if (latitude != undefined && longitude != undefined) {
            mall.GetAllMall(function(error,malls){
                if(malls != undefined){
                    var minDistance = Number.MAX_VALUE;
                    var mall = undefined;
                    for (var index = 0;index < malls.length;index++){
                        var tmpMall = malls[index];
                        var distance = method.CalculateTheDistance(latitude,tmpMall['latitude'],longitude,tmpMall['longitude']);
                        if (distance < minDistance){
                            minDistance = distance;
                            mall = tmpMall;
                        }
                    }
                    var result = {
                        'status':'OK',
                        'results':{
                            'distance':minDistance,
                            'localId':mall['localId'],
                            'name': mall['name']
                        }
                    };
                    res.send(result);
                }else{
                    res.send(utility.error);
                }
            });
        }else{
            res.send(utility.parameter_error);
        }
    });

    /**
     *      Get请求: 获取带有优惠的商城
     *      @param mallId 商城Id(选填)
     *      @param skip 跳过数量(选填) 配合limit使用
     *      @param limit 获取数量(选填)
     *      @success: 返回 merchants 并带有一条优惠信息
     */
    app.get('/merchant/include_discount',function(req,res){
        var mallId = req.query['mallId'];
        var limit = req.query['limit'];
        var skip = req.query['skip'];
        var where = {
            "shopId" : {"$exists":true,"$nin":[""," "]},
            "has_deal" : true,
            "Icon" : {"$exists":true}
        };
        if (mallId != undefined){
            where["mall"] = {
                "__type":"Pointer",
                "className":"Mall",
                "objectId":mallId
            }
        }

        if (skip == undefined){
            skip = 0;
        }
        var url = "https://api.leancloud.cn/1.1/classes/Merchant?where=" + JSON.stringify(where);
        if (limit != undefined){
            url = "https://api.leancloud.cn/1.1/classes/Merchant?skip=" + skip + "&limit=" + parseInt(limit) + "&where=" + JSON.stringify(where)
        }
        var result = {
            'status':'OK',
            'results':[]
        };
        async.waterfall([
            function(callBack){
                request.get({
                    'url' : url,
                    'headers': utility.headers
                },function(error,response,body){
                    if(!error){
                        var queryResults = JSON.parse(body)["results"];
                        if (queryResults != undefined && queryResults.length > 0){
                            var results = new Array();
                            for (var index = 0;index < queryResults.length;index++){
                                var queryMerchant = queryResults[index];
                                var merchant = {
                                    'uniId' : queryMerchant['uniId'],
                                    'name': queryMerchant['name'],
                                    'shopId' : queryMerchant['shopId'],
                                    'merchantId' : queryMerchant['objectId']
                                };
                                results.push(merchant);
                            }
                            callBack(null,results);
                            return;
                        }
                        error = utility.bugError();
                    }
                    callBack(error,null);
                });
            },
            function(merchants,callBack){
                var results = new Array();
                async.eachSeries(merchants,function(merchant,callBack){
                        request.get({
                            'url':  utility.server_url + '/discount/shopId_discount?shopId=' + merchant['shopId']
                        },function(error,response,body){
                            var discount = JSON.parse(body);
                            if (!error && discount['status'] == 'OK'){
                                merchant['deal'] = discount['result']['deals'][0];
                                results.push(merchant);
                                callBack(null);
                            }else{
                                error = utility.bugError();
                                callBack(error);
                            }
                        });
                },function(error){
                    if (!error){
                        callBack(null,results);
                    }else{
                        error = error = utility.bugError();
                        callBack(error,null);
                    }

                });

            }
        ],function(error,results){
            if (error){
                res.send(utility.bugError());
                return;
            }

            var result = {
                'status':'OK',
                'results':  results
            };

            res.send(result);
        });
    });

    /**
     *      Get请求: 根据ShopId获取优惠
     *      @param shopId 对应的shopId(必填)
     *      @success: 返回 status shopId,count,has_deal,deals
     */
    app.get('/discount/shopId_discount',function(req,res){
        var shopId = req.query['shopId'];
        if (shopId != undefined){
            var param = {
                'business_id':shopId
            };
            param["sign"] = method.DP_appSign(param,dzdpAppkey,dzdpSecret);
            param["appkey"] = dzdpAppkey;
            request.get({
                'url':'http://api.dianping.com/v1/business/get_single_business?' + requsetChar.stringify(param)
            },function(error,response,body){
                if(!error){
                    var DP_Result = JSON.parse(body);
                    if (DP_Result['status'] == 'OK'){
                        var result = {
                            'status' : 'OK',
                            'result' : {
                                'shopId' : shopId,
                                'has_deal' : 0,
                                'deals' : []
                            }
                        };
                        if (DP_Result['count'] > 0){
                            var businesses = DP_Result['businesses'][0];
                            result['result']['has_deal'] = businesses["has_deal"];
                            result['result']['deals'] = businesses['deals'];
                        }
                        res.send(result);
                    }else{
                        console.log('大众点评的问题，返回的Status为Error');
                        res.send(utility.bugError());
                    }
                    return;
                }
                console.log('请求问题');
                res.send(utility.bugError());
            });
        }else {
            res.send(utility.parameter_error);
        }
    });

    /**
     *      Get请求: 获取适合的图片
     *      @param keys(必填) 关键字查找图片,以逗号分割
     *      @success: 返回 status imageObject: name,objectId,url,size
     */
    app.get('/file/get_image',function(req,res){
        var key = req.query['keys'];
        if (key == undefined){
            res.send(utility.parameter_error);
            return;
        }

        var keys = key.split(',');

        var where = {};
        if (keys.length <= 1){
            where = JSON.stringify({
                '$or' : [{'name':{"$regex":'(?i).*?'+  key.replace(/\s+/g,'') + '.*?'}},{'name' : {'$regex':'(?i).*?'+ key + '.*?'}}],
                'mime_type' : 'image/jpeg'
            });
        }else{
            var or = [];
            for (var index = 0;index < keys.length;index++){
                var queryKey = keys[index];
                if (queryKey != '' || queryKey != ' '){
                    or.push({'name':{"$regex":'(?i).*?'+  queryKey.replace(/\s+/g,'') + '.*?'}});
                    or.push({'name' : {'$regex':'(?i).*?'+ queryKey + '.*?'}})
                }
            }
            where = JSON.stringify({
                '$or' : or,
                'mime_type' : 'image/jpeg'
            });
        }
        request.get({
            url : 'https://api.leancloud.cn/1.1/classes/_File?order=-name&where=' + where,
            headers: utility.headers
        },function(error,response,body){
            var images = JSON.parse(body)['results'];
            var image = images[0];
            if (image != undefined){
                image = {
                    'name' : image['name'],
                    'objectId' : image['objectId'],
                    'url' : image['url'],
                    'size' : image['metaData']['size']
                };
                res.send({'statue':'OK','image' : image});
            }else{
                res.send({'statue':'OK','image' : {}});
            }
        });
    });


    /**
     *      Put请求: 更新商城优惠信息
     *      @param shopId 更新的shopId(必填)
     *      @param merchantId 更新的MerchantId(必填)
     *      @success: 返回 count,has_deal,deals
     */
    app.put('/update/merchant_discount',function(req,res){
        var merchantId = req.body['merchantId'];
        var shopId = req.body['shopId'];
        if(merchantId == undefined || shopId == undefined){
            res.send(utility.parameter_error);
            return;
        }
        async.waterfall([
            function(callBack){
                request.get({
                    'url':utility.server_url + '/discount/shopId_discount?shopId=' + shopId
                },function(error,response,body){
                    if(!error){
                        var result = JSON.parse(body);
                        var has_discount = false;
                        if (result['status'] == 'OK'){
                            has_discount = result['result']['has_deal'] == 0 ? false : true;
                        }
                        callBack(null,has_discount);
                    }else{
                        callBack(utility.bugError(),null);
                    }
                });
            },
            function(has_discount,callBack){
               request.put({
                   'url':'https://api.leancloud.cn/1.1/classes/Merchant/' + merchantId,
                   'headers':utility.headers,
                   'body': JSON.stringify({
                        'has_deal': has_discount
                   })
               },function(error,response,body){
                   if (!error){
                       callBack(null,has_discount);
                   }else{
                        callBack(utility.bugError(),null);
                   }
               });
            }
        ],function(error,has){
            if(!error){
                res.send({
                    'status':'OK',
                    'result' : {
                        'merchantId' : merchantId,
                        'shopId' : shopId,
                        'has' : has
                    }
                });
            }else{
                res.send(utility.bugError());
            }
        });

    });

    /**
     *      Put请求: 匹配店铺图片
     *      @param merchantId 需要匹配的MerchantId(必填)
     *      @success: 返回 status, message
     */
    app.put('/update/merchant_icon',function(req,res){
        var merchantId = req.body['merchantId'];
        var merchantName = undefined;
        if (merchantId == undefined){
            res.send(utility.parameter_error);
            return;
        }
        async.waterfall([
            function getMerchantKey(callBack){
                var where = JSON.stringify({
                    'objectId' : merchantId
                });
                request.get({
                    url : 'https://api.leancloud.cn/1.1/classes/Merchant?where=' + where,
                    headers : utility.headers
                },function(error,response,body){
                    var result = JSON.parse(body)['results'][0];
                    if (result != undefined){
                        var queryKey = result['shortName'];
                        merchantName = result['name'];
                        if (queryKey == undefined || queryKey == '' || queryKey == ' '){
                            queryKey = merchantName;
                        }else{
                            queryKey =  queryKey + ',' + merchantName;
                        }
                        callBack(null,queryKey);
                        return;
                    }
                    error = utility.bugError();
                    callBack(error,body);
                });
            },
            function findAppropriateIcon(key,callBack){
                request.get({
                    url : utility.server_url + '/file/get_image?keys=' + key,
                    headers : {
                        'Content-Type' : 'application/json'
                    }
                },function(error,response,body){
                    var objectId = JSON.parse(body)['image']['objectId'];
                    if (objectId != undefined){
                        request.put({
                            url : 'https://api.leancloud.cn/1.1/classes/Merchant/' + merchantId,
                            headers : utility.headers,
                            body : JSON.stringify({
                                'Icon' : {
                                    '__type' : 'File',
                                    'id' : objectId
                                }
                            })
                        },function(error,reponse,body){
                                var updateSuccess = JSON.parse(body)['updatedAt'] == undefined ? false : true;
                                if (updateSuccess) {
                                    var result = {
                                        'status': 'OK',
                                        'message': '更新' + merchantName + '成功'
                                    };
                                    callBack(null, result);
                                    return;
                                }
                                error = utility.bugError();
                                callBack(error,null);
                        });
                        return;
                    }
                    console.log(merchantName);
                    error = utility.bugError();
                    callBack(error,null);
                });
            }
        ],function(error,result){
            if (error){
                res.send(error);
            }else{res.send(result);
            }

        });
    });
};