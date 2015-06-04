/**
 * Created by YunTop on 15/5/29.
 */
var route = require('express').Router();
var fs = require('fs');

route.get('/',function(req, res, next){
    fs.readFile('./public/mallData.json','utf8',function(error,data){
        if(!error){
            var malls = JSON.parse(data);
            res.render('weChatH5' ,{'title' : '虾逛','malls':malls});
            return;
        }
        res.render('error');
    });
});
module.exports = route;