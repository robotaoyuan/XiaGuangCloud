require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

AV.Cloud.define("RefreshMeachantDealData",function(req,res){
    var param = {
        shopId:{'$exists':true,'$nin':[""," "]}
    };
    AV.Cloud.httpRequest({
        method:'GET',
        url:'https://leancloud.cn/1.1/classes/Merchant?where=' + JSON.stringify(param),
        headers:{
            'Content-Type': 'application/json',
            'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w',
            'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg'
        },
        success:function(response){
            var result = JSON.parse(response.text);
            for (var index in result["results"]){
                var object = result["results"][index];
                AV.Cloud.httpRequest({
                    method:'POST',
                    url:"http://xiaguang.avosapps.com/update_xiaguang_cloud",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        objectId:object['objectId'],
                        shopId:object['shopId']
                    },
                    success:function(response){
                        console.log(response.text);
                    },
                    error:function(response){
                        console.log('更新错误');
                    }

                });
            }

        },
        error:function(response){
            console.log('查找Merchant错误');
        }
    });
});


