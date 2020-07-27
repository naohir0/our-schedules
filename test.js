'use strict';
const request = require('supertest');
const app = require('./app');
const passportStub = require('passport-stub');
const User = require('./models/user');
const Candidate = require('./models/candidate');
const Schedule = require('./models/schedule');
const Availability = require('./models/availability');

describe('/schedules/:scheduleId/users/:userId/candidates/:candidateId',()=>{
  before(()=>{
    passportStub.install(app);
    passportStub.login({id:0,username:'testuser'});
  });
  after(()=>{
    passportStub.logout();
    passportStub.uninstall(app);
  });
  
  it('予定の更新ができる',(done)=>{
    User.upsert({userId:0,username:'testuser'}).then(()=>{
      request(app)
       .post('/schedules')
       .send({scheduleName:'テスト旅行',memo:'テストメモ',candidates:'テスト候補日'})
       .end((err,res)=>{
        if(err){return console.log('ERROR 1')}
        Schedule.findOne({
          where:{scheduleName:'テスト旅行'}
        }).then((s)=>{
          const scheduleId = s.scheduleId;
            Candidate.findOne({
              where:{scheduleId:scheduleId}
            }).then((candidate)=>{
              const userId = 0;
              request(app)
              .post(`/schedules/${scheduleId}/users/${userId}/candidates/${candidate.candidateId}`)
              .send({avail:2})
              .expect('{"status":"OK","avail":2}')
              .end((err)=>{
                if(err) {return 'ERROR 3 '}
                deleteScheduleAggregate(scheduleId, done, err);
              })
            })
          })
        })
      })
    })
    it('予定の個別のページに予定、メモ、候補日が表示される',(done)=>{
     User.upsert({userId:0,username:'testuser'}).then(()=>{
       request(app)
        .post('/schedules')
        .send({scheduleName:'テスト予定',memo:'テストメモ',candidates:'テスト候補日１'})
        .expect('Location','/')
        .expect(302)
        .end((err,res)=>{
          if(err){return console.log('ERROR 1')}
          Schedule.findOne({
            where:{scheduleName:'テスト予定'}
          }).then((s)=>{
            const scheduleId = s.scheduleId;
            request(app)
             .get('/')
             .expect(/テスト予定/)
             .expect(/OUR-SCHEDULES/)
             .end((err,res)=>{
              if(err){return console.log('ERROR 1')}
              request(app)
               .get(`/schedules/${scheduleId}`)
               .expect(/テスト予定/)
               .expect(/出欠表/)　　
               .expect(/テストメモ/)
               .expect(/テスト候補日１/)
               .expect(200)
               .end((err,res)=>{
                if(err){return console.log('ERROR 2')}
                deleteScheduleAggregate(scheduleId, done, err)
              })
             })
          })
        })
     })
    })
  })


function deleteScheduleAggregate(scheduleId, done, err){
    Availability.findAll({
      where:{scheduleId:scheduleId}
    }).then((availabilities)=>{
      const promises = availabilities.map((c)=>{return c.destroy()});
      Promise.all(promises).then(()=>{
        Candidate.findAll({
          where:{scheduleId:scheduleId}
        }).then((candidates)=>{
          const promises = candidates.map((c)=>{return c.destroy()});
          Promise.all(promises).then(()=>{
            Schedule.findById(scheduleId).then((s)=>{
              s.destroy().then(()=>{
                if (err) return done(err)
                done();
              })
            })
          })
        })
      })
    })
}