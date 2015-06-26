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

route.get('/coupon',function(req,res,next){
    fs.readFile('./public/coupons.json','utf8',function(error,data){
        if(!error){
            var malls = JSON.parse(data);
            res.render('coupon' ,{'title' : '虾逛','malls':malls});
            return;
        }
        res.render('error');
    });
});

route.get('/jingji_coupon',function(req,res){
    res.render('jingji_coupon',{'title' : '京基百纳优惠劵'});
});


route.get('/jingji_guanzhu',function(req,res){
    res.render('jingji_guanzhu',{'title' : '京基百纳广场'});
});

module.exports = route;