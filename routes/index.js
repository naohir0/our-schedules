var express = require('express');
var router = express.Router();
var Schedule = require('../models/schedule');
var authensure = require('./authenticate');

/* GET home page. */
router.get('/',authensure, (req, res, next)=>{
      Schedule.findAll({
        where:{createdBy:req.user.id},
        order:[['"updateAt"','DESC']]
      }).then((schedules)=>{
        res.render('index',{
          schedules:schedules,
          user:req.user,
          title:'OUR-SCHEDULES'
        });
      })
});

module.exports = router;
