'use strict';
const express = require('express');
const router = express.Router();
const authensure = require('./authenticate');
const Topmemo = require('../models/topmemo');

router.post('/',authensure,(req,res,next)=>{
    const userId = req.user.id;
    const username = req.user.username;
    const memo = req.body.topmemo;
    Topmemo.create({
      userId:userId,
      username:username,
      memo:memo
    }).then(()=>{
      res.redirect('/')
    })
});

router.post('/delete/:memoid',authensure,(req,res,next)=>{
   const memoid = req.params.memoid;
   Topmemo.findOne({
     where:{id:memoid}
   }).then((m)=>{
     const isSelf = parseInt(req.user.id) === m.userId;
     if(isSelf===true){
       m.destroy().then(()=>{
         res.redirect('/')
       })
     } else {
       const err = new Error('不正なリクエストです');
       err.status = 400;
       next(err);
     }
   })
})

module.exports = router;