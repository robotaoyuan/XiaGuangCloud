//Create by Silence on 15/05/11
/*
 * HTTP头
 */
exports.headers = {
    'Content-Type':'application/json',
    'X-AVOSCloud-Application-Key': 'kzx1ajhbxkno0v564rcremcz18ub0xh2upbjabbg5lruwkqg',
    'X-AVOSCloud-Application-Id': 'p8eq0otfz420q56dsn8s1yp8dp82vopaikc05q5h349nd87w'
};

// 服务器URL
exports.server_url = 'http://xiaguang.avosapps.com';

/*
 * Error Message
 */
exports.error = {
    'status': "Error",
    'message': '请找程序猿帮你个傻逼解决问题(制作者除外)'
};

exports.bugError = function(){
    var error = new Error();
    error.status = 'Error';
    error.message = '找程序猿哥哥帮你看下Bug';
    return error;
};

exports.parameter_error = {
    'status': "Error",
    'message': '我只能告诉你: 你给的参数有误，自行解决，不要找程序猿'
};

/**
 *   本地DB的数据库字段
 */
exports.database_fields = {
    'Mall' : ["mallId","mallName","offset","regionIdentify","path","version","isNavi"],
    'Block' : ["blockId","blockName","comment",",mallId"],
    "Floor" : ["floorId","floorName","weight","mallId","blockId","comment","uniId","queue"],
    "MerchantInstance" : ["merchantInstanceId","majorAreaId","latitude","longtitude","merchantInstanceName","floorId","mallId","address","uniId"],
    "Door" : ["doorId","latitude","longtitude","uniId","comment","mallName"],
    "MajorArea" : ["majorAreaId","mapName","majorAreaName","mallId","floorId","isParking","worldToMapDistRatio","rank"],
    "MinorArea" : ["minorAreaId","majorAreaId","latitude","longtitude","minorAreaName"],
    "Beacon" : ["beaconId","minor","major","minorAreaId","comment"],
    "City" : ["identify","name"],
    "Region" : ["identify","name","city","isExistence"],
    "Bathroom" : ["bathroomId","majorAreaId","latitude","longtitude","comment"],
    "Elevator" : ["elevatorId","majorAreaId","latitude","longtitude","comment"],
    "Escalator" : ["escalatorId","majorAreaId","latitude","longtitude","comment","type"],
    "Exit" : ["exitId","majorAreaId","latitude","longtitude","comment"],
    "ServiceStation" : ["serviceStation","majorAreaId","latitude","longtitude","comment"],
    "ChargeEngine" : ["chargeEngineId","mallId","k","p","a","max","freeTime"]
};