require("cloud/app.js");

var request = require('request');

var async = require('async');

var utility = require('cloud/model/utility');

// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:

/**
 *      定时更新方法: 更新商城优惠信息
 *
 *      @success: 更新成功
 */
AV.Cloud.define('update_discount_mall',function(req,res){
    var where = {
        "shopId" : {"$exists":true,"$nin":[""," "]}
    };
    async.waterfall([
        // 获取需要适配的数量
        function(callBack){
            request.get({
                'url':'https://api.leancloud.cn/1.1/classes/Merchant?count=1&limit=0&where=' + JSON.stringify(where),
                'headers': utility.headers
            },function(error,response,body){
                var result = JSON.parse(body);
                if (result != undefined){
                    var count = result['count'];
                    callBack(null,count);
                    return;
                }
                if(!error) {
                    error = new Error();
                }
                callBack(error);
            });
        },

        // 将数量按100一个的分组
        function(count,callBack){
            var counts = [];
            do {
                var value = count > 100 ? 100 : count;
                counts.push(value);
                count = count - 100;
            }while (count > 0);
            callBack(null,counts);
        },

        // 依次去拿100个商城去做匹配
        function(counts,callBack){
            var skip = 0;
            async.eachSeries(counts,function(limit,callBack){
                request.get({
                    'url' : 'https://api.leancloud.cn/1.1/classes/Merchant?limit=' + limit + '&skip=' + skip + '&where=' + JSON.stringify(where),
                    'headers' : utility.headers
                },function(error,response,body){
                    if (!error){
                        var merchants = JSON.parse(body)['results'];
                        async.eachSeries(merchants,function(merchant,callBack){
                            var body = {
                                'shopId':merchant['shopId'],
                                'merchantId' : merchant['objectId']
                            };
                            request.put({
                                'url': utility.server_url + '/update/merchant_discount',
                                'body' : JSON.stringify(body),
                                'headers': {
                                    'Content-Type':'application/json'
                                }
                            },function(error,response,body){
                                callBack();
                            });
                        },function(error){
                            skip += limit;
                            callBack();
                        });
                    }else{
                        skip += limit;
                        callBack();
                    }
                });
            },function(error){
                callBack(null,{'status':'OK','message':'更新数据'});
            });
        }
    ],function(error,result){
        res.success(result);
    });

});

/**
 *      方法: 匹配整个数据库中没有Icon的店铺
 *
 *      @success: 匹配成功
 */
AV.Cloud.define('match_cloud_icon',function(req,res){
    var where = JSON.stringify({
        'Icon' : {'$exists':false},
        'uniId' : {'$nin':['0','',' ']}
    });
    async.waterfall([
        function getNotIconMerchantCout(callBack){
            request.get({
                url : 'https://api.leancloud.cn/1.1/classes/Merchant?limit=0&count=1&where=' + where,
                headers : utility.headers
            },function(error,reponse,body){
                var count = JSON.parse(body)['count'];
                if (count > 0){
                    console.log('需要匹配的数量:' + count);
                    callBack(null,count);
                    return;
                }
                error = utility.bugError();
                callBack(error,null);
            });
        },
        function countOfGroup(count,callBack){
            var counts = [];
            do {
                var value = count > 100 ? 100 : count;
                counts.push(value);
                count = count - 100;
            }while (count > 0);
            callBack(null,counts);
        },
        function matchTheIcon(counts,callBack){
            var skip = 0;
            var matchError = 0;
            async.eachSeries(counts,function(limit,callBack){
                request.get({
                    'url' : 'https://api.leancloud.cn/1.1/classes/Merchant?skip=' + skip + '&limit=' + limit + '&where=' + where,
                    'headers' : utility.headers
                },function(error,response,body){
                    var merchants = JSON.parse(body)['results'];
                    if (merchants.length > 0){
                        async.eachSeries(merchants,function(merchant,callBack){
                            request.put({
                                'url' : utility.server_url + '/update/merchant_icon',
                                'headers' : {'Content-Type' : 'application/json'},
                                'body' : JSON.stringify({
                                    'merchantId' :  merchant['objectId']
                                })
                            },function(error,response,body){
                                var result = JSON.parse(body);
                                if (result['status'] != 'OK'){
                                    matchError++;
                                }else{
                                    console.log(body);
                                }
                                skip = matchError;
                                callBack();
                            });
                        },function(error){
                            console.log('ErrorCount:' + skip);
                            callBack();
                        })
                    }else{
                        callBack(null,utility.bugError());
                    }
                });
            },function(error){
                callBack(null,{'status':'OK','message':'匹配成功'})
            });
        }
    ],function(error,result){
        res.success(result);
    });
});