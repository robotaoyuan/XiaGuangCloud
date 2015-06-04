/**
 * Created by YunTop on 15/5/29.
 */
var weChat = require('./weChat');

module.exports = function(app){

    /**
     *  处理微信相关逻辑
     */
    app.use('/weChat',weChat);

};