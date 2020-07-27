import { Router } from "express/lib/express";

Router.get(':schedule',(req,res,next)=>{
  Schedule.findOne({
    include:[
      {
        model:User,
        attributes:['userId','username']
      }
    ],
    where:{scheduleId:req.params.schedule},
  }).then((s)=>{
    Candidate.findAll({
      where:{scheduleId:s.scheduleId},
      order:['"candidateId"','ASC']
    }).then((candidates)=>{
      Avail.findAll({
        include:[
          {
            model:User,
            attributes:['userId','username']
          }
        ],
        where:{scheduleId:s.scheduleId},
        order:[['User','username','ASC'],['"candidateId"','ASC']]
      }).then((avails)=>{
         const MapMap = new Map();
         avails.forEach((avail)=>{
         const Map = MapMap.get(avail.User.userId) || new Map();
         Map.set(a.candidateId,a.avail);
         MapMap.set(avail.User.userId,Map);
         });
         const userMap = new Map();
         avails.forEach((a)=>{
           userMap.set(a.User.userId,{
             isSelf:parseInt(req.user.userid) === a.User.userId,
             userId:a.User.userId,
             username:a.User.username
           })
         });
         userMap.set(parseInt(req.user.userid),{
          isSelf:true,
          userId:parseInt(req.user.userId),
          username:req.user.username
         });
         const users = Array.from(userMap).map((C)=>{C[1]});
         users.forEach((u)=>{
           candidates.forEach((c)=>{
             const Map = MapMap.get(u.userId) || new Map();
             const a = Map.get(a.candidateId) || 0;
             Map.set(c.candidateId,a);
             MapMap.set(u.userId,Map);
           })
         })
      })
    })
  })
})