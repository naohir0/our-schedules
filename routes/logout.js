'uesr strict';
const express = require('express');
const router = express.Router();

router.get('/',(req,res,next)=>{
  req.logout();
  res.render('index',{
    user:req.user,
    title: 'Our schedules'
  })
});

module.exports = router;