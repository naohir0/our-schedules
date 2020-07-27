'use strict';
const express = require('express');
const router = express.Router();
const authensure = require('./authenticate');
const Availability = require('../models/availability');

router.post('/:scheduleId/users/:userId/candidates/:candidateId',authensure,(req,res,next)=>{
    const scheduleId = req.params.scheduleId;
    const userId = req.params.userId;
    const candidateId = req.params.candidateId;
    const avail = req.body.avail;
    const s = req.body.scheduleId;
    console.log(`${avail}が送信されました`);
    console.log(`${s}がbodyとして送信されました`);
    Availability.upsert({
      candidateId:candidateId,
      userId:userId,
      scheduleId:scheduleId,
      availability:avail
    }).then(()=>{
      res.json({status:'OK', avail:avail})
    });
});

module.exports = router;