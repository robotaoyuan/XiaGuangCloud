/**
 * Created by YunTop on 15/5/29.
 */
var weChat = require('./weChat');
var schedule = require('./schedule');

module.exports = function(app){

    /**
     *  处理微信相关逻辑
     */
    app.use('/weChat',weChat);


    app.use('/schedule',schedule);
};