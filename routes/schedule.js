var schedule = require('express').Router();

var node_schedule = require('node-schedule');

var update_token = undefined;

schedule.get('/open_update_token',function(req,res,next){
    if(update_token != undefined){
        update_token.cancel();
        update_token = undefined;
    }

    var rule = new node_schedule.RecurrenceRule();
    rule.minute = 30;
    rule.second = 0;
    update_token = node_schedule.scheduleJob(rule,function(){
        // 7000秒更新一次token
        var date = new Date();
        console.log(  date.toDateString() + ':' + '更新了一次token');
    });
    res.send({'message' : '开启weChat Token更新'});
});

schedule.get('/cancel_update_token',function(req,res,next){
    if(update_token != undefined){
        update_token.cancel();
        update_token = undefined;
    }
    res.send({'message' : '关闭weChat Token更新'});
});


module.exports = schedule;