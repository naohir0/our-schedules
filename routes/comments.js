'use strict';
const express = require('express');
const router = express.Router();
const authensure = require('./authenticate');
const Comment = require('../models/comment');

router.post('/:scheduleId/users/:userId/comment',authensure,(req,res,next)=>{
   const scheduleId = req.params.scheduleId;
   const userId = req.params.userId;
   const comment = req.body.newcomment;
   Comment.upsert({
     scheduleId:scheduleId,
     userId:userId,
     comment:comment
   }).then(()=>{
     res.json({status:'OK',comment:comment});
   })
})


module.exports = router;