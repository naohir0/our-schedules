'use strict';
const request = require('supertest');
const app = require('./app');
const passportStub = require('passport-stub');
const User = require('./models/user');
const Schedule = require('./models/schedule');
const Comment = require('./models/comment');
const Candidate = require('./models/candidate');
const Member = require('./models/member');
const assert = require('assert');
const Topmemo = require('./models/topmemo');
const Avail = require('./models/availability');

describe('/schedules/:scheduleId/users/:userId/candidates/:candidateId',()=>{
  before(()=>{
    passportStub.install(app);
    passportStub.login({id:0,username:'testuser'});
  });
  after(()=>{
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('コメントが更新できる',(done)=>{
    User.upsert({userId:0,username:'testuser'}).then(()=>{
      request(app)
       .post('/schedules')
       .send({scheduleName:'テスト旅行',memo:'テストメモ',candidates:'テスト予定日',members:'tanaka/1111'})
       .expect('Location','/')
       .expect(302)
       .end((err,res)=>{
         if(err){return console.log('Error 1')}
         Schedule.findOne({
           where:{scheduleName:'テスト旅行'}
         }).then((s)=>{
           const scheduleId = s.scheduleId;
           request(app)
            .post(`/schedules/${scheduleId}/users/0/comment`)
            .send({newcomment:'テスト大好き'})
            .expect('{"status":"OK","comment":"テスト大好き"}')
            .end((err,res)=>{
              if(err){return console.log('ERROR 2')}
              Comment.findAll(
                {
                  where:{scheduleId:scheduleId}
                }
              ).then((c)=>{
               assert.equal(c.length,1);
               assert.equal(c[0].comment,'テスト大好き');
               deleteScheduleAggregate(scheduleId, done, err);
              })
            })
         })
       })
    })
  });
  
  it('メンバー以外はコード検索できない',(done)=>{
    User.upsert({userId:0,username:'testuser'}).then(()=>{
      request(app)
       .post('/enters')
       .send({identer:'84c0999d-6183-4ed4-a77e-631fd40e5756'})
       .expect(401)
       .end((err,res)=>{
         if(err){return console.log('ERROR 4')}
         done();
       })
    })
  });
  it('作成者はメモを削除できる',(done)=>{
    request(app)
     .post('/topmemo')
     .send({topmemo:'テストメモ削除'})
     .expect('Location','/')
     .expect(302)
     .end((err,res)=>{
       if(err){console.log('ERROR 5')}
       Topmemo.findOne({
         where:{memo:'テストメモ削除'}
       }).then((t)=>{
         assert.equal(t.userId,0);
         const id = t.id;
         request(app)
          .post(`/topmemo/delete/${id}`)
          .expect('Location','/')
          .expect(302)
          .end((err,res)=>{
            if(err){return console.log('ERROR 6')}
            request(app)
             .get('/')
             .expect(200)
             .end((err,res)=>{
               if(err){return console.log('予想通りです')}
               done();
             })
          })
       })
     })
  });
  it('メモ作成者以外は削除できない',(done)=>{
     Topmemo.findOne({
       where:{memo:'84c0999d-6183-4ed4-a77e-631fd40e5756/播州赤穂ぶらり旅'}
     }).then((t)=>{
       const id = t.id;
       request(app)
        .post(`/topmemo/delete/${id}`)
        .expect(400)
        .end((err,res)=>{
          if(err){return console.log('ERROR 7')}
          done();
        })
     })
  })
})

describe('tanaka/1111',()=>{
  before(()=>{
    passportStub.install(app);
    passportStub.login({id:1111,username:'tanaka'})
  });
  after(()=>{
    passportStub.logout();
    passportStub.uninstall(app);
  });
  it('メンバーがコメントできる',(done)=>{
    User.upsert({userId:1111,username:'tanaka'}).then(()=>{
    request(app)
     .post('/enters')
     .send({identer:'585d58da-4c96-4be2-b0fd-109ea976f14f'})
     .expect(302)
     .end((err,res)=>{
       request(app)
        .get('/schedules/585d58da-4c96-4be2-b0fd-109ea976f14f')
        .expect(/tanaka/)
        .expect(/テスト運動会/)
        .expect(200)
        .end((err,res)=>{
          if(err) {return console.log('ERROR8 /scheudle/:id')}
          request(app)
           .post('/schedules/585d58da-4c96-4be2-b0fd-109ea976f14f/users/1111/comment')
           .send({newcomment:'私は田中です'})
           .expect('{"status":"OK","comment":"私は田中です"}')
           .end((err,res)=>{
             if(err){return console.log('ERROR8 コメント送信エラーです')}
            request(app)
             .get('/schedules/585d58da-4c96-4be2-b0fd-109ea976f14f')
             .expect(200)
             .expect(/私は田中です/)
             .end((err,res)=>{
               if(err){return console.log('ERROR8 コメントが更新されていません')}
               done();
             })
           })
        })
     })
  })
 });
  it('メンバーが予定を変更できる',(done)=>{
    request(app)
     .get('/schedules/585d58da-4c96-4be2-b0fd-109ea976f14f')
     .expect(200)
     .expect(/tanaka/)
     .expect(/出欠表/)
     .end((err,res)=>{
       Schedule.findOne({
         where:{scheduleId:'585d58da-4c96-4be2-b0fd-109ea976f14f'}
       }).then((s)=>{
         Candidate.findOne({
           where:{scheduleId:'585d58da-4c96-4be2-b0fd-109ea976f14f'}
         }).then((c)=>{
           const scheduleId = s.scheduleId;
           const candidateId = c.candidateId;
           request(app)
            .post(`/schedules/${scheduleId}/users/1111/candidates/${candidateId}`)
            .send({avail:1,scheduleId:scheduleId})
            .end((err,res)=>{
              if(err){return console.log(`ERROR9 予定送信エラー ${candidateId}`)}
              request(app)
               .get('/schedules/585d58da-4c96-4be2-b0fd-109ea976f14f')
　　　　　　　　　.expect(200)
               .end((err,res)=>{
                 if(err){return console.log('ERROR9 表示エラー')}
                 Avail.findOne({
                   where:{
                       candidateId:30,
                       userId:1111,
                       scheduleId:'585d58da-4c96-4be2-b0fd-109ea976f14f'
                   }
                 }).then((a)=>{
                   const id = a.availability;
                   assert.equal(id,1)
                   done();
                 })
               })
            })
         })
       })
     })
  })
})

function deleteScheduleAggregate(scheduleId, done, err){
      Comment.findAll({
        where:{scheduleId:scheduleId}
      }).then((comments)=>{
        const promises = comments.map((m)=>{return m.destroy()});
        Promise.all(promises).then(()=>{   
          Schedule.findById(scheduleId).then((s)=>{
            s.destroy().then(()=>{
              if(err) done(err);
              done();
            })
          })
        })
      })
}

function deleteEditItems(scheduleId,done,err){
     Candidate.findAll({
       where:{scheduleId:scheduleId}
     }).then((cs)=>{
       const promises = cs.map((c)=>{return c.destroy()});
       Promise.all(promises).then(()=>{
         Member.findOne({
           where:{scheduleId:scheduleId}
         }).then((members)=>{
            members.destroy().then(()=>{
              Schedule.findById(scheduleId).then((s)=>{
                s.destroy().then(()=>{
                  if(err) done(err);
                  done();
                })
            })
         })
         })
       })
     })
}