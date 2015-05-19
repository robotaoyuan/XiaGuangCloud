//Create by Silence on 15/05/08
var crypto = require('crypto');

/*
 * 该Cloud code中使用的方法
 */

/**
 *      计算方法: 获得两个经纬度之间的实际距离
 *      @param latitude1 纬度1
 *      @param latitude2 纬度2
 *      @param longitude1 经度1
 *      @param longitude2 经度2
 *      @return 两个经纬度之间的实际距离
 */
exports.CalculateTheDistance = function(latitude1,latitude2,longitude1,longitude2){
    var ditance = 0;
    if (latitude1 != undefined && latitude2 != undefined && longitude1 != undefined && longitude2 != undefined){
        var EARTH_RADIUS = 6378137.0;
        var PI = Math.PI;
        var rad_latitude = latitude1 * PI / 180;
        var rad_latitude2 = latitude2 * PI / 180;
        var rad_longitude = longitude1 * PI / 180;
        var rad_longitude2 = longitude2 * PI / 180;
        var latitude_difference = rad_latitude - rad_latitude2;
        var longitude_difference = rad_longitude - rad_longitude2;

        // 备选 ： Math.sqrt(Math.pow(latitude_difference,2)  + Math.pow(longitude_difference,2)) * EARTH_RADIUS

        ditance =  2 * Math.asin(Math.sqrt(Math.pow(Math.sin(latitude_difference / 2),2) + Math.cos(rad_latitude) * Math.cos(rad_latitude2) * Math.pow(Math.sin(longitude_difference / 2),2)));
        ditance =  ditance * EARTH_RADIUS;
        ditance = Math.round(ditance * 10000) / 10000.0;
    }

    return ditance;
};

/**
 *      签名算法: 大众点评中的签名算法
 *      @param param 大众点评去掉appkey和secret参数
 *      @param appkey 大众点评中的appkey
 *      @param secret 大众点评中的secret
 *      @return 加密后的字符串
 */
exports.DP_appSign = function(param,appkey,secret){
    // 获得所有的Key值
    var allKey = new Array();
    for (var key in param){
        allKey.push(key);
    }
    allKey.sort();

    // 大众点评的加密字符串
    var signValues = new Array();
    signValues.push(appkey);
    for (var index in allKey){
        var key = allKey[index];
        var value = param[key];
        signValues.push(key + value);
    }
    signValues.push(secret);

    var shaValue = signValues.join("");
    var sign = crypto.createHash('sha1').update(shaValue , 'utf8').digest('hex').toUpperCase();
    return sign;
};

/**
 *      判断适合的Content-type: 上传的类型
 *      @param fileName 通过后缀去判断
 *      @return 上传的类型
 */
exports.ContentType = function(fileName){
    var suffix = fileName.split('.')[1];
    var content_type = '';
    if(suffix == 'jpg' || suffix == 'jpeg' || suffix == 'JPG' || suffix == 'JPEG'){
        content_type = 'image/jpeg';
    }else if (suffix == 'png' || suffix == 'PNG'){
        content_type = 'image/png';
    }
    return content_type;
};

//{"name":"组合名：Sunshine","url":"http://mmbiz.qpic.cn/mmbiz/91ulOqFPqCn0DFXic9WXKCXKOOgnriaon0ichfGUM0EtZ4xIfjwOg43nawxh7qrpaHQvKpQbe5bj0QAuBsjnvBUww/0?wx_fmt=jpeg","cnt":266,"selected":false}

