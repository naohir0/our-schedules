var express = require('express');
var router = express.Router();
var Schedule = require('../models/schedule');
var authensure = require('./authenticate');
var Topmemo = require('../models/topmemo');
require('date-utils');

/* GET home page. */
router.get('/',authensure, (req, res, next)=>{
      Schedule.findAll({
        where:{createdBy:req.user.id},
        order:[['"updateAt"','DESC']]
      }).then((schedules)=>{
        Topmemo.findAll({
          where:{userId:req.user.id}
        }).then((memos)=>{
          res.render('index',{
            schedules:schedules,
            user:req.user,
            title:'OUR-SCHEDULES',
            memos:memos
          });
        })
      })
});

module.exports = router;
