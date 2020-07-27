'use strict';
const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const User = require('../models/user');
const authensure = require('./authenticate');
const Schedule = require('../models/schedule');
const Candidate = require('../models/candidate');
const Availability = require('../models/availability');
const Comment = require('../models/comment');

router.get('/new',authensure,(req,res,next)=>{
    res.render('new',{
      user:req.user
    })
});

router.post('/',authensure,(req,res,next)=>{
    const scheduleId = uuid.v4();
    const updateAt = new Date();

    Schedule.create({
      scheduleId:scheduleId,
      scheduleName:req.body.scheduleName,
      memo:req.body.memo,
      createdBy:req.user.id,
      updateAt:updateAt
    }).then(()=>{
      const candidateData = req.body.candidates.trim().split('\n').map((c)=>{return c.trim()}).filter((f)=>{return f !== ""});
      const candidates = candidateData.map((c)=>{
        return {
           candidateName:c,
           scheduleId:scheduleId
        }
      });
      Candidate.bulkCreate(candidates).then(()=>{
        res.redirect('/')
      })
    })
});

router.get('/:scheduleId',authensure,(req,res,next)=>{
     Schedule.findOne({
       include:[
         {
           model:User,
           attributes:['userId','username']
         }
       ],
       where:{scheduleId:req.params.scheduleId}
     }).then((schedule)=>{
       if(schedule){
         Candidate.findAll({
           where:{scheduleId:schedule.scheduleId},
           order:[['"candidateId"','ASC']]
         }).then((candidates)=>{
            Availability.findAll({
              include:[
                {
                  model:User,
                  attributes:['userId','username']
                }
              ],
              where:{scheduleId:schedule.scheduleId},
              order:[[User,'username','ASC'],['"candidateId"','ASC']]
            }).then((Availabilities)=>{
              const availMapMap = new Map();
              Availabilities.forEach((a)=>{
                const availMap = availMapMap.get(a.User.userId) || new Map();
                availMap.set(a.candidateId,a.availability);
                console.log(availMap.size);
                availMapMap.set(a.User.userId,availMap);
              });
              console.log('以下、mapのサイズ');
              console.log(availMapMap.size);

              const userMap = new Map();
              Availabilities.forEach((a)=>{
                userMap.set(a.User.userId,{
                  isSelf:parseInt(req.user.id) === a.User.userId,
                  userId:a.User.userId,
                  username:a.User.username
                })
              });
             userMap.set(parseInt(req.user.id),{
               isSelf:true,
               userId:parseInt(req.user.id),
               username:req.user.username
             });
             const users = Array.from(userMap).map((m)=>{return m[1]});
             users.forEach((u)=>{
               candidates.forEach((c)=>{
                const map = availMapMap.get(u.userId) || new Map();
                const a = map.get(c.candidateId) || 0;
                map.set(c.candidateId,a);
                console.log(map.size);
                availMapMap.set(u.userId,map);
               })
             });
            
            Comment.findAll({
              where:{scheduleId:schedule.scheduleId},
              order:[['"userId"','ASC']]
            }).then((comments)=>{
              const commentMap = new Map();
              commentMap.set(parseInt(req.user.id),'');
              comments.forEach((c)=>{
                commentMap.set(c.userId,c.comment)
                });
                console.log(availMapMap.size);
                console.log('/:scheduleIdのページの表示は完了です')
                res.render('schedule',{
                 requser:req.user,
                 schedule:schedule,
                 availMapMap:availMapMap,
                 candidates:candidates,
                 users:users,
                 commentMap:commentMap
                });
             })
           })
         })
       }
     })
});

router.get('/:scheduleId/edit',authensure,(req,res,next)=>{
  
  Schedule.findOne({
    where:{scheduleId:req.params.scheduleId}
  }).then((schedule)=>{
    if(isMine(req,schedule)){
      Candidate.findAll({
        where:{scheduleId:req.params.scheduleId},
        order:[['"candidateId"','ASC']]
      }).then((candidates)=>{
         res.render('edit',{
           schedule:schedule,
           candidates:candidates
         })
      })
    } else {
      const err = new Error('指定された予定がない、または、予定する権限がありません');
      err.status = 404;
      next(err);
    }
  })
})

function isMine(req,schedule){
   return schedule && parseInt(req.user.id) === schedule.createdBy
}

router.post('/:scheduleId',authensure,(req,res,next)=>{
    Schedule.findOne({
      where:{scheduleId:req.params.scheduleId}
    }).then((schedule)=>{
      if(isMine(req,schedule)){
        if(parseInt(req.query.edit) === 1){
          const updateAt = new Date();
          Schedule.upsert({
            scheduleId:schedule.scheduleId,
            scheduleName:req.body.scheduleName,
            memo:req.body.memo,
            createdBy:req.user.id,
            updateAt:updateAt
          }).then(()=>{
            const candidateData = req.body.candidates.trim().split('\n').map((c)=>{return c.trim()}).filter((f)=>{return f !== ""});
            const candidates = candidateData.map((c)=>{
              return {
                candidateName:c,
                scheduleId:schedule.scheduleId
              }
            });
            Candidate.bulkCreate(candidates).then(()=>{
              res.redirect(`/schedules/${schedule.scheduleId}`);
            })
          })
        } else if(parseInt(req.query.delete) === 1){
            deleteAllElements(schedule,()=>{
              res.redirect('/');
            });
        } else {
          const err = new Error('不正なリクエストです');
          err.status = 400;
          next(err);
        }
      } else {
        const err = new Error('指定された予定がない、または、予定する権限がありません');
        err.status = 404;
        next(err);
      }
    })
})

function deleteAllElements(schedule,done,err){
  Availability.findAll({
    where:{scheduleId:schedule.scheduleId}
  }).then((avail)=>{
    const promises = avail.map((a)=>{return a.destroy()});
    return Promise.all(promises)
  }).then(()=>{
      Candidate.findAll({
        where:{scheduleId:schedule.scheduleId}
      }).then((candidates)=>{
        const promises = candidates.map((c)=>{return c.destroy()});
         return Promise.all(promises)
      }).then(()=>{
          Comment.findAll({
            where:{scheduleId:schedule.scheduleId}
          }).then((comments)=>{
            const promises = comments.map((c)=>{return c.destroy()});
            return Promise.all(promises)
          }).then(()=>{
              Schedule.findOne({
                where:{scheduleId:schedule.scheduleId}
              }).then((s)=>{
                return s.destroy().then(()=>{
                  if(err) return done(err);
                  done();
                })
              })
            })
          })
  })
}

module.exports = router;
