// Create by Silence on 15/5/11.
var request = require('request');

var headers = {
    'Content-Type':'application/json',
    'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg',
    'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w'
};

exports.GetAllMall = function(callBack){
    request.get({
        'url':'https://api.leancloud.cn/1.1/classes/Mall?where={"ready":true}',
        'headers':headers
    },function(error,response,body){
        if(!error){
            var results = JSON.parse(body)["results"];
            if (results.length > 0) {
                callBack(null,results);
                return;
            }
        }
        callBack(error,null);
    });

};