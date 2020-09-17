'use strict';
const express = require('express');
const router = express.Router();
const authensure = require('./authenticate');
const Member = require('../models/member');

router.post('/',authensure,(req,res,next)=>{
   const enterpass = req.body.identer
   console.log(enterpass);
   Member.findOne({
      where:{scheduleId:enterpass}
   }).then((m)=>{
   const member = m.members;
   console.log(member);
   const applicant = `${req.user.username}/${req.user.id}`
   const regMember = new RegExp(applicant,'gi');
   const testauth = regMember.test(member);
   console.log(testauth);
   if(testauth===true){
      console.log('認証成功');
      res.redirect(`/schedules/${enterpass}`);
   } else {
      console.log('認証失敗');
      const err = new Error('スケジュール作成者からアクセスを許可されていません');
      err.status = 401;
      next(err);
   }
   });
})

module.exports = router;